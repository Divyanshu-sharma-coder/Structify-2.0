import type { Step, GraphPayload, GridPayload, StepColor } from "../types";
import { circleLayout } from "../layout";
import { parseGraph } from "../parse";

// Adjacency Matrix -----------------------------------------------------
export function adjMatrixSteps(input: string): Step[] {
  const { nodes, edges } = parseGraph(input);
  const idx: Record<string, number> = {};
  nodes.forEach((n, i) => (idx[n] = i));
  const n = nodes.length;
  const M: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const steps: Step[] = [];
  const grid = (colors: Record<string, StepColor> = {}): GridPayload => ({
    rows: n,
    cols: n,
    cells: M.map((r) => r.map((v) => v)),
    colors: M.map((_, r) => Array.from({ length: n }, (_, c) => colors[`${r},${c}`])),
    rowLabels: nodes,
    colLabels: nodes,
    caption: "adjacency matrix",
  });
  steps.push({ line: 1, note: `matrix ${n}×${n}, initialized to 0`, payload: grid() });
  for (const e of edges) {
    const r = idx[e.from], c = idx[e.to];
    M[r][c] = 1; M[c][r] = 1;
    steps.push({ line: 2, note: `edge ${e.from}-${e.to} → M[${r}][${c}]=1`, payload: grid({ [`${r},${c}`]: "active", [`${c},${r}`]: "active" }) });
  }
  steps.push({ line: 3, note: "final matrix — O(1) edge lookup, O(V²) space", payload: grid() });
  return steps;
}

// Adjacency List -------------------------------------------------------
export function adjListSteps(input: string): Step[] {
  const { nodes, edges } = parseGraph(input);
  const lay = circleLayout(nodes);
  const steps: Step[] = [];
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => (adj[n] = []));
  const edgeColors: Record<string, StepColor> = {};
  const snap = (): GraphPayload => ({
    nodes: nodes.map((id) => ({ id, x: lay.map[id].x, y: lay.map[id].y, label: id, extra: adj[id].length ? `→${adj[id].join(",")}` : undefined })),
    edges: edges.map((e) => ({ ...e, color: edgeColors[`${e.from}-${e.to}`] })),
    width: lay.width, height: lay.height,
  });
  steps.push({ line: 1, note: "start with V empty lists", payload: snap() });
  for (const e of edges) {
    adj[e.from].push(e.to); adj[e.to].push(e.from);
    edgeColors[`${e.from}-${e.to}`] = "active";
    steps.push({ line: 2, note: `add ${e.from}-${e.to} to both lists`, payload: snap() });
    edgeColors[`${e.from}-${e.to}`] = "path";
  }
  steps.push({ line: 3, note: "O(V+E) space; iterate neighbors in O(deg)", payload: snap() });
  return steps;
}

// DSU / Union-Find -----------------------------------------------------
export function dsuSteps(input: string): Step[] {
  const pairs = (input.trim() || "1-2,3-4,2-3,5-6,4-5").split(/[,\s]+/).filter(Boolean).map((s) => {
    const [a, b] = s.split("-"); return [a, b] as [string, string];
  });
  const nodes = Array.from(new Set(pairs.flat()));
  const lay = circleLayout(nodes);
  const parent: Record<string, string> = {};
  nodes.forEach((n) => (parent[n] = n));
  const steps: Step[] = [];
  const find = (x: string): string => parent[x] === x ? x : (parent[x] = find(parent[x]));
  const snap = (extra?: string, colors: Record<string, StepColor> = {}): GraphPayload => {
    const groups: Record<string, string[]> = {};
    nodes.forEach((n) => { const r = find(n); groups[r] = groups[r] ?? []; groups[r].push(n); });
    return {
      nodes: nodes.map((id) => ({ id, x: lay.map[id].x, y: lay.map[id].y, label: id, color: colors[id], extra: `root=${find(id)}` })),
      edges: nodes.filter((n) => parent[n] !== n).map((n) => ({ from: n, to: parent[n], color: "path" as StepColor })),
      width: lay.width, height: lay.height,
      distances: extra ? { [nodes[0]]: extra } : undefined,
    };
  };
  steps.push({ line: 1, note: `${nodes.length} singleton sets`, payload: snap() });
  for (const [a, b] of pairs) {
    const ra = find(a), rb = find(b);
    steps.push({ line: 2, note: `union(${a}, ${b}); find→${ra},${rb}`, payload: snap(undefined, { [a]: "active", [b]: "active" }) });
    if (ra !== rb) parent[ra] = rb;
    steps.push({ line: 3, note: `link ${ra}→${rb}`, payload: snap(undefined, { [ra]: "done", [rb]: "done" }) });
  }
  steps.push({ line: 4, note: "final components", payload: snap() });
  return steps;
}
