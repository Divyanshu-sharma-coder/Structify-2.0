import type { Step, GridPayload, TextPayload, BitsPayload, StepColor, ConceptPayload, BarsPayload } from "../types";
import { parseNumberArray, parseString, parseInt2 } from "../parse";

// BACKTRACKING — N-Queens ---------------------------------------------
export function backtrackingSteps(input: string): Step[] {
  const n = Math.min(8, Math.max(4, parseInt2(input, 5)));
  const board: number[] = Array(n).fill(-1);
  const steps: Step[] = [];
  const snap = (colors: Record<string, StepColor> = {}, caption?: string): GridPayload => {
    const cells: (string | number)[][] = Array.from({ length: n }, () => Array(n).fill(""));
    const cs: (StepColor | undefined)[][] = Array.from({ length: n }, () => Array(n).fill(undefined));
    for (let r = 0; r < n; r++) if (board[r] >= 0) { cells[r][board[r]] = "♛"; cs[r][board[r]] = "done"; }
    for (const k in colors) { const [r, c] = k.split(",").map(Number); cs[r][c] = colors[k]; }
    return { rows: n, cols: n, cells, colors: cs, caption };
  };
  const canPlace = (r: number, c: number) => {
    for (let i = 0; i < r; i++) if (board[i] === c || Math.abs(board[i] - c) === r - i) return false;
    return true;
  };
  let solved = false;
  const rec = (r: number) => {
    if (solved) return;
    if (r === n) { solved = true; steps.push({ line: 4, note: "solution!", payload: snap({}, "found valid placement") }); return; }
    for (let c = 0; c < n; c++) {
      steps.push({ line: 1, note: `try row ${r} col ${c}`, payload: snap({ [`${r},${c}`]: "active" }) });
      if (canPlace(r, c)) {
        board[r] = c;
        steps.push({ line: 2, note: `place queen`, payload: snap({}) });
        rec(r + 1);
        if (solved) return;
        board[r] = -1;
        steps.push({ line: 3, note: `backtrack from (${r},${c})`, payload: snap({ [`${r},${c}`]: "warn" }) });
      } else {
        steps.push({ line: 3, note: `conflict — skip`, payload: snap({ [`${r},${c}`]: "warn" }) });
      }
    }
  };
  steps.push({ line: 0, note: `${n}-Queens`, payload: snap({}, "backtracking search") });
  rec(0);
  return steps;
}

// KMP ------------------------------------------------------------------
export function kmpSteps(input: string): Step[] {
  const parts = input.split("|");
  const text = parseString(parts[0]?.trim() || "abxabcabcaby");
  const pattern = parseString(parts[1]?.trim() || "abcaby");
  const steps: Step[] = [];
  // Build LPS
  const lps = new Array(pattern.length).fill(0);
  let len = 0, i = 1;
  steps.push({ line: 1, note: "build LPS array", payload: { text, pattern, extra: `LPS=[${lps.join(",")}]` } satisfies TextPayload });
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) { len++; lps[i] = len; i++; }
    else if (len !== 0) len = lps[len - 1];
    else { lps[i] = 0; i++; }
    steps.push({ line: 2, note: `LPS build i=${i}`, payload: { text, pattern, extra: `LPS=[${lps.join(",")}]` } satisfies TextPayload });
  }
  // Search
  let ti = 0, pi = 0;
  while (ti < text.length) {
    const highlights = [{ start: ti - pi, end: ti - pi + pi, color: "visited" as StepColor }, { start: ti, end: ti + 1, color: "active" as StepColor }];
    const ph = [{ start: pi, end: pi + 1, color: "active" as StepColor }];
    steps.push({ line: 3, note: `compare text[${ti}]=${text[ti]} vs pattern[${pi}]=${pattern[pi]}`, payload: { text, pattern, highlights, patternHighlights: ph } satisfies TextPayload });
    if (text[ti] === pattern[pi]) { ti++; pi++; }
    if (pi === pattern.length) {
      steps.push({ line: 4, note: `match found at index ${ti - pi}`, payload: { text, pattern, highlights: [{ start: ti - pi, end: ti, color: "done" }], patternHighlights: [{ start: 0, end: pattern.length, color: "done" }] } satisfies TextPayload });
      pi = lps[pi - 1];
    } else if (ti < text.length && text[ti] !== pattern[pi]) {
      if (pi !== 0) pi = lps[pi - 1];
      else ti++;
    }
  }
  return steps;
}

