// Operation-based step generators for interactive data-structure playgrounds.
// Each `runOps(cmds)` replays the full command list from an empty structure
// and emits one or more Steps per command, so scrubbing the timeline shows
// the exact evolution of the DS after every user-invoked operation.

import type {
  Step,
  OpCommand,
  OpDef,
  StepColor,
  CellsPayload,
  ListPayload,
  HashPayload,
  TreePayload,
  ListNode,
} from "./types";
import { layoutBinaryTree } from "./layout";

// ---------- helpers ----------
const num = (s: string | undefined, def = 0) => {
  if (s === undefined || s === "") return def;
  const n = Number(s);
  return Number.isFinite(n) ? n : def;
};
const cells = (
  arr: (number | string | null)[],
  extras: Partial<CellsPayload> = {},
): CellsPayload => ({ arr, ...extras });

const empty = (msg: string, payload: unknown): Step[] => [{ note: msg, payload }];

// =====================================================================
// VECTOR / DYNAMIC ARRAY
// =====================================================================
export const vectorOpsDefs: OpDef[] = [
  { id: "push_back", label: "push_back(v)", args: [{ name: "v", kind: "number", placeholder: "value" }] },
  { id: "pop_back", label: "pop_back()" },
  { id: "push_front", label: "push_front(v)", args: [{ name: "v", kind: "number" }] },
  { id: "pop_front", label: "pop_front()" },
  { id: "insert", label: "insert(i, v)", args: [{ name: "i", kind: "number" }, { name: "v", kind: "number" }] },
  { id: "erase", label: "erase(i)", args: [{ name: "i", kind: "number" }] },
  { id: "at", label: "at(i)", args: [{ name: "i", kind: "number" }] },
  { id: "size", label: "size()" },
  { id: "clear", label: "clear()" },
];

export function vectorRunOps(cmds: OpCommand[]): Step[] {
  const steps: Step[] = [];
  const a: number[] = [];
  steps.push({ note: "empty vector", payload: cells([], { extra: "size=0" }) });
  for (const c of cmds) {
    const v = num(c.args[0]);
    switch (c.op) {
      case "push_back":
        a.push(v);
        steps.push({ note: `push_back(${v}) → size=${a.length}`, payload: cells([...a], { highlights: { [a.length - 1]: "active" }, extra: `size=${a.length}` }) });
        break;
      case "pop_back":
        if (!a.length) { steps.push({ note: "pop_back on empty", payload: cells([]) }); break; }
        steps.push({ note: `pop_back → ${a[a.length - 1]}`, payload: cells([...a], { highlights: { [a.length - 1]: "warn" } }) });
        a.pop();
        steps.push({ note: `size=${a.length}`, payload: cells([...a], { extra: `size=${a.length}` }) });
        break;
      case "push_front":
        a.unshift(v);
        steps.push({ note: `push_front(${v}) shifts all right`, payload: cells([...a], { highlights: { 0: "active" }, extra: `size=${a.length}` }) });
        break;
      case "pop_front":
        if (!a.length) { steps.push({ note: "pop_front on empty", payload: cells([]) }); break; }
        steps.push({ note: `pop_front → ${a[0]}`, payload: cells([...a], { highlights: { 0: "warn" } }) });
        a.shift();
        steps.push({ note: `size=${a.length}`, payload: cells([...a]) });
        break;
      case "insert": {
        const i = Math.max(0, Math.min(a.length, num(c.args[0])));
        const val = num(c.args[1]);
        a.splice(i, 0, val);
        steps.push({ note: `insert(${i}, ${val})`, payload: cells([...a], { highlights: { [i]: "active" } }) });
        break;
      }
      case "erase": {
        const i = num(c.args[0]);
        if (i < 0 || i >= a.length) { steps.push({ note: `erase(${i}) out of range`, payload: cells([...a]) }); break; }
        steps.push({ note: `erase(${i})`, payload: cells([...a], { highlights: { [i]: "warn" } }) });
        a.splice(i, 1);
        steps.push({ note: `size=${a.length}`, payload: cells([...a]) });
        break;
      }
      case "at": {
        const i = num(c.args[0]);
        if (i < 0 || i >= a.length) { steps.push({ note: `at(${i}) out of range`, payload: cells([...a]) }); break; }
        steps.push({ note: `at(${i}) → ${a[i]}`, payload: cells([...a], { highlights: { [i]: "active" }, pointers: { i } }) });
        break;
      }
      case "size":
        steps.push({ note: `size() = ${a.length}`, payload: cells([...a], { extra: `size=${a.length}` }) });
        break;
      case "clear":
        a.length = 0;
        steps.push({ note: "clear()", payload: cells([]) });
        break;
    }
  }
  return steps;
}

