import type { LayoutElement } from "@hylimo/diagram";

// --- Internal Graph Structure (Hylimo specific) ---
export interface Element {
  type: string;
  id: string;
  class: Set<string>;
  element: LayoutElement;
}

export interface Graph extends Div {
  nodes: Node[];
  edges: Edge[];
}

export interface Node extends Element {
  outgoingEdges: Edge[];
  incomingEdges: Edge[];
  children: Div[];
}

export interface Edge extends Element {
  start?: Node;
  end?: Node;
  startMarker?: Div;
  endMarker?: Div;
  attachments: EdgeAttachment[];
}

export interface EdgeAttachment {
  element: Node;
  position: "start" | "middle" | "end";
}

export interface Div extends Element {
  children: Element[];
}

export interface Text extends Div {
  text: string;
}

// --- Compact JSON Structure (For Frontend & LLM) ---
export interface CompactClass {
  name: string;
  members: string[];
  isAbstract: boolean;
}

export interface CompactEnum {
  name: string;
  entries: string[];
}

export interface CompactInterface {
  name: string;
  methods: string[];
}

export interface CompactPackage {
  name: string;
  contains: string[];
}

export interface CompactAssociation {
  from: string;
  to: string;
  relationshipType: string;
  labels: string[];
}

export interface CompactSemanticModel {
  classes: CompactClass[];
  enums: CompactEnum[];
  interfaces: CompactInterface[];
  packages: CompactPackage[];
  comments: string[];
  associations: CompactAssociation[];
}