// RABIN-KARP -----------------------------------------------------------
export function rabinKarpSteps(input: string): Step[] {
  const parts = input.split("|");
  const text = parseString(parts[0]?.trim() || "GEEKS FOR GEEKS");
  const pattern = parseString(parts[1]?.trim() || "GEEK");
  const steps: Step[] = [];
  const d = 256, q = 101;
  const m = pattern.length;
  let h = 1;
  for (let i = 0; i < m - 1; i++) h = (h * d) % q;
  let p = 0, t = 0;
  for (let i = 0; i < m; i++) {
    p = (d * p + pattern.charCodeAt(i)) % q;
    t = (d * t + text.charCodeAt(i)) % q;
  }
  steps.push({ line: 1, note: `pattern hash=${p}, first window hash=${t}`, payload: { text, pattern, extra: `d=${d} q=${q}` } satisfies TextPayload });
  for (let i = 0; i <= text.length - m; i++) {
    const highlights = [{ start: i, end: i + m, color: "active" as StepColor }];
    const ph = [{ start: 0, end: m, color: "visited" as StepColor }];
    steps.push({ line: 2, note: `window [${i}..${i + m - 1}] hash=${t}`, payload: { text, pattern, highlights, patternHighlights: ph, extra: `p=${p} t=${t}` } satisfies TextPayload });
    if (p === t) {
      let ok = true;
      for (let j = 0; j < m; j++) if (text[i + j] !== pattern[j]) { ok = false; break; }
      if (ok) steps.push({ line: 3, note: `verified match at ${i}`, payload: { text, pattern, highlights: [{ start: i, end: i + m, color: "done" }], patternHighlights: [{ start: 0, end: m, color: "done" }] } satisfies TextPayload });
      else steps.push({ line: 4, note: `hash collision — reject`, payload: { text, pattern, highlights: [{ start: i, end: i + m, color: "warn" }] } satisfies TextPayload });
    }
    if (i < text.length - m) {
      t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
      if (t < 0) t += q;
    }
  }
  return steps;
}

// CONVEX HULL (Graham Scan) - visualized in grid
export function convexHullSteps(input: string): Step[] {
  const raw = parseNumberArray(input, [3, 4, 5, 6, 1, 2, 7, 3, 6, 5, 4, 6, 2, 5, 4, 2]);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i + 1 < raw.length; i += 2) pts.push({ x: raw[i], y: raw[i + 1] });
  const gridSize = Math.max(...pts.flatMap((p) => [p.x, p.y])) + 2;
  const steps: Step[] = [];
  const snap = (hull: { x: number; y: number }[], considering?: { x: number; y: number }, colors: Record<string, StepColor> = {}): GridPayload => {
    const cells: string[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));
    const cs: (StepColor | undefined)[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(undefined));
    for (const p of pts) { cells[gridSize - 1 - p.y][p.x] = "•"; }
    for (const p of hull) { cells[gridSize - 1 - p.y][p.x] = "●"; cs[gridSize - 1 - p.y][p.x] = "done"; }
    if (considering) { cells[gridSize - 1 - considering.y][considering.x] = "★"; cs[gridSize - 1 - considering.y][considering.x] = "active"; }
    for (const k in colors) { const [r, c] = k.split(",").map(Number); cs[r][c] = colors[k]; }
    return { rows: gridSize, cols: gridSize, cells, colors: cs, caption: "Graham Scan" };
  };
  // Sort by angle around lowest point
  const lowest = pts.reduce((a, b) => (b.y < a.y || (b.y === a.y && b.x < a.x) ? b : a));
  const cross = (o: any, a: any, b: any) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const sorted = [...pts].filter((p) => p !== lowest).sort((a, b) => Math.atan2(a.y - lowest.y, a.x - lowest.x) - Math.atan2(b.y - lowest.y, b.x - lowest.x));
  const hull: { x: number; y: number }[] = [lowest];
  steps.push({ line: 1, note: `start from lowest point (${lowest.x},${lowest.y})`, payload: snap(hull) });
  for (const p of sorted) {
    while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) {
      const popped = hull.pop()!;
      steps.push({ line: 2, note: `pop non-CCW turn at (${popped.x},${popped.y})`, payload: snap(hull, p) });
    }
    hull.push(p);
    steps.push({ line: 3, note: `push (${p.x},${p.y})`, payload: snap(hull) });
  }
  steps.push({ line: 4, note: "convex hull complete", payload: snap(hull) });
  return steps;
}