// =====================================================================
// STACK
// =====================================================================
export const stackOpsDefs: OpDef[] = [
  { id: "push", label: "push(v)", args: [{ name: "v", kind: "number" }] },
  { id: "pop", label: "pop()" },
  { id: "peek", label: "peek() / top()" },
  { id: "size", label: "size()" },
  { id: "clear", label: "clear()" },
];
export function stackRunOps(cmds: OpCommand[]): Step[] {
  const s: number[] = [];
  const steps: Step[] = [{ note: "empty stack", payload: cells([], { extra: "top → ∅" }) }];
  for (const c of cmds) {
    const v = num(c.args[0]);
    switch (c.op) {
      case "push":
        s.push(v);
        steps.push({ note: `push(${v})`, payload: cells([...s], { highlights: { [s.length - 1]: "active" }, pointers: { top: s.length - 1 } }) });
        break;
      case "pop":
        if (!s.length) { steps.push({ note: "pop on empty", payload: cells([]) }); break; }
        steps.push({ note: `pop → ${s[s.length - 1]}`, payload: cells([...s], { highlights: { [s.length - 1]: "warn" }, pointers: { top: s.length - 1 } }) });
        s.pop();
        steps.push({ note: `size=${s.length}`, payload: cells([...s], { pointers: s.length ? { top: s.length - 1 } : {} }) });
        break;
      case "peek":
        if (!s.length) { steps.push({ note: "peek on empty", payload: cells([]) }); break; }
        steps.push({ note: `peek → ${s[s.length - 1]}`, payload: cells([...s], { highlights: { [s.length - 1]: "active" }, pointers: { top: s.length - 1 } }) });
        break;
      case "size":
        steps.push({ note: `size = ${s.length}`, payload: cells([...s], { extra: `size=${s.length}` }) });
        break;
      case "clear":
        s.length = 0;
        steps.push({ note: "clear()", payload: cells([]) });
        break;
    }
  }
  return steps;
}

// =====================================================================
// QUEUE
// =====================================================================
export const queueOpsDefs: OpDef[] = [
  { id: "enqueue", label: "enqueue(v)", args: [{ name: "v", kind: "number" }] },
  { id: "dequeue", label: "dequeue()" },
  { id: "front", label: "front()" },
  { id: "size", label: "size()" },
  { id: "clear", label: "clear()" },
];
export function queueRunOps(cmds: OpCommand[]): Step[] {
  const q: number[] = [];
  const snap = (extra: Partial<CellsPayload> = {}) =>
    cells([...q], { pointers: q.length ? { front: 0, back: q.length - 1 } : {}, ...extra });
  const steps: Step[] = [{ note: "empty queue", payload: snap() }];
  for (const c of cmds) {
    const v = num(c.args[0]);
    switch (c.op) {
      case "enqueue":
        q.push(v);
        steps.push({ note: `enqueue(${v})`, payload: snap({ highlights: { [q.length - 1]: "active" } }) });
        break;
      case "dequeue":
        if (!q.length) { steps.push({ note: "dequeue on empty", payload: snap() }); break; }
        steps.push({ note: `dequeue → ${q[0]}`, payload: snap({ highlights: { 0: "warn" } }) });
        q.shift();
        steps.push({ note: `size=${q.length}`, payload: snap() });
        break;
      case "front":
        if (!q.length) { steps.push({ note: "front on empty", payload: snap() }); break; }
        steps.push({ note: `front → ${q[0]}`, payload: snap({ highlights: { 0: "active" } }) });
        break;
      case "size":
        steps.push({ note: `size = ${q.length}`, payload: snap({ extra: `size=${q.length}` }) });
        break;
      case "clear":
        q.length = 0;
        steps.push({ note: "clear()", payload: snap() });
        break;
    }
  }
  return steps;
}

