import type { Step, TreePayload, GraphPayload, StepColor } from "../types";
import { layoutBinaryTree, circleLayout } from "../layout";
import { parseNumberArray, parseGraph } from "../parse";

// Tree traversals (uses BST built from input) --------------------------
const buildBST = (nums: number[]): (number | null)[] => {
  const level: (number | null)[] = [];
  const insert = (idx: number, v: number) => {
    while (idx >= level.length) level.push(null);
    if (level[idx] === null || level[idx] === undefined) { level[idx] = v; return; }
    if (v < (level[idx] as number)) insert(2 * idx + 1, v);
    else insert(2 * idx + 2, v);
  };
  for (const n of nums) insert(0, n);
  return level;
};

const treeSnap = (values: (number | null)[], colors: Record<number, StepColor>): TreePayload => {
  const layout = layoutBinaryTree(values);
  return {
    ...layout,
    nodes: layout.nodes.map((n) => ({ ...n, color: colors[n.id] })),
  };
};

export function treeTraversalSteps(input: string): Step[] {
  const parts = input.split("|");
  const nums = parseNumberArray(parts[0], [5, 3, 8, 1, 4, 7, 9]);
  const order = (parts[1] ?? "inorder").trim().toLowerCase();
  const level = buildBST(nums);
  const steps: Step[] = [];
  const colors: Record<number, StepColor> = {};
  const visited: number[] = [];
  steps.push({ line: 1, note: `Traversal: ${order}`, payload: treeSnap(level, {}) });
  const visit = (i: number, lineNo: number) => {
    colors[i] = "active";
    steps.push({ line: lineNo, note: `visit node ${level[i]}`, payload: treeSnap(level, { ...colors }) });
    visited.push(level[i] as number);
    colors[i] = "done";
  };
  const pre = (i: number) => {
    if (i >= level.length || level[i] == null) return;
    visit(i, 2);
    pre(2 * i + 1);
    pre(2 * i + 2);
  };
  const ino = (i: number) => {
    if (i >= level.length || level[i] == null) return;
    ino(2 * i + 1);
    visit(i, 3);
    ino(2 * i + 2);
  };
  const post = (i: number) => {
    if (i >= level.length || level[i] == null) return;
    post(2 * i + 1);
    post(2 * i + 2);
    visit(i, 4);
  };
  if (order.startsWith("pre")) pre(0);
  else if (order.startsWith("post")) post(0);
  else ino(0);
  steps.push({ line: 5, note: `sequence: ${visited.join(", ")}`, payload: treeSnap(level, colors) });
  return steps;
}

// BFS on graph ----------------------------------------------------------
export function bfsSteps(input: string): Step[] {
  const { nodes, edges } = parseGraph(input);
  const start = nodes[0];
  const layout = circleLayout(nodes);
  const steps: Step[] = [];
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => (adj[n] = []));
  edges.forEach((e) => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
  const colors: Record<string, StepColor> = {};
  const edgeColor: Record<string, StepColor> = {};
  const snap = (extra?: string): GraphPayload => ({
    nodes: nodes.map((id) => ({ id, x: layout.map[id].x, y: layout.map[id].y, color: colors[id], label: id })),
    edges: edges.map((e) => ({ ...e, color: edgeColor[`${e.from}-${e.to}`] })),
    width: layout.width,
    height: layout.height,
    distances: extra ? { [start]: extra } : undefined,
  });
  steps.push({ line: 1, note: `BFS from ${start}`, payload: snap() });
  const q: string[] = [start];
  const seen = new Set([start]);
  colors[start] = "active";
  steps.push({ line: 2, note: `enqueue ${start}`, payload: snap() });
  while (q.length) {
    const u = q.shift()!;
    colors[u] = "visited";
    steps.push({ line: 3, note: `visit ${u}`, payload: snap() });
    for (const v of adj[u]) {
      if (!seen.has(v)) {
        seen.add(v);
        q.push(v);
        colors[v] = "active";
        edgeColor[`${u}-${v}`] = "path";
        edgeColor[`${v}-${u}`] = "path";
        steps.push({ line: 4, note: `discover ${v} from ${u}`, payload: snap() });
      }
    }
  }
  steps.push({ line: 5, note: "done", payload: snap() });
  return steps;
}

export function dfsSteps(input: string): Step[] {
  const { nodes, edges } = parseGraph(input);
  const start = nodes[0];
  const layout = circleLayout(nodes);
  const steps: Step[] = [];
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => (adj[n] = []));
  edges.forEach((e) => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
  const colors: Record<string, StepColor> = {};
  const edgeColor: Record<string, StepColor> = {};
  const snap = (): GraphPayload => ({
    nodes: nodes.map((id) => ({ id, x: layout.map[id].x, y: layout.map[id].y, color: colors[id], label: id })),
    edges: edges.map((e) => ({ ...e, color: edgeColor[`${e.from}-${e.to}`] })),
    width: layout.width,
    height: layout.height,
  });
  steps.push({ line: 1, note: `DFS from ${start}`, payload: snap() });
  const seen = new Set<string>();
  const rec = (u: string, parent?: string) => {
    seen.add(u);
    colors[u] = "active";
    steps.push({ line: 2, note: `visit ${u}`, payload: snap() });
    for (const v of adj[u]) {
      if (!seen.has(v)) {
        edgeColor[`${u}-${v}`] = "path";
        edgeColor[`${v}-${u}`] = "path";
        steps.push({ line: 3, note: `explore edge ${u}→${v}`, payload: snap() });
        rec(v, u);
      }
    }
    colors[u] = "done";
    steps.push({ line: 4, note: `backtrack from ${u}`, payload: snap() });
  };
  rec(start);
  steps.push({ line: 5, note: "done", payload: snap() });
  return steps;
}
