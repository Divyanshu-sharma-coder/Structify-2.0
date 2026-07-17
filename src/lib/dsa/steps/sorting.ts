import type { Step, BarsPayload } from "../types";
import { parseNumberArray } from "../parse";

const snap = (arr: number[], highlights: Record<number, BarsPayload["highlights"] extends infer T ? T extends Record<number, infer U> ? U : never : never> = {}, sorted: number[] = [], labels: Record<number, string> = {}): BarsPayload => ({
  arr: [...arr],
  highlights,
  sorted: [...sorted],
  labels,
});

export function bubbleSortSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [5, 2, 8, 1, 9, 3, 7, 4]);
  const steps: Step[] = [];
  const sorted: number[] = [];
  steps.push({ line: 1, note: "start bubble sort", payload: snap(arr) });
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      steps.push({ line: 2, note: `compare a[${j}]=${arr[j]} vs a[${j + 1}]=${arr[j + 1]}`, payload: snap(arr, { [j]: "active", [j + 1]: "active" }, sorted) });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({ line: 3, note: `swap`, payload: snap(arr, { [j]: "warn", [j + 1]: "warn" }, sorted) });
      }
    }
    sorted.unshift(arr.length - i - 1);
  }
  steps.push({ line: 4, note: "sorted", payload: snap(arr, {}, arr.map((_, i) => i)) });
  return steps;
}

export function selectionSortSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [64, 25, 12, 22, 11]);
  const steps: Step[] = [];
  const sorted: number[] = [];
  steps.push({ line: 1, note: "start selection sort", payload: snap(arr) });
  for (let i = 0; i < arr.length - 1; i++) {
    let min = i;
    steps.push({ line: 2, note: `assume min = index ${i}`, payload: snap(arr, { [i]: "active" }, sorted) });
    for (let j = i + 1; j < arr.length; j++) {
      steps.push({ line: 3, note: `check a[${j}] vs min=a[${min}]`, payload: snap(arr, { [min]: "active", [j]: "visited" }, sorted) });
      if (arr[j] < arr[min]) min = j;
    }
    if (min !== i) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
      steps.push({ line: 4, note: `swap ${i} ↔ ${min}`, payload: snap(arr, { [i]: "warn", [min]: "warn" }, sorted) });
    }
    sorted.push(i);
  }
  sorted.push(arr.length - 1);
  steps.push({ line: 5, note: "sorted", payload: snap(arr, {}, sorted) });
  return steps;
}

export function insertionSortSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [5, 2, 4, 6, 1, 3]);
  const steps: Step[] = [];
  const sorted: number[] = [0];
  steps.push({ line: 1, note: "start", payload: snap(arr, {}, sorted) });
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    steps.push({ line: 2, note: `key = a[${i}] = ${key}`, payload: snap(arr, { [i]: "active" }, sorted) });
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      steps.push({ line: 3, note: `shift a[${j}] → a[${j + 1}]`, payload: snap(arr, { [j]: "warn", [j + 1]: "active" }, sorted) });
      j--;
    }
    arr[j + 1] = key;
    sorted.push(i);
    steps.push({ line: 4, note: `place key at ${j + 1}`, payload: snap(arr, { [j + 1]: "done" }, sorted) });
  }
  return steps;
}

export function mergeSortSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [38, 27, 43, 3, 9, 82, 10]);
  const steps: Step[] = [];
  const a = [...arr];
  steps.push({ line: 1, note: "merge sort start", payload: snap(a) });
  const rec = (l: number, r: number) => {
    if (l >= r) return;
    const m = (l + r) >> 1;
    steps.push({ line: 2, note: `split [${l}..${r}] at ${m}`, payload: snap(a, Object.fromEntries(Array.from({ length: r - l + 1 }, (_, k) => [l + k, "active"]))) });
    rec(l, m);
    rec(m + 1, r);
    const left = a.slice(l, m + 1);
    const right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) a[k++] = left[i++];
      else a[k++] = right[j++];
      steps.push({ line: 3, note: `merge into [${l}..${r}]`, payload: snap(a, { [k - 1]: "visited" }) });
    }
    while (i < left.length) { a[k++] = left[i++]; steps.push({ line: 3, note: "merge", payload: snap(a, { [k - 1]: "visited" }) }); }
    while (j < right.length) { a[k++] = right[j++]; steps.push({ line: 3, note: "merge", payload: snap(a, { [k - 1]: "visited" }) }); }
    steps.push({ line: 4, note: `merged [${l}..${r}]`, payload: snap(a, Object.fromEntries(Array.from({ length: r - l + 1 }, (_, x) => [l + x, "done"]))) });
  };
  rec(0, a.length - 1);
  steps.push({ line: 5, note: "sorted", payload: snap(a, {}, a.map((_, i) => i)) });
  return steps;
}