// =====================================================================
// DEQUE
// =====================================================================
export const dequeOpsDefs: OpDef[] = [
  { id: "push_back", label: "push_back(v)", args: [{ name: "v", kind: "number" }] },
  { id: "push_front", label: "push_front(v)", args: [{ name: "v", kind: "number" }] },
  { id: "pop_back", label: "pop_back()" },
  { id: "pop_front", label: "pop_front()" },
  { id: "front", label: "front()" },
  { id: "back", label: "back()" },
  { id: "clear", label: "clear()" },
];
export function dequeRunOps(cmds: OpCommand[]): Step[] {
  const d: number[] = [];
  const snap = (extra: Partial<CellsPayload> = {}) =>
    cells([...d], { pointers: d.length ? { front: 0, back: d.length - 1 } : {}, ...extra });
  const steps: Step[] = [{ note: "empty deque", payload: snap() }];
  for (const c of cmds) {
    const v = num(c.args[0]);
    switch (c.op) {
      case "push_back":
        d.push(v);
        steps.push({ note: `push_back(${v})`, payload: snap({ highlights: { [d.length - 1]: "active" } }) });
        break;
      case "push_front":
        d.unshift(v);
        steps.push({ note: `push_front(${v})`, payload: snap({ highlights: { 0: "active" } }) });
        break;
      case "pop_back":
        if (!d.length) { steps.push({ note: "pop_back on empty", payload: snap() }); break; }
        steps.push({ note: `pop_back → ${d[d.length - 1]}`, payload: snap({ highlights: { [d.length - 1]: "warn" } }) });
        d.pop();
        steps.push({ note: "after pop_back", payload: snap() });
        break;
      case "pop_front":
        if (!d.length) { steps.push({ note: "pop_front on empty", payload: snap() }); break; }
        steps.push({ note: `pop_front → ${d[0]}`, payload: snap({ highlights: { 0: "warn" } }) });
        d.shift();
        steps.push({ note: "after pop_front", payload: snap() });
        break;
      case "front":
        if (!d.length) { steps.push({ note: "front on empty", payload: snap() }); break; }
        steps.push({ note: `front → ${d[0]}`, payload: snap({ highlights: { 0: "active" } }) });
        break;
      case "back":
        if (!d.length) { steps.push({ note: "back on empty", payload: snap() }); break; }
        steps.push({ note: `back → ${d[d.length - 1]}`, payload: snap({ highlights: { [d.length - 1]: "active" } }) });
        break;
      case "clear":
        d.length = 0;
        steps.push({ note: "clear()", payload: snap() });
        break;
    }
  }
  return steps;
}

