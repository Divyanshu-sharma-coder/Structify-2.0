import type { Step, GraphPayload, GridPayload, StepColor } from "../types";
import { circleLayout } from "../layout";
import { parseGraph } from "../parse";

const buildAdj = (nodes: string[], edges: { from: string; to: string; weight: number }[], directed = false) => {
  const adj: Record<string, { to: string; w: number }[]> = {};
  nodes.forEach((n) => (adj[n] = []));
  edges.forEach((e) => {
    adj[e.from].push({ to: e.to, w: e.weight });
    if (!directed) adj[e.to].push({ to: e.from, w: e.weight });
  });
  return adj;
};

const graphSnap = (nodes: string[], edges: { from: string; to: string; weight: number }[], lay: ReturnType<typeof circleLayout>, colors: Record<string, StepColor>, edgeCol: Record<string, StepColor>, dist: Record<string, number | string>, directed = false): GraphPayload => ({
  nodes: nodes.map((id) => ({ id, x: lay.map[id].x, y: lay.map[id].y, label: id, color: colors[id] })),
  edges: edges.map((e) => ({ from: e.from, to: e.to, weight: e.weight, color: edgeCol[`${e.from}-${e.to}`] || edgeCol[`${e.to}-${e.from}`], directed })),
  width: lay.width, height: lay.height,
  distances: dist,
});

// DIJKSTRA
export function dijkstraSteps(input: string): Step[] {
  const { nodes, edges } = parseGraph(input);
  const adj = buildAdj(nodes, edges);
  const lay = circleLayout(nodes);
  const start = nodes[0];
  const dist: Record<string, number> = {};
  nodes.forEach((n) => (dist[n] = Infinity));
  dist[start] = 0;
  const done = new Set<string>();
  const colors: Record<string, StepColor> = {};
  const edgeCol: Record<string, StepColor> = {};
  const steps: Step[] = [];
  const distStr = () => Object.fromEntries(nodes.map((n) => [n, dist[n] === Infinity ? "∞" : dist[n]]));
  steps.push({ line: 1, note: `Dijkstra from ${start}`, payload: graphSnap(nodes, edges, lay, colors, edgeCol, distStr()) });
  while (done.size < nodes.length) {
    let u: string | null = null;
    for (const n of nodes) if (!done.has(n) && (u === null || dist[n] < dist[u])) u = n;
    if (u === null || dist[u] === Infinity) break;
    done.add(u);
    colors[u] = "visited";
    steps.push({ line: 2, note: `pick ${u} with dist=${dist[u]}`, payload: graphSnap(nodes, edges, lay, colors, edgeCol, distStr()) });
    for (const { to, w } of adj[u]) {
      const alt = dist[u] + w;
      if (alt < dist[to]) {
        dist[to] = alt;
        colors[to] = "active";
        edgeCol[`${u}-${to}`] = "path";
        steps.push({ line: 3, note: `relax ${u}→${to}: ${alt}`, payload: graphSnap(nodes, edges, lay, colors, edgeCol, distStr()) });
      }
    }
  }
  steps.push({ line: 4, note: "shortest paths computed", payload: graphSnap(nodes, edges, lay, colors, edgeCol, distStr()) });
  return steps;
}

// BELLMAN-FORD
export function bellmanFordSteps(input: string): Step[] {
  const { nodes, edges } = parseGraph(input);
  const lay = circleLayout(nodes);
  const start = nodes[0];
  const dist: Record<string, number> = {};
  nodes.forEach((n) => (dist[n] = Infinity));
  dist[start] = 0;
  const colors: Record<string, StepColor> = {};
  const edgeCol: Record<string, StepColor> = {};
  const steps: Step[] = [];
  const distStr = () => Object.fromEntries(nodes.map((n) => [n, dist[n] === Infinity ? "∞" : dist[n]]));
  steps.push({ line: 1, note: `Bellman-Ford from ${start}`, payload: graphSnap(nodes, edges, lay, colors, edgeCol, distStr(), true) });
  for (let i = 0; i < nodes.length - 1; i++) {
    let changed = false;
    for (const e of edges) {
      const alt = dist[e.from] + e.weight;
      if (dist[e.from] !== Infinity && alt < dist[e.to]) {
        dist[e.to] = alt;
        edgeCol[`${e.from}-${e.to}`] = "path";
        colors[e.to] = "active";
        changed = true;
        steps.push({ line: 2, note: `pass ${i + 1}: relax ${e.from}→${e.to} = ${alt}`, payload: graphSnap(nodes, edges, lay, colors, edgeCol, distStr(), true) });
      }
    }
    if (!changed) break;
  }
  steps.push({ line: 3, note: "done", payload: graphSnap(nodes, edges, lay, colors, edgeCol, distStr(), true) });
  return steps;
}

