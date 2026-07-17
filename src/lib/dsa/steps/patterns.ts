import type { Step, BarsPayload, ListPayload, CellsPayload } from "../types";
import { parseNumberArray } from "../parse";

const bars = (arr: number[], h: Record<number, "active" | "visited" | "done" | "warn" | "path"> = {}, labels: Record<number, string> = {}): BarsPayload => ({ arr: [...arr], highlights: h, labels });

export function twoPointersSteps(input: string): Step[] {
  const parts = input.split("|");
  const arr = parseNumberArray(parts[0], [1, 2, 3, 4, 5, 6, 7, 8]).sort((a, b) => a - b);
  const target = Number(parts[1] ?? "9") || 9;
  const steps: Step[] = [];
  let l = 0, r = arr.length - 1;
  steps.push({ line: 1, note: `sorted; find pair summing to ${target}`, payload: bars(arr, { [l]: "active", [r]: "active" }, { [l]: "L", [r]: "R" }) });
  while (l < r) {
    const s = arr[l] + arr[r];
    steps.push({ line: 2, note: `a[${l}]+a[${r}] = ${s}`, payload: bars(arr, { [l]: "active", [r]: "active" }, { [l]: "L", [r]: "R" }) });
    if (s === target) { steps.push({ line: 3, note: `found`, payload: bars(arr, { [l]: "done", [r]: "done" }) }); return steps; }
    if (s < target) l++;
    else r--;
  }
  steps.push({ line: 4, note: "no pair", payload: bars(arr) });
  return steps;
}

export function slidingWindowSteps(input: string): Step[] {
  const parts = input.split("|");
  const arr = parseNumberArray(parts[0], [2, 1, 5, 1, 3, 2, 7, 1]);
  const k = Math.max(2, Number(parts[1] ?? "3") || 3);
  const steps: Step[] = [];
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];
  steps.push({ line: 1, note: `initial window sum = ${sum}`, payload: bars(arr, Object.fromEntries(Array.from({ length: k }, (_, i) => [i, "active"])), { 0: "L", [k - 1]: "R" }) });
  let best = sum, bestL = 0;
  for (let i = k; i < arr.length; i++) {
    sum += arr[i] - arr[i - k];
    steps.push({ line: 2, note: `slide: +a[${i}] -a[${i - k}] → sum=${sum}`, payload: bars(arr, Object.fromEntries(Array.from({ length: k }, (_, x) => [i - k + 1 + x, "active"])), { [i - k + 1]: "L", [i]: "R" }) });
    if (sum > best) { best = sum; bestL = i - k + 1; }
  }
  steps.push({ line: 3, note: `max = ${best} at [${bestL}..${bestL + k - 1}]`, payload: bars(arr, Object.fromEntries(Array.from({ length: k }, (_, x) => [bestL + x, "done"]))) });
  return steps;
}

export function prefixSumSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [3, 1, 4, 1, 5, 9, 2, 6]);
  const pref = new Array(arr.length + 1).fill(0);
  const steps: Step[] = [];
  steps.push({ line: 1, note: "input", payload: bars(arr) });
  for (let i = 0; i < arr.length; i++) {
    pref[i + 1] = pref[i] + arr[i];
    const cells: CellsPayload = { arr: pref.map((x) => String(x)), highlights: { [i + 1]: "active" }, extra: `prefix[${i + 1}]=prefix[${i}]+a[${i}]` };
    steps.push({ line: 2, note: `build prefix[${i + 1}]=${pref[i + 1]}`, payload: cells });
  }
  const q: [number, number] = [2, 5];
  const rangeSum = pref[q[1] + 1] - pref[q[0]];
  steps.push({ line: 3, note: `query sum[${q[0]}..${q[1]}] = prefix[${q[1] + 1}] - prefix[${q[0]}] = ${rangeSum}`, payload: bars(arr, Object.fromEntries(Array.from({ length: q[1] - q[0] + 1 }, (_, k) => [q[0] + k, "done"]))) });
  return steps;
}

export function floydCycleSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [1, 2, 3, 4, 5, 6, 7, 8]);
  const cycleAt = 4; // tail loops back to index cycleAt
  const steps: Step[] = [];
  const nodes = arr.map((v, i) => ({ id: i, val: v as number | string }));
  const total = nodes.length;
  const pointers = (slow: number, fast: number) => ({ slow, fast });
  const buildList = (slow: number, fast: number, colored?: { [k: number]: "active" | "done" | "visited" | "warn" }): ListPayload => ({
    kind: "singly",
    nodes: nodes.map((n, i) => ({ ...n, color: colored?.[i] })),
    pointers: pointers(slow, fast),
  });
  steps.push({ line: 1, note: `linked list of ${total}, tail loops back to index ${cycleAt}`, payload: buildList(0, 0) });
  let slow = 0, fast = 0;
  for (let step = 0; step < 30; step++) {
    slow = slow + 1 >= total ? cycleAt : slow + 1;
    fast = fast + 1 >= total ? cycleAt : fast + 1;
    fast = fast + 1 >= total ? cycleAt : fast + 1;
    steps.push({ line: 2, note: `slow→${slow}, fast→${fast}`, payload: buildList(slow, fast, { [slow]: "active", [fast]: "warn" }) });
    if (slow === fast) { steps.push({ line: 3, note: `cycle detected at index ${slow}`, payload: buildList(slow, fast, { [slow]: "done" }) }); break; }
  }
  return steps;
}