// =====================================================================
// LINKED LISTS (singly / doubly / circular)
// =====================================================================
type LK = "singly" | "doubly" | "circular";
function makeListOps(kind: LK) {
  return (cmds: OpCommand[]): Step[] => {
    const nodes: ListNode[] = [];
    let idc = 0;
    const snap = (colors: Record<number, StepColor> = {}, pointers?: Record<string, number>): ListPayload => ({
      kind,
      nodes: nodes.map((n, i) => ({ ...n, color: colors[i] })),
      pointers,
    });
    const steps: Step[] = [{ note: `empty ${kind} linked list`, payload: snap() }];
    for (const c of cmds) {
      const v = num(c.args[0]);
      switch (c.op) {
        case "insert_head":
          nodes.unshift({ id: idc++, val: v });
          steps.push({ note: `insert_head(${v})`, payload: snap({ 0: "active" }, { head: 0 }) });
          break;
        case "insert_tail":
          nodes.push({ id: idc++, val: v });
          steps.push({ note: `insert_tail(${v})`, payload: snap({ [nodes.length - 1]: "active" }, { tail: nodes.length - 1 }) });
          break;
        case "delete_head":
          if (!nodes.length) { steps.push({ note: "delete_head on empty", payload: snap() }); break; }
          steps.push({ note: `delete_head → ${nodes[0].val}`, payload: snap({ 0: "warn" }) });
          nodes.shift();
          steps.push({ note: "after delete_head", payload: snap() });
          break;
        case "delete_tail":
          if (!nodes.length) { steps.push({ note: "delete_tail on empty", payload: snap() }); break; }
          steps.push({ note: `delete_tail → ${nodes[nodes.length - 1].val}`, payload: snap({ [nodes.length - 1]: "warn" }) });
          nodes.pop();
          steps.push({ note: "after delete_tail", payload: snap() });
          break;
        case "delete_val": {
          const idx = nodes.findIndex((n) => n.val === v);
          if (idx < 0) { steps.push({ note: `delete_val(${v}) not found`, payload: snap() }); break; }
          // walk-highlight up to idx
          for (let i = 0; i <= idx; i++) {
            steps.push({ note: `traverse ${i}`, payload: snap({ [i]: i === idx ? "warn" : "visited" }, { curr: i }) });
          }
          nodes.splice(idx, 1);
          steps.push({ note: `deleted ${v}`, payload: snap() });
          break;
        }
        case "search": {
          const idx = nodes.findIndex((n) => n.val === v);
          for (let i = 0; i < nodes.length; i++) {
            if (i > idx && idx >= 0) break;
            steps.push({ note: `compare node[${i}]=${nodes[i].val} vs ${v}`, payload: snap({ [i]: i === idx ? "done" : "active" }, { curr: i }) });
            if (i === idx) break;
          }
          if (idx < 0) steps.push({ note: `${v} not found`, payload: snap() });
          break;
        }
        case "reverse": {
          nodes.reverse();
          steps.push({ note: "reversed", payload: snap(Object.fromEntries(nodes.map((_, i) => [i, "active" as StepColor]))) });
          break;
        }
        case "rotate": {
          const k = Math.max(0, num(c.args[0], 1)) % Math.max(1, nodes.length);
          for (let i = 0; i < k; i++) nodes.push(nodes.shift()!);
          steps.push({ note: `rotate(${k})`, payload: snap({ 0: "active" }) });
          break;
        }
        case "clear":
          nodes.length = 0;
          steps.push({ note: "clear()", payload: snap() });
          break;
      }
    }
    return steps;
  };
}
const baseListOps: OpDef[] = [
  { id: "insert_head", label: "insert_head(v)", args: [{ name: "v", kind: "number" }] },
  { id: "insert_tail", label: "insert_tail(v)", args: [{ name: "v", kind: "number" }] },
  { id: "delete_head", label: "delete_head()" },
  { id: "delete_tail", label: "delete_tail()" },
  { id: "delete_val", label: "delete(v)", args: [{ name: "v", kind: "number" }] },
  { id: "search", label: "search(v)", args: [{ name: "v", kind: "number" }] },
  { id: "clear", label: "clear()" },
];
export const singlyListOpsDefs: OpDef[] = [...baseListOps];
export const doublyListOpsDefs: OpDef[] = [...baseListOps, { id: "reverse", label: "reverse()" }];
export const circularListOpsDefs: OpDef[] = [
  ...baseListOps,
  { id: "rotate", label: "rotate(k)", args: [{ name: "k", kind: "number" }] },
];
export const singlyListRunOps = makeListOps("singly");
export const doublyListRunOps = makeListOps("doubly");
export const circularListRunOps = makeListOps("circular");

