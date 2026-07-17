import type { Step, TreePayload, HashPayload, GridPayload, StepColor } from "../types";
import { layoutBinaryTree } from "../layout";
import { parseNumberArray } from "../parse";

const treeSnap = (values: (number | string | null)[], colors: Record<number, StepColor>, edgeColors: Record<string, StepColor> = {}, labels: Record<number, string> = {}): TreePayload => {
  const layout = layoutBinaryTree(values);
  return {
    ...layout,
    nodes: layout.nodes.map((n) => ({ ...n, color: colors[n.id], extra: labels[n.id] })),
    edges: layout.edges.map((e) => ({ ...e, color: edgeColors[`${e.from}-${e.to}`] })),
  };
};

// BINARY TREE (concept + level-order build)
export function binaryTreeSteps(input: string): Step[] {
  const nums = parseNumberArray(input, [1, 2, 3, 4, 5, 6, 7]);
  const level: (number | null)[] = [];
  const steps: Step[] = [];
  for (let i = 0; i < nums.length; i++) {
    level.push(nums[i]);
    steps.push({ line: 1, note: `insert level-order: ${nums[i]}`, payload: treeSnap(level, { [i]: "active" }) });
  }
  steps.push({ line: 2, note: "complete binary tree", payload: treeSnap(level, {}) });
  return steps;
}

// BST insertion
export function bstSteps(input: string): Step[] {
  const nums = parseNumberArray(input, [5, 3, 8, 1, 4, 7, 9, 2]);
  const level: (number | null)[] = [];
  const steps: Step[] = [];
  const insert = (v: number) => {
    if (level.length === 0) { level[0] = v; steps.push({ line: 1, note: `root = ${v}`, payload: treeSnap(level, { 0: "active" }) }); return; }
    let idx = 0;
    while (true) {
      steps.push({ line: 2, note: `compare ${v} vs ${level[idx]}`, payload: treeSnap(level, { [idx]: "active" }) });
      const cur = level[idx] as number;
      const next = v < cur ? 2 * idx + 1 : 2 * idx + 2;
      while (next >= level.length) level.push(null);
      if (level[next] === null || level[next] === undefined) {
        level[next] = v;
        steps.push({ line: 3, note: `place ${v} at ${v < cur ? "left" : "right"}`, payload: treeSnap(level, { [next]: "done" }) });
        return;
      }
      idx = next;
    }
  };
  for (const v of nums) insert(v);
  steps.push({ line: 4, note: "BST built", payload: treeSnap(level, {}) });
  return steps;
}

// Concept-based for balanced trees (illustrate rotations conceptually)
function balancedConcept(kind: string, input: string, tint: (h: Record<number, StepColor>) => void = () => {}): Step[] {
  const nums = parseNumberArray(input, [10, 20, 30, 40, 50, 25]);
  const level: (number | null)[] = [];
  const steps: Step[] = [];
  const insert = (v: number) => {
    if (!level.length) { level[0] = v; return; }
    let idx = 0;
    while (true) {
      const cur = level[idx] as number;
      const next = v < cur ? 2 * idx + 1 : 2 * idx + 2;
      while (next >= level.length) level.push(null);
      if (level[next] == null) { level[next] = v; return; }
      idx = next;
    }
  };
  // simulate rebalancing by keeping tree small (visual only)
  const balanced: number[] = [];
  const sortedIn = [...nums].sort((a, b) => a - b);
  const balBuild = (l: number, r: number) => {
    if (l > r) return;
    const m = (l + r) >> 1;
    balanced.push(sortedIn[m]);
    balBuild(l, m - 1);
    balBuild(m + 1, r);
  };
  balBuild(0, sortedIn.length - 1);
  for (const v of nums) {
    insert(v);
    steps.push({ line: 1, note: `${kind}: insert ${v}`, payload: treeSnap(level, { [level.findIndex((x) => x === v)]: "active" }) });
  }
  // Now show rebalanced result
  const balLevel: (number | null)[] = [];
  const balInsert = (v: number) => {
    if (!balLevel.length) { balLevel[0] = v; return; }
    let idx = 0;
    while (true) {
      const cur = balLevel[idx] as number;
      const next = v < cur ? 2 * idx + 1 : 2 * idx + 2;
      while (next >= balLevel.length) balLevel.push(null);
      if (balLevel[next] == null) { balLevel[next] = v; return; }
      idx = next;
    }
  };
  for (const v of balanced) balInsert(v);
  const finalColors: Record<number, StepColor> = {};
  balLevel.forEach((v, i) => { if (v != null) finalColors[i] = "done"; });
  tint(finalColors);
  steps.push({ line: 2, note: `${kind}: after self-balancing rotations`, payload: treeSnap(balLevel, finalColors) });
  return steps;
}