// DP — Fibonacci with memoization visualized
export function dpSteps(input: string): Step[] {
  const n = Math.min(15, Math.max(2, parseInt2(input, 8)));
  const dp = new Array(n + 1).fill(-1);
  const steps: Step[] = [];
  const snap = (colors: Record<number, StepColor> = {}, caption?: string): GridPayload => ({
    rows: 1,
    cols: n + 1,
    cells: [dp.map((v) => (v < 0 ? "?" : v))],
    colors: [Array.from({ length: n + 1 }, (_, i) => colors[i])],
    colLabels: Array.from({ length: n + 1 }, (_, i) => `f(${i})`),
    caption,
  });
  dp[0] = 0; dp[1] = 1;
  steps.push({ line: 1, note: "base cases f(0)=0, f(1)=1", payload: snap({ 0: "done", 1: "done" }) });
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({ line: 2, note: `f(${i}) = f(${i - 1}) + f(${i - 2}) = ${dp[i]}`, payload: snap({ [i - 2]: "visited", [i - 1]: "visited", [i]: "active" }) });
  }
  steps.push({ line: 3, note: `f(${n}) = ${dp[n]}`, payload: snap({ [n]: "done" }, "bottom-up DP table") });
  return steps;
}

// RECURSION — factorial trace via bars
export function recursionSteps(input: string): Step[] {
  const n = Math.min(8, Math.max(1, parseInt2(input, 5)));
  const steps: Step[] = [];
  const stack: number[] = [];
  const snap = (caption: string) => ({ arr: [...stack], highlights: stack.length ? { [stack.length - 1]: "active" as StepColor } : {}, labels: { 0: caption } });
  for (let i = 1; i <= n; i++) {
    stack.push(i);
    steps.push({ line: 1, note: `call factorial(${n - i + 1}) → wait for factorial(${n - i})`, payload: snap(`depth ${i}`) as BarsPayload });
  }
  let acc = 1;
  for (let i = n; i >= 1; i--) {
    acc *= i;
    stack.pop();
    steps.push({ line: 2, note: `return ${i}·${i > 1 ? "factorial(" + (i - 1) + ")" : "1"} = ${acc}`, payload: snap(`= ${acc}`) as BarsPayload });
  }
  steps.push({ line: 3, note: `factorial(${n}) = ${acc}`, payload: { arr: [acc], highlights: { 0: "done" as StepColor } } as BarsPayload });
  return steps;
}