// =====================================================================
// HASH MAP / HASH SET
// =====================================================================
const HBUCKETS = 8;
const hashKey = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % HBUCKETS;
};
export const hashMapOpsDefs: OpDef[] = [
  { id: "put", label: "put(k, v)", args: [{ name: "k", kind: "string" }, { name: "v", kind: "string" }] },
  { id: "get", label: "get(k)", args: [{ name: "k", kind: "string" }] },
  { id: "remove", label: "remove(k)", args: [{ name: "k", kind: "string" }] },
  { id: "size", label: "size()" },
  { id: "clear", label: "clear()" },
];
export function hashMapRunOps(cmds: OpCommand[]): Step[] {
  const buckets: { key: string; val: string; color?: StepColor }[][] = Array.from({ length: HBUCKETS }, () => []);
  const size = () => buckets.reduce((s, b) => s + b.length, 0);
  const snap = (hi?: number, extra?: string): HashPayload => ({
    buckets: buckets.map((b) => b.map((e) => ({ ...e }))),
    highlightBucket: hi,
    extra,
  });
  const steps: Step[] = [{ note: "empty hash map", payload: snap() }];
  for (const c of cmds) {
    const k = c.args[0] ?? "";
    const v = c.args[1] ?? "";
    if (!k && c.op !== "size" && c.op !== "clear") continue;
    const h = k ? hashKey(k) : 0;
    switch (c.op) {
      case "put": {
        const b = buckets[h];
        const existing = b.findIndex((e) => e.key === k);
        if (existing >= 0) {
          b[existing].val = v;
          b[existing].color = "active";
          steps.push({ note: `hash("${k}")=${h}, update → ${v}`, payload: snap(h) });
        } else {
          b.push({ key: k, val: v, color: "active" });
          steps.push({ note: `hash("${k}")=${h}, insert ${k}:${v}`, payload: snap(h) });
        }
        b.forEach((e) => (e.color = undefined));
        break;
      }
      case "get": {
        const b = buckets[h];
        const idx = b.findIndex((e) => e.key === k);
        b.forEach((e, i) => (e.color = i === idx ? "done" : "active"));
        steps.push({ note: idx >= 0 ? `get("${k}") → ${b[idx].val}` : `get("${k}") → not found`, payload: snap(h) });
        b.forEach((e) => (e.color = undefined));
        break;
      }
      case "remove": {
        const b = buckets[h];
        const idx = b.findIndex((e) => e.key === k);
        if (idx < 0) { steps.push({ note: `remove("${k}") not found`, payload: snap(h) }); break; }
        b[idx].color = "warn";
        steps.push({ note: `remove("${k}")`, payload: snap(h) });
        b.splice(idx, 1);
        steps.push({ note: "after remove", payload: snap(h) });
        break;
      }
      case "size":
        steps.push({ note: `size = ${size()}`, payload: snap(undefined, `size=${size()}`) });
        break;
      case "clear":
        buckets.forEach((b) => (b.length = 0));
        steps.push({ note: "clear()", payload: snap() });
        break;
    }
  }
  return steps;
}

export const hashSetOpsDefs: OpDef[] = [
  { id: "add", label: "add(v)", args: [{ name: "v", kind: "string" }] },
  { id: "has", label: "has(v)", args: [{ name: "v", kind: "string" }] },
  { id: "remove", label: "remove(v)", args: [{ name: "v", kind: "string" }] },
  { id: "clear", label: "clear()" },
];
export function hashSetRunOps(cmds: OpCommand[]): Step[] {
  // reuse hash-map with value = "•"
  const mapped: OpCommand[] = cmds.map((c) => {
    if (c.op === "add") return { op: "put", args: [c.args[0] ?? "", "•"] };
    if (c.op === "has") return { op: "get", args: [c.args[0] ?? ""] };
    return c;
  });
  return hashMapRunOps(mapped);
}

// =====================================================================
// BST
// =====================================================================
type BstNode = { val: number; left?: BstNode; right?: BstNode };
function bstToLevel(root: BstNode | undefined): (number | null)[] {
  const out: (number | null)[] = [];
  const put = (i: number, v: number | null) => {
    while (i >= out.length) out.push(null);
    out[i] = v;
  };
  const rec = (n: BstNode | undefined, i: number) => {
    if (!n) return;
    put(i, n.val);
    rec(n.left, 2 * i + 1);
    rec(n.right, 2 * i + 2);
  };
  rec(root, 0);
  return out;
}
function bstSnap(root: BstNode | undefined, colorByVal: Record<number, StepColor> = {}): TreePayload {
  const level = bstToLevel(root);
  const layout = layoutBinaryTree(level);
  return {
    ...layout,
    nodes: layout.nodes.map((n) => ({ ...n, color: colorByVal[n.val as number] })),
  };
}

