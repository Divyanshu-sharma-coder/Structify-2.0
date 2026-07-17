import type { Step, BarsPayload } from "../types";
import { parseNumberArray } from "../parse";

const snap = (arr: number[], highlights: Record<number, "active" | "visited" | "done" | "warn" | "path"> = {}, labels: Record<number, string> = {}): BarsPayload => ({
  arr: [...arr],
  highlights,
  labels,
});

export function linearSearchSteps(input: string): Step[] {
  const parts = input.split("|");
  const arr = parseNumberArray(parts[0], [3, 5, 7, 2, 9, 4, 6]);
  const target = Number(parts[1] ?? "9") || 9;
  const steps: Step[] = [];
  steps.push({ line: 1, note: `search ${target}`, payload: snap(arr) });
  for (let i = 0; i < arr.length; i++) {
    steps.push({ line: 2, note: `check a[${i}] = ${arr[i]}`, payload: snap(arr, { [i]: "active" }) });
    if (arr[i] === target) {
      steps.push({ line: 3, note: `found at ${i}`, payload: snap(arr, { [i]: "done" }) });
      return steps;
    }
  }
  steps.push({ line: 4, note: "not found", payload: snap(arr) });
  return steps;
}

export function binarySearchSteps(input: string): Step[] {
  const parts = input.split("|");
  const arr = parseNumberArray(parts[0], [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]).slice().sort((a, b) => a - b);
  const target = Number(parts[1] ?? "13") || 13;
  const steps: Step[] = [];
  let l = 0, r = arr.length - 1;
  steps.push({ line: 1, note: `sorted; target=${target}`, payload: snap(arr, { [l]: "visited", [r]: "visited" }, { [l]: "L", [r]: "R" }) });
  while (l <= r) {
    const m = (l + r) >> 1;
    steps.push({ line: 2, note: `mid=${m}, a[m]=${arr[m]}`, payload: snap(arr, { [l]: "visited", [r]: "visited", [m]: "active" }, { [l]: "L", [r]: "R", [m]: "M" }) });
    if (arr[m] === target) { steps.push({ line: 3, note: `found at ${m}`, payload: snap(arr, { [m]: "done" }) }); return steps; }
    if (arr[m] < target) l = m + 1;
    else r = m - 1;
    steps.push({ line: 4, note: `narrow to [${l}..${r}]`, payload: snap(arr, l <= r ? { [l]: "visited", [r]: "visited" } : {}, l <= r ? { [l]: "L", [r]: "R" } : {}) });
  }
  steps.push({ line: 5, note: "not found", payload: snap(arr) });
  return steps;
}

export function ternarySearchSteps(input: string): Step[] {
  // Find min of unimodal parabola f(x)=(x-target)^2 approximated on the array
  const parts = input.split("|");
  const arr = parseNumberArray(parts[0], Array.from({ length: 15 }, (_, i) => (i - 7) * (i - 7) + 3));
  const steps: Step[] = [];
  let l = 0, r = arr.length - 1;
  steps.push({ line: 1, note: "ternary search for minimum on unimodal array", payload: snap(arr, { [l]: "visited", [r]: "visited" }, { [l]: "L", [r]: "R" }) });
  while (r - l > 2) {
    const m1 = l + Math.floor((r - l) / 3);
    const m2 = r - Math.floor((r - l) / 3);
    steps.push({ line: 2, note: `m1=${m1}(${arr[m1]}), m2=${m2}(${arr[m2]})`, payload: snap(arr, { [l]: "visited", [r]: "visited", [m1]: "active", [m2]: "active" }, { [l]: "L", [r]: "R", [m1]: "m1", [m2]: "m2" }) });
    if (arr[m1] < arr[m2]) r = m2 - 1;
    else l = m1 + 1;
    steps.push({ line: 3, note: `narrow to [${l}..${r}]`, payload: snap(arr, { [l]: "visited", [r]: "visited" }, { [l]: "L", [r]: "R" }) });
  }
  let mi = l;
  for (let i = l; i <= r; i++) if (arr[i] < arr[mi]) mi = i;
  steps.push({ line: 4, note: `min at index ${mi} = ${arr[mi]}`, payload: snap(arr, { [mi]: "done" }) });
  return steps;
}
