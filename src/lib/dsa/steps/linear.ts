import type { Step, CellsPayload, ListPayload, ConceptPayload } from "../types";
import { parseNumberArray } from "../parse";

// Helpers ----------------------------------------------------------------
const cells = (
  arr: (number | string | null)[],
  extras: Partial<CellsPayload> = {},
): CellsPayload => ({ arr, ...extras });

// STATIC ARRAY -----------------------------------------------------------
export function staticArraySteps(input: string): Step[] {
  const nums = parseNumberArray(input, [10, 20, 30, 40, 50]);
  const steps: Step[] = [];
  steps.push({ line: 1, note: "Static array: fixed size, contiguous memory.", payload: cells(nums) });
  for (let i = 0; i < nums.length; i++) {
    steps.push({
      line: 2,
      note: `Access index ${i}: constant time O(1).`,
      payload: cells(nums, { highlights: { [i]: "active" }, pointers: { i } }),
    });
  }
  steps.push({ line: 3, note: "Size is fixed; cannot grow beyond capacity.", payload: cells(nums, { extra: `capacity = ${nums.length}` }) });
  return steps;
}

// DYNAMIC ARRAY ----------------------------------------------------------
export function dynamicArraySteps(input: string): Step[] {
  const nums = parseNumberArray(input, [1, 2, 3]);
  const steps: Step[] = [];
  let cap = Math.max(2, 1 << Math.ceil(Math.log2(Math.max(2, nums.length))));
  const buf: (number | null)[] = new Array(cap).fill(null);
  let size = 0;
  steps.push({ line: 1, note: `Start empty. capacity=${cap}`, payload: cells([...buf], { extra: `size=0 cap=${cap}` }) });
  for (const v of nums) {
    if (size === cap) {
      const newCap = cap * 2;
      steps.push({ line: 2, note: `Full! Reallocate to ${newCap}.`, payload: cells([...buf], { extra: `resize ${cap}→${newCap}`, highlights: Object.fromEntries(buf.map((_, i) => [i, "warn"])) }) });
      cap = newCap;
      const nb: (number | null)[] = new Array(cap).fill(null);
      for (let i = 0; i < size; i++) nb[i] = buf[i];
      for (let i = 0; i < cap; i++) buf[i] = nb[i];
    }
    buf[size] = v;
    size++;
    steps.push({
      line: 3,
      note: `push(${v}) → size=${size}`,
      payload: cells([...buf], { highlights: { [size - 1]: "active" }, pointers: { size: size }, extra: `size=${size} cap=${cap}` }),
    });
  }
  steps.push({ line: 4, note: "Amortized O(1) push.", payload: cells([...buf], { extra: `size=${size} cap=${cap}` }) });
  return steps;
}

// LINKED LIST helpers ---------------------------------------------------
const listSteps = (input: string, kind: "singly" | "doubly" | "circular"): Step[] => {
  const nums = parseNumberArray(input, [10, 20, 30, 40]);
  const steps: Step[] = [];
  const nodes: { id: number; val: number; color?: "active" | "done" | "visited" | "warn" }[] = [];
  steps.push({
    line: 1,
    note: `${kind} linked list: build from ${JSON.stringify(nums)}`,
    payload: { kind, nodes: [] } satisfies ListPayload,
  });
  for (let i = 0; i < nums.length; i++) {
    nodes.push({ id: i, val: nums[i], color: "active" });
    steps.push({
      line: 2,
      note: `insert node value=${nums[i]} at tail`,
      payload: { kind, nodes: nodes.map((n, j) => ({ ...n, color: j === nodes.length - 1 ? "active" : undefined })), pointers: { tail: nodes.length - 1 } } satisfies ListPayload,
    });
  }
  // Traverse
  for (let i = 0; i < nodes.length; i++) {
    steps.push({
      line: 3,
      note: `traverse: visit node[${i}] = ${nodes[i].val}`,
      payload: { kind, nodes: nodes.map((n, j) => ({ ...n, color: j < i ? "done" : j === i ? "active" : undefined })), pointers: { curr: i } } satisfies ListPayload,
    });
  }
  if (kind === "circular") {
    steps.push({ line: 4, note: "tail.next → head (cycle established)", payload: { kind, nodes: nodes.map((n) => ({ ...n, color: "done" })) } satisfies ListPayload });
  }
  return steps;
};