export const bstOpsDefs: OpDef[] = [
  { id: "insert", label: "insert(v)", args: [{ name: "v", kind: "number" }] },
  { id: "search", label: "search(v)", args: [{ name: "v", kind: "number" }] },
  { id: "delete", label: "delete(v)", args: [{ name: "v", kind: "number" }] },
  { id: "min", label: "min()" },
  { id: "max", label: "max()" },
  { id: "inorder", label: "inorder()" },
  { id: "preorder", label: "preorder()" },
  { id: "postorder", label: "postorder()" },
  { id: "clear", label: "clear()" },
];
export function bstRunOps(cmds: OpCommand[]): Step[] {
  let root: BstNode | undefined = undefined;
  const steps: Step[] = [{ note: "empty BST", payload: bstSnap(root) }];

  const insert = (n: BstNode | undefined, v: number, path: number[]): BstNode => {
    if (!n) return { val: v };
    path.push(n.val);
    if (v < n.val) n.left = insert(n.left, v, path);
    else if (v > n.val) n.right = insert(n.right, v, path);
    return n;
  };
  const findMin = (n: BstNode): BstNode => (n.left ? findMin(n.left) : n);
  const del = (n: BstNode | undefined, v: number): BstNode | undefined => {
    if (!n) return undefined;
    if (v < n.val) n.left = del(n.left, v);
    else if (v > n.val) n.right = del(n.right, v);
    else {
      if (!n.left) return n.right;
      if (!n.right) return n.left;
      const s = findMin(n.right);
      n.val = s.val;
      n.right = del(n.right, s.val);
    }
    return n;
  };

  for (const c of cmds) {
    const v = num(c.args[0]);
    switch (c.op) {
      case "insert": {
        const path: number[] = [];
        root = insert(root, v, path);
        const colors: Record<number, StepColor> = {};
        for (const p of path) { colors[p] = "visited"; steps.push({ note: `compare ${v} vs ${p}`, payload: bstSnap(root, { ...colors }) }); }
        colors[v] = "active";
        steps.push({ note: `insert(${v})`, payload: bstSnap(root, colors) });
        break;
      }
      case "search": {
        let cur = root;
        const colors: Record<number, StepColor> = {};
        let found = false;
        while (cur) {
          colors[cur.val] = "visited";
          steps.push({ note: `compare ${v} vs ${cur.val}`, payload: bstSnap(root, { ...colors }) });
          if (v === cur.val) { colors[cur.val] = "done"; steps.push({ note: `found ${v}`, payload: bstSnap(root, colors) }); found = true; break; }
          cur = v < cur.val ? cur.left : cur.right;
        }
        if (!found) steps.push({ note: `${v} not found`, payload: bstSnap(root, colors) });
        break;
      }
      case "delete":
        root = del(root, v);
        steps.push({ note: `delete(${v})`, payload: bstSnap(root) });
        break;
      case "min": {
        if (!root) { steps.push({ note: "min on empty", payload: bstSnap(root) }); break; }
        let cur = root; const colors: Record<number, StepColor> = {};
        while (cur.left) { colors[cur.val] = "visited"; cur = cur.left; }
        colors[cur.val] = "done";
        steps.push({ note: `min = ${cur.val}`, payload: bstSnap(root, colors) });
        break;
      }
      case "max": {
        if (!root) { steps.push({ note: "max on empty", payload: bstSnap(root) }); break; }
        let cur = root; const colors: Record<number, StepColor> = {};
        while (cur.right) { colors[cur.val] = "visited"; cur = cur.right; }
        colors[cur.val] = "done";
        steps.push({ note: `max = ${cur.val}`, payload: bstSnap(root, colors) });
        break;
      }
      case "inorder":
      case "preorder":
      case "postorder": {
        const out: number[] = [];
        const colors: Record<number, StepColor> = {};
        const visit = (n: BstNode) => {
          colors[n.val] = "active"; out.push(n.val);
          steps.push({ note: `${c.op}: visit ${n.val}`, payload: bstSnap(root, { ...colors }) });
          colors[n.val] = "done";
        };
        const walk = (n: BstNode | undefined) => {
          if (!n) return;
          if (c.op === "preorder") visit(n);
          walk(n.left);
          if (c.op === "inorder") visit(n);
          walk(n.right);
          if (c.op === "postorder") visit(n);
        };
        walk(root);
        steps.push({ note: `${c.op}: ${out.join(", ")}`, payload: bstSnap(root, colors) });
        break;
      }
      case "clear":
        root = undefined;
        steps.push({ note: "clear()", payload: bstSnap(root) });
        break;
    }
  }
  return steps;
}

