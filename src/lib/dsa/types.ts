export type StepColor = "idle" | "active" | "visited" | "done" | "warn" | "path";

export interface Step {
  line?: number;
  note?: string;
  payload: unknown;
}

export type RendererKind =
  | "bars"
  | "cells"
  | "list"
  | "tree"
  | "graph"
  | "grid"
  | "text"
  | "hash"
  | "bits"
  | "concept";

export interface TopicDef {
  slug: string;
  name: string;
  emoji: string;
  category: "ds" | "algo";
  group: string;
  complexity: { time: string; space: string };
  renderer: RendererKind;
  defaultInput: string;
  inputHint?: string;
  code: string; // language-agnostic pseudocode with line numbering matching Step.line
  explanation: string; // markdown-ish plain
  useCases: string[];
  generateSteps: (input: string) => Step[];
  ops?: OpDef[];
  runOps?: (commands: OpCommand[]) => Step[];
  initialCommands?: OpCommand[];
}

export interface OpArg {
  name: string;
  placeholder?: string;
  kind?: "number" | "string";
}
export interface OpDef {
  id: string;
  label: string;
  args?: OpArg[];
  description?: string;
  complexity?: { time: string; space: string };
}
export interface OpCommand {
  op: string;
  args: string[];
}

export interface BarsPayload {
  arr: number[];
  highlights?: Record<number, StepColor>;
  sorted?: number[];
  labels?: Record<number, string>;
}

export interface CellsPayload {
  arr: (number | string | null)[];
  highlights?: Record<number, StepColor>;
  pointers?: Record<string, number>;
  capacity?: number;
  extra?: string;
}

export interface ListNode {
  id: number;
  val: number | string;
  color?: StepColor;
}

export interface ListPayload {
  kind: "singly" | "doubly" | "circular";
  nodes: ListNode[];
  headIndex?: number;
  tailIndex?: number;
  pointers?: Record<string, number>;
}

export interface TreeNode {
  id: number;
  val: number | string;
  x: number;
  y: number;
  color?: StepColor;
  extra?: string;
}
export interface TreeEdge {
  from: number;
  to: number;
  color?: StepColor;
}
export interface TreePayload {
  nodes: TreeNode[];
  edges: TreeEdge[];
  width: number;
  height: number;
}

export interface GraphNode {
  id: string;
  label?: string;
  x: number;
  y: number;
  color?: StepColor;
  extra?: string;
}
export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  color?: StepColor;
  directed?: boolean;
}
export interface GraphPayload {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  distances?: Record<string, number | string>;
}

export interface GridPayload {
  rows: number;
  cols: number;
  cells: (string | number)[][];
  colors: (StepColor | undefined)[][];
  rowLabels?: string[];
  colLabels?: string[];
  caption?: string;
}

export interface TextPayload {
  text: string;
  pattern?: string;
  highlights?: { start: number; end: number; color: StepColor }[];
  patternHighlights?: { start: number; end: number; color: StepColor }[];
  extra?: string;
}

export interface HashPayload {
  buckets: { key: string; val: string; color?: StepColor }[][];
  highlightBucket?: number;
  probe?: number;
  extra?: string;
}

export interface BitsPayload {
  a: string; // binary string, MSB first
  b?: string;
  result?: string;
  op?: string;
  highlights?: number[]; // bit indices highlighted
}

export interface ConceptPayload {
  title: string;
  body: string;
  bullets?: string[];
  example?: string;
}
