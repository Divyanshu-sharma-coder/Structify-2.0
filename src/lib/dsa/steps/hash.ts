import type { Step, HashPayload } from "../types";

const H = (s: string, buckets: number) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % buckets;
};

const parseKV = (input: string, fallback: [string, string][] = [["cat", "🐱"], ["dog", "🐶"], ["fox", "🦊"], ["ant", "🐜"], ["owl", "🦉"]]): [string, string][] => {
  const cleaned = input.trim();
  if (!cleaned) return fallback;
  const out: [string, string][] = [];
  for (const chunk of cleaned.split(/[,;\n]+/)) {
    const c = chunk.trim();
    if (!c) continue;
    const [k, v] = c.split(/[:=]/).map((s) => s.trim());
    if (k) out.push([k, v ?? "1"]);
  }
  return out.length ? out : fallback;
};

export function hashMapSteps(input: string): Step[] {
  const pairs = parseKV(input);
  const bucketsCount = 7;
  const buckets: { key: string; val: string; color?: "active" | "done" }[][] = Array.from({ length: bucketsCount }, () => []);
  const steps: Step[] = [];
  const snap = (payload: Partial<HashPayload> = {}): HashPayload => ({
    buckets: buckets.map((b) => b.map((e) => ({ ...e }))),
    ...payload,
  });
  steps.push({ line: 1, note: `Hash map with ${bucketsCount} buckets`, payload: snap() });
  for (const [k, v] of pairs) {
    const idx = H(k, bucketsCount);
    steps.push({ line: 2, note: `hash("${k}") = ${idx}`, payload: snap({ highlightBucket: idx, extra: `insert ${k}=${v}` }) });
    buckets[idx].push({ key: k, val: v, color: "active" });
    steps.push({ line: 3, note: `insert into bucket[${idx}]`, payload: snap({ highlightBucket: idx }) });
    buckets[idx] = buckets[idx].map((e) => ({ ...e, color: undefined }));
  }
  // lookup
  const lk = pairs[0]?.[0];
  if (lk) {
    const idx = H(lk, bucketsCount);
    steps.push({ line: 4, note: `get("${lk}") → hash=${idx}`, payload: snap({ highlightBucket: idx }) });
    buckets[idx] = buckets[idx].map((e) => ({ ...e, color: e.key === lk ? "done" : undefined }));
    steps.push({ line: 5, note: `found in chain: ${lk} = ${pairs[0][1]}`, payload: snap({ highlightBucket: idx }) });
  }
  return steps;
}

export function hashSetSteps(input: string): Step[] {
  const items = (input.trim() || "5,2,8,5,1,2,9,8").split(/[,\s]+/).filter(Boolean);
  const bucketsCount = 7;
  const buckets: { key: string; val: string; color?: "active" | "warn" | "done" }[][] = Array.from({ length: bucketsCount }, () => []);
  const steps: Step[] = [];
  const snap = (extra?: string, hb?: number): HashPayload => ({
    buckets: buckets.map((b) => b.map((e) => ({ ...e }))),
    highlightBucket: hb,
    extra,
  });
  steps.push({ line: 1, note: "empty hash set", payload: snap() });
  for (const v of items) {
    const idx = H(v, bucketsCount);
    const dup = buckets[idx].find((e) => e.key === v);
    steps.push({ line: 2, note: `add(${v}) → hash=${idx}`, payload: snap(dup ? "duplicate" : "new", idx) });
    if (dup) {
      dup.color = "warn";
      steps.push({ line: 3, note: `already present, skip`, payload: snap("duplicate skipped", idx) });
      dup.color = undefined;
    } else {
      buckets[idx].push({ key: v, val: "•", color: "active" });
      steps.push({ line: 4, note: `inserted unique`, payload: snap(undefined, idx) });
      buckets[idx].forEach((e) => (e.color = undefined));
    }
  }
  return steps;
}