// DIVIDE & CONQUER — max subarray via bars (already like merge)
export function divideConquerSteps(input: string): Step[] {
  const arr = parseNumberArray(input, [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
  const steps: Step[] = [];
  const snap = (l: number, r: number, extra: string) => ({
    arr,
    highlights: Object.fromEntries(Array.from({ length: r - l + 1 }, (_, i) => [l + i, "active" as StepColor])),
    labels: { [l]: "L", [r]: "R" },
  } as BarsPayload);
  const rec = (l: number, r: number, depth: number): number => {
    steps.push({ line: 1, note: `divide [${l}..${r}]`, payload: snap(l, r, `d=${depth}`) });
    if (l === r) return arr[l];
    const m = (l + r) >> 1;
    const a = rec(l, m, depth + 1);
    const b = rec(m + 1, r, depth + 1);
    const combined = Math.max(a, b);
    steps.push({ line: 2, note: `combine [${l}..${r}] max=${combined}`, payload: snap(l, r, "combine") });
    return combined;
  };
  const maxV = rec(0, arr.length - 1, 0);
  steps.push({ line: 3, note: `answer = ${maxV}`, payload: { arr, highlights: { [arr.indexOf(maxV)]: "done" as StepColor } } as BarsPayload });
  return steps;
}

// GREEDY — activity selection
export function greedySteps(input: string): Step[] {
  const parts = input.trim() || "1-3, 2-5, 4-7, 6-9, 5-8, 8-10";
  const acts = parts.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean).map((s) => {
    const [a, b] = s.split("-").map(Number); return { s: a, f: b };
  });
  acts.sort((a, b) => a.f - b.f);
  const steps: Step[] = [];
  const bars: BarsPayload = { arr: acts.map((a) => a.f - a.s), highlights: {}, labels: Object.fromEntries(acts.map((a, i) => [i, `${a.s}-${a.f}`])) };
  steps.push({ line: 1, note: "sort activities by finish time", payload: { ...bars } });
  let lastEnd = -1;
  const picked: number[] = [];
  for (let i = 0; i < acts.length; i++) {
    if (acts[i].s >= lastEnd) {
      picked.push(i); lastEnd = acts[i].f;
      steps.push({ line: 2, note: `pick activity ${acts[i].s}-${acts[i].f}`, payload: { ...bars, highlights: { ...Object.fromEntries(picked.map((p) => [p, "done" as StepColor])), [i]: "done" } } });
    } else {
      steps.push({ line: 3, note: `skip ${acts[i].s}-${acts[i].f} (overlap)`, payload: { ...bars, highlights: { ...Object.fromEntries(picked.map((p) => [p, "done" as StepColor])), [i]: "warn" } } });
    }
  }
  steps.push({ line: 4, note: `${picked.length} activities selected`, payload: { ...bars, highlights: Object.fromEntries(picked.map((p) => [p, "done" as StepColor])) } });
  return steps;
}

// BIT MANIPULATION
const toBin = (n: number, w = 8) => (n & ((1 << w) - 1)).toString(2).padStart(w, "0");
export function bitSteps(input: string): Step[] {
  const parts = input.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n));
  const a = parts[0] ?? 12;
  const b = parts[1] ?? 10;
  const steps: Step[] = [];
  const bits = (op: string, r: number, hi: number[] = []): BitsPayload => ({ a: toBin(a), b: toBin(b), op, result: toBin(r), highlights: hi });
  steps.push({ line: 1, note: `A=${a}, B=${b}`, payload: bits("input", 0) });
  steps.push({ line: 2, note: `AND: shared 1 bits`, payload: bits("A & B", a & b) });
  steps.push({ line: 3, note: `OR: union of 1 bits`, payload: bits("A | B", a | b) });
  steps.push({ line: 4, note: `XOR: differing bits`, payload: bits("A ^ B", a ^ b) });
  steps.push({ line: 5, note: `NOT A`, payload: { a: toBin(a), op: "~A", result: toBin(~a) } });
  steps.push({ line: 6, note: `A << 1`, payload: { a: toBin(a), op: "A << 1", result: toBin(a << 1) } });
  steps.push({ line: 7, note: `A >> 1`, payload: { a: toBin(a), op: "A >> 1", result: toBin(a >> 1) } });
  const cnt = a.toString(2).replace(/0/g, "").length;
  steps.push({ line: 8, note: `popcount(A) = ${cnt}`, payload: { a: toBin(a), op: "popcount", result: String(cnt).padStart(8, " ") } });
  return steps;
}

// Concept helper
export function conceptOnly(payload: ConceptPayload): Step[] {
  return [{ line: 1, note: payload.title, payload }];
}