export const avlSteps = (input: string) => balancedConcept("AVL", input);
export const rbSteps = (input: string) => balancedConcept("Red-Black", input, (h) => { Object.keys(h).forEach((k, i) => { h[Number(k)] = i % 2 ? "warn" : "visited"; }); });
export const splaySteps = (input: string) => balancedConcept("Splay", input, (h) => { h[0] = "active"; });

// B-Tree concept: represent as multi-key nodes shown in grid
export function btreeSteps(input: string): Step[] {
  const nums = parseNumberArray(input, [10, 20, 5, 6, 12, 30, 7, 17]);
  const steps: Step[] = [];
  const order = 4; // t=2 means max keys=3
  let root: number[] = [];
  const children: Record<string, number[][]> = {};
  const snapGrid = (): GridPayload => {
    const rows = [root, ...(children["root"] ?? [])];
    return {
      rows: rows.length,
      cols: order,
      cells: rows.map((r) => Array.from({ length: order }, (_, i) => r[i] ?? "")),
      colors: rows.map(() => Array(order).fill(undefined)),
      caption: `B-Tree (t=2, max keys per node=${order - 1})`,
    };
  };
  steps.push({ line: 1, note: "B-Tree begins empty", payload: snapGrid() });
  for (const v of nums) {
    root.push(v);
    root.sort((a, b) => a - b);
    steps.push({ line: 2, note: `insert ${v} into root`, payload: snapGrid() });
    if (root.length >= order) {
      const mid = Math.floor(root.length / 2);
      const left = root.slice(0, mid);
      const midKey = root[mid];
      const right = root.slice(mid + 1);
      children["root"] = children["root"] ?? [];
      children["root"] = [left, right];
      root = [midKey];
      steps.push({ line: 3, note: `split node → promote ${midKey}`, payload: snapGrid() });
    }
  }
  steps.push({ line: 4, note: "final B-Tree", payload: snapGrid() });
  return steps;
}

// HEAP (min-heap)
export function heapSteps(input: string): Step[] {
  const nums = parseNumberArray(input, [8, 3, 5, 1, 7, 2, 6]);
  const steps: Step[] = [];
  const heap: number[] = [];
  const snap = (colors: Record<number, StepColor> = {}) => treeSnap(heap.map((v) => v as number | null), colors);
  const up = (i: number) => {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      steps.push({ line: 2, note: `compare with parent at ${p}`, payload: snap({ [i]: "active", [p]: "visited" }) });
      if (heap[i] < heap[p]) {
        [heap[i], heap[p]] = [heap[p], heap[i]];
        steps.push({ line: 3, note: `swap up`, payload: snap({ [p]: "active" }) });
        i = p;
      } else break;
    }
  };
  steps.push({ line: 1, note: "min-heap start", payload: snap() });
  for (const v of nums) {
    heap.push(v);
    steps.push({ line: 1, note: `insert ${v} at end`, payload: snap({ [heap.length - 1]: "active" }) });
    up(heap.length - 1);
  }
  steps.push({ line: 4, note: "heap built (root = min)", payload: snap({ 0: "done" }) });
  return steps;
}

// TRIE
export function trieSteps(input: string): Step[] {
  const words = (input.trim() || "cat,car,cart,dog,do,done").split(/[,\s]+/).filter(Boolean);
  const steps: Step[] = [];
  interface N { id: number; char: string; end?: boolean; children: Record<string, N>; parent?: number; }
  let idc = 0;
  const root: N = { id: idc++, char: "•", children: {} };
  const layout = () => {
    // BFS layout
    const layers: N[][] = [];
    const walk = (n: N, d: number) => {
      layers[d] = layers[d] ?? [];
      layers[d].push(n);
      for (const c of Object.values(n.children)) walk(c, d + 1);
    };
    walk(root, 0);
    const width = 780;
    const nodes: TreePayload["nodes"] = [];
    const edges: TreePayload["edges"] = [];
    layers.forEach((layer, d) => {
      layer.forEach((n, i) => {
        const x = ((i + 1) / (layer.length + 1)) * width;
        nodes.push({ id: n.id, val: n.char + (n.end ? "•" : ""), x, y: 30 + d * 70 });
        if (n.parent !== undefined) edges.push({ from: n.parent, to: n.id });
      });
    });
    return { nodes, edges, width, height: layers.length * 70 + 40 };
  };
  steps.push({ line: 1, note: "empty trie", payload: layout() });
  for (const w of words) {
    let cur = root;
    for (const ch of w) {
      if (!cur.children[ch]) {
        const n: N = { id: idc++, char: ch, children: {}, parent: cur.id };
        cur.children[ch] = n;
      }
      cur = cur.children[ch];
      const l = layout();
      steps.push({ line: 2, note: `insert "${w}": add '${ch}'`, payload: { ...l, nodes: l.nodes.map((n) => ({ ...n, color: n.id === cur.id ? "active" : undefined })) } });
    }
    cur.end = true;
    const l = layout();
    steps.push({ line: 3, note: `mark end of "${w}"`, payload: { ...l, nodes: l.nodes.map((n) => ({ ...n, color: n.id === cur.id ? "done" : undefined })) } });
  }
  return steps;
}