export const singlyListSteps = (input: string) => listSteps(input, "singly");
export const doublyListSteps = (input: string) => listSteps(input, "doubly");
export const circularListSteps = (input: string) => listSteps(input, "circular");

// STACK -----------------------------------------------------------------
export function stackSteps(input: string): Step[] {
  const nums = parseNumberArray(input, [3, 7, 1, 9]);
  const steps: Step[] = [];
  const stack: number[] = [];
  steps.push({ line: 1, note: "empty stack", payload: cells([], { extra: "top → ∅" }) });
  for (const v of nums) {
    stack.push(v);
    steps.push({
      line: 2,
      note: `push(${v})`,
      payload: cells([...stack], { highlights: { [stack.length - 1]: "active" }, pointers: { top: stack.length - 1 } }),
    });
  }
  while (stack.length) {
    const idx = stack.length - 1;
    steps.push({ line: 3, note: `pop() → ${stack[idx]}`, payload: cells([...stack], { highlights: { [idx]: "warn" }, pointers: { top: idx } }) });
    stack.pop();
    steps.push({ line: 4, note: `after pop`, payload: cells([...stack], { pointers: stack.length ? { top: stack.length - 1 } : {} }) });
  }
  return steps;
}

// QUEUE -----------------------------------------------------------------
export function queueSteps(input: string): Step[] {
  const nums = parseNumberArray(input, [1, 2, 3, 4]);
  const steps: Step[] = [];
  const q: number[] = [];
  steps.push({ line: 1, note: "empty queue", payload: cells([]) });
  for (const v of nums) {
    q.push(v);
    steps.push({
      line: 2,
      note: `enqueue(${v})`,
      payload: cells([...q], { highlights: { [q.length - 1]: "active" }, pointers: { front: 0, back: q.length - 1 } }),
    });
  }
  while (q.length) {
    steps.push({ line: 3, note: `dequeue → ${q[0]}`, payload: cells([...q], { highlights: { 0: "warn" }, pointers: { front: 0, back: q.length - 1 } }) });
    q.shift();
    steps.push({ line: 4, note: `after dequeue`, payload: cells([...q], { pointers: q.length ? { front: 0, back: q.length - 1 } : {} }) });
  }
  return steps;
}

// DEQUE -----------------------------------------------------------------
export function dequeSteps(input: string): Step[] {
  const nums = parseNumberArray(input, [1, 2, 3]);
  const steps: Step[] = [];
  const dq: number[] = [];
  steps.push({ line: 1, note: "empty deque", payload: cells([]) });
  for (const v of nums) {
    dq.push(v);
    steps.push({ line: 2, note: `pushBack(${v})`, payload: cells([...dq], { highlights: { [dq.length - 1]: "active" }, pointers: { front: 0, back: dq.length - 1 } }) });
  }
  dq.unshift(99);
  steps.push({ line: 3, note: `pushFront(99)`, payload: cells([...dq], { highlights: { 0: "active" }, pointers: { front: 0, back: dq.length - 1 } }) });
  steps.push({ line: 4, note: `popBack → ${dq[dq.length - 1]}`, payload: cells([...dq], { highlights: { [dq.length - 1]: "warn" } }) });
  dq.pop();
  steps.push({ line: 5, note: `popFront → ${dq[0]}`, payload: cells([...dq], { highlights: { 0: "warn" } }) });
  dq.shift();
  steps.push({ line: 6, note: `final`, payload: cells([...dq]) });
  return steps;
}

// Concept fallback for primitives (used elsewhere too)
export const conceptSteps = (p: ConceptPayload): Step[] => [{ line: 1, note: p.title, payload: p }];