// FLOYD-WARSHALL
export function floydWarshallSteps(input: string): Step[] {
  const { nodes, edges } = parseGraph(input);
  const n = nodes.length;
  const idx: Record<string, number> = {};
  nodes.forEach((v, i) => (idx[v] = i));
  const D: (number | string)[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : "∞")));
  for (const e of edges) { D[idx[e.from]][idx[e.to]] = e.weight; D[idx[e.to]][idx[e.from]] = e.weight; }
  const steps: Step[] = [];
  const snap = (colors: Record<string, StepColor> = {}, caption?: string): GridPayload => ({
    rows: n, cols: n,
    cells: D.map((r) => r.map((v) => v)),
    colors: D.map((_, r) => Array.from({ length: n }, (_, c) => colors[`${r},${c}`])),
    rowLabels: nodes, colLabels: nodes,
    caption,
  });
  steps.push({ line: 1, note: "initial distance matrix", payload: snap({}, "D[i][j] = direct edge or ∞") });
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const dik = D[i][k], dkj = D[k][j], dij = D[i][j];
        if (typeof dik === "number" && typeof dkj === "number" && (typeof dij !== "number" || dik + dkj < dij)) {
          D[i][j] = dik + dkj;
          steps.push({
            line: 2,
            note: `k=${nodes[k]}: D[${nodes[i]}][${nodes[j]}] via ${nodes[k]} → ${D[i][j]}`,
            payload: snap({ [`${i},${j}`]: "active", [`${i},${k}`]: "visited", [`${k},${j}`]: "visited" }),
          });
        }
      }
    }
  }
  steps.push({ line: 3, note: "final all-pairs distances", payload: snap() });
  return steps;
}

// KRUSKAL
export function kruskalSteps(input: string): Step[] {
  const { nodes, edges } = parseGraph(input);
  const lay = circleLayout(nodes);
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);
  const parent: Record<string, string> = {};
  nodes.forEach((n) => (parent[n] = n));
  const find = (x: string): string => parent[x] === x ? x : (parent[x] = find(parent[x]));
  const steps: Step[] = [];
  const edgeCol: Record<string, StepColor> = {};
  const colors: Record<string, StepColor> = {};
  const snap = () => graphSnap(nodes, edges, lay, colors, edgeCol, {});
  steps.push({ line: 1, note: `sort ${sorted.length} edges by weight`, payload: snap() });
  for (const e of sorted) {
    const ra = find(e.from), rb = find(e.to);
    edgeCol[`${e.from}-${e.to}`] = "active";
    steps.push({ line: 2, note: `consider ${e.from}-${e.to} (w=${e.weight})`, payload: snap() });
    if (ra !== rb) {
      parent[ra] = rb;
      edgeCol[`${e.from}-${e.to}`] = "path";
      colors[e.from] = "done"; colors[e.to] = "done";
      steps.push({ line: 3, note: `add to MST`, payload: snap() });
    } else {
      edgeCol[`${e.from}-${e.to}`] = "warn";
      steps.push({ line: 4, note: `would create cycle, skip`, payload: snap() });
      delete edgeCol[`${e.from}-${e.to}`];
    }
  }
  steps.push({ line: 5, note: "MST complete", payload: snap() });
  return steps;
}

// PRIM
export function primSteps(input: string): Step[] {
  const { nodes, edges } = parseGraph(input);
  const adj = buildAdj(nodes, edges);
  const lay = circleLayout(nodes);
  const inMst = new Set([nodes[0]]);
  const colors: Record<string, StepColor> = { [nodes[0]]: "done" };
  const edgeCol: Record<string, StepColor> = {};
  const steps: Step[] = [];
  const snap = () => graphSnap(nodes, edges, lay, colors, edgeCol, {});
  steps.push({ line: 1, note: `start from ${nodes[0]}`, payload: snap() });
  while (inMst.size < nodes.length) {
    let best: { from: string; to: string; w: number } | null = null;
    for (const u of inMst) for (const { to, w } of adj[u]) if (!inMst.has(to) && (best === null || w < best.w)) best = { from: u, to, w };
    if (!best) break;
    edgeCol[`${best.from}-${best.to}`] = "path";
    inMst.add(best.to);
    colors[best.to] = "done";
    steps.push({ line: 2, note: `pick lightest crossing edge ${best.from}-${best.to} (w=${best.w})`, payload: snap() });
  }
  steps.push({ line: 3, note: "MST complete", payload: snap() });
  return steps;
}

// TOPOLOGICAL SORT (Kahn's)
export function topoSortSteps(input: string): Step[] {
  const { nodes, edges } = parseGraph(input.trim() || "a-b, a-c, b-d, c-d, d-e, c-e");
  const lay = circleLayout(nodes);
  const indeg: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => { indeg[n] = 0; adj[n] = []; });
  edges.forEach((e) => { adj[e.from].push(e.to); indeg[e.to]++; });
  const steps: Step[] = [];
  const colors: Record<string, StepColor> = {};
  const edgeCol: Record<string, StepColor> = {};
  const snap = (caption?: string): GraphPayload => ({
    nodes: nodes.map((id) => ({ id, x: lay.map[id].x, y: lay.map[id].y, label: id, color: colors[id], extra: `in=${indeg[id]}` })),
    edges: edges.map((e) => ({ ...e, directed: true, color: edgeCol[`${e.from}-${e.to}`] })),
    width: lay.width, height: lay.height,
    distances: caption ? { [nodes[0]]: caption } : undefined,
  });
  const q = nodes.filter((n) => indeg[n] === 0);
  const order: string[] = [];
  steps.push({ line: 1, note: `enqueue in-degree 0: ${q.join(", ")}`, payload: snap() });
  while (q.length) {
    const u = q.shift()!;
    order.push(u);
    colors[u] = "done";
    steps.push({ line: 2, note: `pop ${u}, order=[${order.join(",")}]`, payload: snap() });
    for (const v of adj[u]) {
      indeg[v]--;
      edgeCol[`${u}-${v}`] = "path";
      if (indeg[v] === 0) { q.push(v); colors[v] = "active"; }
      steps.push({ line: 3, note: `${u}→${v}: in=${indeg[v]}`, payload: snap() });
    }
  }
  steps.push({ line: 4, note: `topological order: ${order.join(" → ")}`, payload: snap(order.join(" → ")) });
  return steps;
}