// SEGMENT TREE (sum)
export function segmentTreeSteps(input: string): Step[] {
  const nums = parseNumberArray(input, [1, 3, 5, 7, 9, 11]);
  const n = nums.length;
  const seg: number[] = new Array(4 * n).fill(0);
  const steps: Step[] = [];
  const build = (node: number, l: number, r: number) => {
    if (l === r) { seg[node] = nums[l]; return; }
    const m = (l + r) >> 1;
    build(2 * node, l, m);
    build(2 * node + 1, m + 1, r);
    seg[node] = seg[2 * node] + seg[2 * node + 1];
  };
  build(1, 0, n - 1);
  // visualize segment tree from `seg` array in packed form
  const values: (number | null)[] = [];
  const walk = (i: number, out: (number | null)[]) => {
    if (i >= seg.length) return;
    out.push(seg[i] || null);
  };
  // Instead: use level-order down to enough depth
  const depth = Math.ceil(Math.log2(n)) + 1;
  const size = (1 << (depth + 1));
  const levelValues: (number | null)[] = new Array(size).fill(null);
  const fill = (node: number, lvlIdx: number, l: number, r: number) => {
    if (l > r || node >= seg.length) return;
    levelValues[lvlIdx] = seg[node];
    if (l === r) return;
    const m = (l + r) >> 1;
    fill(2 * node, 2 * lvlIdx + 1, l, m);
    fill(2 * node + 1, 2 * lvlIdx + 2, m + 1, r);
  };
  fill(1, 0, 0, n - 1);
  steps.push({ line: 1, note: `segment tree built (sum)`, payload: treeSnap(levelValues, {}) });
  // Range query [1..3]
  const ql = 1, qr = 3;
  const highlight: Record<number, StepColor> = {};
  const query = (node: number, lvl: number, l: number, r: number): number => {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) { highlight[lvl] = "done"; return seg[node]; }
    highlight[lvl] = "active";
    const m = (l + r) >> 1;
    return query(2 * node, 2 * lvl + 1, l, m) + query(2 * node + 1, 2 * lvl + 2, m + 1, r);
  };
  const s = query(1, 0, 0, n - 1);
  steps.push({ line: 2, note: `query sum[${ql}..${qr}] = ${s}`, payload: treeSnap(levelValues, highlight) });
  return steps;
}

// FENWICK
export function fenwickSteps(input: string): Step[] {
  const nums = parseNumberArray(input, [3, 2, -1, 6, 5, 4, -3, 3, 7, 2]);
  const n = nums.length;
  const bit = new Array(n + 1).fill(0);
  const steps: Step[] = [];
  const snap = (colors: Record<number, StepColor> = {}, caption?: string): GridPayload => ({
    rows: 2,
    cols: n + 1,
    cells: [bit.map((v) => v as string | number), [...nums.map((v) => v as string | number), ""]],
    colors: [Array.from({ length: n + 1 }, (_, i) => colors[i]), Array(n + 1).fill(undefined)],
    rowLabels: ["BIT", "arr"],
    colLabels: Array.from({ length: n + 1 }, (_, i) => String(i)),
    caption,
  });
  steps.push({ line: 1, note: "empty BIT", payload: snap() });
  for (let i = 0; i < n; i++) {
    let idx = i + 1;
    const val = nums[i];
    const touched: Record<number, StepColor> = {};
    while (idx <= n) {
      bit[idx] += val;
      touched[idx] = "active";
      idx += idx & -idx;
    }
    steps.push({ line: 2, note: `update(${i}, +${val})`, payload: snap(touched, `after inserting a[${i}]=${val}`) });
  }
  // prefix query 5
  let q = 5, acc = 0;
  const highlights: Record<number, StepColor> = {};
  while (q > 0) { acc += bit[q]; highlights[q] = "done"; q -= q & -q; }
  steps.push({ line: 3, note: `prefixSum(5) = ${acc}`, payload: snap(highlights, `traversal path`) });
  return steps;
}