export function quickSortSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [10, 7, 8, 9, 1, 5]);
  const steps: Step[] = [];
  const a = [...arr];
  steps.push({ line: 1, note: "quick sort start", payload: snap(a) });
  const rec = (l: number, r: number) => {
    if (l >= r) return;
    const pivot = a[r];
    steps.push({ line: 2, note: `pivot = a[${r}] = ${pivot}`, payload: snap(a, { [r]: "warn" }, [], { [r]: "pivot" }) });
    let i = l - 1;
    for (let j = l; j < r; j++) {
      steps.push({ line: 3, note: `check a[${j}]=${a[j]} ≤ pivot ${pivot}`, payload: snap(a, { [j]: "active", [r]: "warn" }) });
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({ line: 4, note: `swap a[${i}] ↔ a[${j}]`, payload: snap(a, { [i]: "visited", [j]: "visited", [r]: "warn" }) });
      }
    }
    [a[i + 1], a[r]] = [a[r], a[i + 1]];
    steps.push({ line: 5, note: `place pivot at ${i + 1}`, payload: snap(a, { [i + 1]: "done" }) });
    rec(l, i);
    rec(i + 2, r);
  };
  rec(0, a.length - 1);
  steps.push({ line: 6, note: "sorted", payload: snap(a, {}, a.map((_, i) => i)) });
  return steps;
}

export function heapSortSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [4, 10, 3, 5, 1, 8, 2]);
  const steps: Step[] = [];
  const a = [...arr];
  const n0 = a.length;
  const sorted: number[] = [];
  const heapify = (n: number, i: number) => {
    let largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && a[l] > a[largest]) largest = l;
    if (r < n && a[r] > a[largest]) largest = r;
    if (largest !== i) {
      steps.push({ line: 2, note: `heapify: swap ${i}↔${largest}`, payload: snap(a, { [i]: "active", [largest]: "warn" }, sorted) });
      [a[i], a[largest]] = [a[largest], a[i]];
      heapify(n, largest);
    }
  };
  steps.push({ line: 1, note: "build max heap", payload: snap(a) });
  for (let i = Math.floor(n0 / 2) - 1; i >= 0; i--) heapify(n0, i);
  steps.push({ line: 3, note: "max heap built", payload: snap(a) });
  for (let i = n0 - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    sorted.unshift(i);
    steps.push({ line: 4, note: `extract max → position ${i}`, payload: snap(a, { 0: "warn", [i]: "done" }, sorted) });
    heapify(i, 0);
  }
  sorted.unshift(0);
  steps.push({ line: 5, note: "sorted", payload: snap(a, {}, sorted) });
  return steps;
}

export function countingSortSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [4, 2, 2, 8, 3, 3, 1]);
  const steps: Step[] = [];
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);
  steps.push({ line: 1, note: `input, max=${max}`, payload: snap(arr) });
  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++;
    steps.push({ line: 2, note: `count[${arr[i]}]++`, payload: snap(arr, { [i]: "active" }) });
  }
  const out: number[] = [];
  for (let v = 0; v <= max; v++) {
    for (let k = 0; k < count[v]; k++) {
      out.push(v);
      steps.push({ line: 3, note: `emit ${v}`, payload: snap(out, { [out.length - 1]: "done" }) });
    }
  }
  steps.push({ line: 4, note: "sorted", payload: snap(out, {}, out.map((_, i) => i)) });
  return steps;
}

export function radixSortSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [170, 45, 75, 90, 802, 24, 2, 66]).map((n) => Math.abs(n));
  const steps: Step[] = [];
  let a = [...arr];
  const max = Math.max(...a);
  steps.push({ line: 1, note: "start radix (LSD base 10)", payload: snap(a) });
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    for (const v of a) buckets[Math.floor(v / exp) % 10].push(v);
    steps.push({ line: 2, note: `digit place ${exp}: distributed into 10 buckets`, payload: snap(a, {}, [], Object.fromEntries(a.map((v, i) => [i, String(Math.floor(v / exp) % 10)]))) });
    a = buckets.flat();
    steps.push({ line: 3, note: `collect`, payload: snap(a) });
  }
  steps.push({ line: 4, note: "sorted", payload: snap(a, {}, a.map((_, i) => i)) });
  return steps;
}

export function bucketSortSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [29, 25, 3, 49, 9, 37, 21, 43]);
  const steps: Step[] = [];
  const max = Math.max(...arr) + 1;
  const k = Math.min(5, arr.length);
  const buckets: number[][] = Array.from({ length: k }, () => []);
  steps.push({ line: 1, note: `create ${k} buckets`, payload: snap(arr) });
  for (let i = 0; i < arr.length; i++) {
    const b = Math.min(k - 1, Math.floor((arr[i] / max) * k));
    buckets[b].push(arr[i]);
    steps.push({ line: 2, note: `a[${i}]=${arr[i]} → bucket ${b}`, payload: snap(arr, { [i]: "active" }, [], { [i]: `→b${b}` }) });
  }
  const out: number[] = [];
  for (const b of buckets) {
    b.sort((x, y) => x - y);
    out.push(...b);
    steps.push({ line: 3, note: `sort bucket & append`, payload: snap(out, {}, out.map((_, i) => i)) });
  }
  steps.push({ line: 4, note: "sorted", payload: snap(out, {}, out.map((_, i) => i)) });
  return steps;
}
