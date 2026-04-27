import type {
  CompactSemanticModel,
  Div,
  Edge,
  Element,
  Graph,
  Node,
  Text,
} from "./HyLiMoTypes";
import { SemanticEvaluator } from "./semanticEvaluator";

/**
 * Recursively searches through an element's children to find the text
 * labeled with the 'title' CSS class.
 */
function findTitle(element: Element): string | undefined {
  if (element.type === "text" && element.class.has("title")) {
    return (element as Text).text;
  }
  if ("children" in element) {
    for (const child of (element as Div).children) {
      const title = findTitle(child);
      if (title) return title;
    }
  }
  return undefined;
}

/**
 * Collects all text content within a node (attributes, methods, or enum entries).
 * It ignores elements marked as a 'title' or a UML 'keyword' (like <<interface>>).
 */
function findNodeMembers(element: Element, members: string[] = []): string[] {
  if (element.class.has("title") || element.class.has("keyword")) {
    return members;
  }
  if (element.type === "text") {
    const content = (element as Text).text.trim();
    if (content) members.push(content);
  } else if ("children" in element) {
    for (const child of (element as Div).children) {
      findNodeMembers(child, members);
    }
  }
  return members;
}

/**
 * Traverses the visual hierarchy to identify which top-level nodes are
 * nested inside a specific container (like a Package).
 */
function findContainedNodes(element: Element, allNodes: Node[]): Node[] {
  const contained: Node[] = [];
  if ("children" in element) {
    for (const child of (element as Div).children) {
      const nodeMatch = allNodes.find((n) => n.id === child.id);
      if (nodeMatch) {
        contained.push(nodeMatch);
      } else {
        contained.push(...findContainedNodes(child, allNodes));
      }
    }
  }
  return contained;
}

/**
 * Determines the UML relationship type by analyzing the CSS markers at the end
 * of a connection and the line style (solid vs dashed).
 */
function getMarkerType(edge: Edge): string {
  const markerClass = edge.endMarker?.class;
  const connectionClass = edge.class;

  // Detect Inheritance vs Interface Realization
  if (markerClass?.has("triangle-marker")) {
    return connectionClass.has("dashed-connection")
      ? "Realization"
      : "Inheritance";
  }

  // Detect Ownership and Association types
  if (markerClass?.has("filled-diamond-marker")) return "Composition";
  if (markerClass?.has("diamond-marker")) return "Aggregation";
  if (markerClass?.has("arrow-marker")) return "Directed Association";

  // Fallback for dependencies without markers
  if (connectionClass.has("dashed-connection")) return "Dependency";

  return "Association";
}

/**
 * Transforms the internal Hylimo Graph structure into the Compact Semantic JSON
 * format optimized for LLM analysis and frontend usage.
 */
function convertToCompactModel(graph: Graph): CompactSemanticModel {
  const model: CompactSemanticModel = {
    classes: [],
    enums: [],
    interfaces: [],
    packages: [],
    comments: [],
    associations: [],
  };

  const allNodes = graph.nodes;

  allNodes.forEach((node) => {
    const name = findTitle(node) || "Unknown";
    const members = findNodeMembers(node);

    if (node.class.has("class-element")) {
      model.classes.push({
        name,
        members,
        isAbstract: node.class.has("abstract"),
      });
    } else if (node.class.has("enum-element")) {
      model.enums.push({ name, entries: members });
    } else if (node.class.has("interface-element")) {
      model.interfaces.push({ name, methods: members });
    } else if (node.class.has("comment-element")) {
      model.comments.push(members.join(" ") || name);
    } else if (node.class.has("package-element")) {
      const contained = findContainedNodes(node, allNodes).map(
        (n) => findTitle(n) || n.id
      );
      model.packages.push({ name, contains: contained });
    }
  });

  graph.edges.forEach((edge) => {
    model.associations.push({
      from: findTitle(edge.start!) || "Unknown",
      to: findTitle(edge.end!) || "Unknown",
      relationshipType: getMarkerType(edge),
      labels: edge.attachments
        .map((a) => findNodeMembers(a.element).join(" "))
        .filter((l) => l !== ""),
    });
  });

  return model;
}

const evaluator = new SemanticEvaluator();

/**
 * The primary interface for the MEITREX Editor.
 * Accepts a Hylimo DSL string and returns the structured CompactSemanticModel.
 */
export async function getSemanticModel(
  source: string
): Promise<CompactSemanticModel> {
  const analysisResult = await evaluator.analyze(source);

  if (analysisResult.errors.length > 0) {
    throw new Error(
      `Analysis failed: ${JSON.stringify(analysisResult.errors)}`
    );
  }

  if (!analysisResult.graph) {
    throw new Error("Semantic analysis produced no graph result.");
  }

  return convertToCompactModel(analysisResult.graph);
}
