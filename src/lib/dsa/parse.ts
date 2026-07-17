export function parseNumberArray(input: string, fallback: number[] = [5, 2, 8, 1, 9, 3]): number[] {
  const cleaned = input
    .replace(/[\[\]()]/g, " ")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const nums = cleaned.map(Number).filter((n) => Number.isFinite(n));
  return nums.length ? nums : fallback;
}

export function parseStringArray(input: string, fallback: string[] = ["cat", "car", "cart"]): string[] {
  const parts = input
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : fallback;
}

export function parseInt2(input: string, fallback = 0): number {
  const n = Number(input.trim());
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export function parseString(input: string, fallback = ""): string {
  return input.length ? input : fallback;
}

// Parse graph in "a-b:3, b-c:1, ..." format. Weight optional.
export function parseGraph(input: string, fallback = "a-b:4, a-c:1, c-b:2, b-d:1, c-d:5, d-e:3, b-e:5") {
  const src = input.trim().length ? input : fallback;
  const edges: { from: string; to: string; weight: number }[] = [];
  const nodeSet = new Set<string>();
  for (const raw of src.split(/[,\n]+/)) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const m = chunk.match(/^([A-Za-z0-9_]+)\s*-\s*([A-Za-z0-9_]+)(?::\s*(-?\d+(?:\.\d+)?))?$/);
    if (!m) continue;
    const from = m[1];
    const to = m[2];
    const weight = m[3] !== undefined ? Number(m[3]) : 1;
    edges.push({ from, to, weight });
    nodeSet.add(from);
    nodeSet.add(to);
  }
  const nodes = Array.from(nodeSet);
  return { nodes, edges };
}