// =====================================================================
// HEAP (min-heap by default; toggle via first cmd arg or use max ops)
// =====================================================================
export const heapOpsDefs: OpDef[] = [
  { id: "push", label: "push(v)", args: [{ name: "v", kind: "number" }] },
  { id: "pop", label: "pop()" },
  { id: "peek", label: "peek()" },
  { id: "clear", label: "clear()" },
];
export function heapRunOps(cmds: OpCommand[]): Step[] {
  const h: number[] = [];
  const cmp = (a: number, b: number) => a - b; // min-heap
  const snap = (colors: Record<number, StepColor> = {}, note = ""): TreePayload => {
    const level: (number | null)[] = h.map((x) => x);
    const layout = layoutBinaryTree(level);
    return { ...layout, nodes: layout.nodes.map((n) => ({ ...n, color: colors[n.id] })) };
  };
  const steps: Step[] = [{ note: "empty min-heap", payload: snap() }];
  const swap = (i: number, j: number) => { const t = h[i]; h[i] = h[j]; h[j] = t; };
  for (const c of cmds) {
    const v = num(c.args[0]);
    switch (c.op) {
      case "push": {
        h.push(v);
        let i = h.length - 1;
        steps.push({ note: `push(${v})`, payload: snap({ [i]: "active" }) });
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (cmp(h[i], h[p]) < 0) {
            steps.push({ note: `sift-up: swap ${h[i]} ↔ ${h[p]}`, payload: snap({ [i]: "warn", [p]: "warn" }) });
            swap(i, p);
            i = p;
          } else break;
        }
        steps.push({ note: "heapified", payload: snap({ [i]: "done" }) });
        break;
      }
      case "pop": {
        if (!h.length) { steps.push({ note: "pop on empty", payload: snap() }); break; }
        const top = h[0];
        steps.push({ note: `pop → ${top}`, payload: snap({ 0: "warn" }) });
        const last = h.pop()!;
        if (h.length) {
          h[0] = last;
          let i = 0;
          steps.push({ note: "move last to root, sift-down", payload: snap({ 0: "active" }) });
          while (true) {
            const l = 2 * i + 1, r = 2 * i + 2;
            let s = i;
            if (l < h.length && cmp(h[l], h[s]) < 0) s = l;
            if (r < h.length && cmp(h[r], h[s]) < 0) s = r;
            if (s === i) break;
            steps.push({ note: `sift-down: swap ${h[i]} ↔ ${h[s]}`, payload: snap({ [i]: "warn", [s]: "warn" }) });
            swap(i, s);
            i = s;
          }
        }
        steps.push({ note: "heap restored", payload: snap() });
        break;
      }
      case "peek":
        if (!h.length) { steps.push({ note: "peek on empty", payload: snap() }); break; }
        steps.push({ note: `peek → ${h[0]}`, payload: snap({ 0: "done" }) });
        break;
      case "clear":
        h.length = 0;
        steps.push({ note: "clear()", payload: snap() });
        break;
    }
  }
  return steps;
}
