import {
  CanvasLayoutEngine,
  type Layout,
  type LayoutElement,
  type LayoutedDiagram,
} from "@hylimo/diagram";
import {
  Canvas,
  CanvasConnection,
  CanvasElement,
  Text as HylimoText,
  LineEngine,
  LinePoint,
  Marker,
  Math2D,
  type CanvasConnectionSegment,
} from "@hylimo/diagram-common";
import type { Div, Edge, Graph, Node, Text } from "./HyLiMoTypes";

export class SemanticAnalyzer {
  readonly graph: Graph;
  readonly canvasLayoutEngine: CanvasLayoutEngine;

  constructor(
    readonly layout: Layout,
    root: LayoutElement,
    readonly layoutedDiagram: LayoutedDiagram
  ) {
    this.canvasLayoutEngine = new CanvasLayoutEngine(layout);
    this.graph = this.constructGraph(root);
  }

  private constructGraph(element: LayoutElement): Graph {
    if (element.layoutConfig.type !== Canvas.TYPE) {
      throw new Error("Root element is not a canvas");
    }
    return this.convertDiv(element) as Graph;
  }

  private convertDiv(element: LayoutElement): Div {
    const type = element.layoutConfig.type;
    if (type === Canvas.TYPE) {
      return this.convertCanvas(element);
    } else if (type === HylimoText.TYPE) {
      return this.convertText(element);
    } else {
      return {
        type,
        id: element.id,
        class: element.class,
        children: element.children.map((child) => this.convertDiv(child)),
        element,
      };
    }
  }

  private convertCanvas(element: LayoutElement): Graph {
    const nodes: Map<string, Node> = new Map();
    const edges: Map<string, Edge> = new Map();

    for (const child of element.children) {
      const type = child.layoutConfig.type;
      if (type === CanvasElement.TYPE) {
        nodes.set(child.id, this.convertNode(child));
      } else if (type === CanvasConnection.TYPE) {
        edges.set(child.id, this.convertEdge(child));
      }
    }

    for (const edge of edges.values()) {
      const layoutedEdge = this.layoutedDiagram.elementLookup[
        edge.id
      ] as CanvasConnection;
      const start = this.getLinePointTarget(layoutedEdge.start);
      if (start != undefined) {
        const startNode = nodes.get(start.element.id);
        if (startNode) {
          edge.start = startNode;
          startNode.outgoingEdges.push(edge);
        }
      }
      const end = this.getLinePointTarget(
        (
          layoutedEdge.children
            .filter((child) => !Marker.isMarker(child))
            .at(-1) as CanvasConnectionSegment
        ).end
      );
      if (end != undefined) {
        const endNode = nodes.get(end.element.id);
        if (endNode) {
          edge.end = endNode;
          endNode.incomingEdges.push(edge);
        }
      }
    }

    for (const node of nodes.values()) {
      const layoutedNode = this.layoutedDiagram.elementLookup[
        node.id
      ] as CanvasElement;
      if (layoutedNode.pos == undefined) continue;

      const target = this.getLinePointTarget(layoutedNode.pos);
      if (target?.element?.layoutConfig?.type !== CanvasConnection.TYPE)
        continue;

      const edge = edges.get(target.element.id);
      if (edge == undefined) continue;

      const layoutedConnection = target.layoutedElement as CanvasConnection;
      const line = this.canvasLayoutEngine.layoutLine(
        layoutedConnection,
        element.id
      ).line;
      const segments = line.segments;

      let segmentLengths: number[] = [0];
      let totalLength = 0;
      let currentPoint = line.start;
      for (const segment of segments) {
        const nextPoint = segment.end;
        const segmentLength = Math2D.distance(currentPoint, nextPoint);
        totalLength += segmentLength;
        segmentLengths.push(totalLength);
        currentPoint = nextPoint;
      }

      const { relativePosition, segment } =
        LineEngine.DEFAULT.normalizePosition(
          target.layoutedPoint.pos,
          target.layoutedPoint.segment,
          line
        );

      const position =
        (segmentLengths[segment] +
          relativePosition *
            (segmentLengths[segment + 1] - segmentLengths[segment])) /
        totalLength;

      edge.attachments.push({
        element: node,
        position:
          position < 1 / 3 ? "start" : position > 2 / 3 ? "end" : "middle",
      });
    }

    return {
      type: element.layoutConfig.type,
      id: element.id,
      class: element.class,
      children: [],
      element,
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges.values()),
    };
  }

  private convertNode(element: LayoutElement): Node {
    return {
      type: element.layoutConfig.type,
      id: element.id,
      class: element.class,
      children: element.children.map((child) => this.convertDiv(child)),
      element,
      outgoingEdges: [],
      incomingEdges: [],
    };
  }

  private convertEdge(element: LayoutElement): Edge {
    const layouted = this.layoutedDiagram.elementLookup[
      element.id
    ] as CanvasConnection;
    const startMarker = layouted.children.find(
      (child) => Marker.isMarker(child) && child.pos === "start"
    );
    const endMarker = layouted.children.find(
      (child) => Marker.isMarker(child) && child.pos === "end"
    );

    return {
      type: element.layoutConfig.type,
      id: element.id,
      class: element.class,
      element,
      attachments: [],
      startMarker: startMarker
        ? this.convertDiv(this.layout.layoutElementLookup.get(startMarker.id)!)
        : undefined,
      endMarker: endMarker
        ? this.convertDiv(this.layout.layoutElementLookup.get(endMarker.id)!)
        : undefined,
    };
  }

  private convertText(element: LayoutElement): Text {
    return {
      type: HylimoText.TYPE,
      id: element.id,
      class: element.class,
      text: element.children.map((span) => span.styles.text as string).join(""),
      children: [],
      element,
    };
  }

  private getLinePointTarget(pos: string) {
    const posElement = this.layout.layoutElementLookup.get(pos);
    if (
      posElement == undefined ||
      posElement.layoutConfig.type !== LinePoint.TYPE
    )
      return undefined;

    const layoutedPoint = this.layoutedDiagram.elementLookup[pos] as LinePoint;
    const lineProvider = layoutedPoint.lineProvider;
    const lineProviderElement =
      this.layout.layoutElementLookup.get(lineProvider)!;
    return {
      element: lineProviderElement,
      layoutedElement: this.layoutedDiagram.elementLookup[lineProvider],
      layoutedPoint,
    };
  }
}
