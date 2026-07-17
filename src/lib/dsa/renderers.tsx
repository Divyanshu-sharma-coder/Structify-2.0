import type {
  BarsPayload,
  BitsPayload,
  CellsPayload,
  ConceptPayload,
  GraphPayload,
  GridPayload,
  HashPayload,
  ListPayload,
  StepColor,
  TextPayload,
  TreePayload,
} from "./types";

const colorClass = (c?: StepColor) => {
  switch (c) {
    case "active":
      return "bg-dsa-active text-dsa-active-fg border-dsa-active";
    case "visited":
      return "bg-dsa-visited text-dsa-visited-fg border-dsa-visited";
    case "done":
      return "bg-dsa-done text-dsa-done-fg border-dsa-done";
    case "warn":
      return "bg-destructive text-destructive-foreground border-destructive";
    case "path":
      return "bg-dsa-done text-dsa-done-fg border-dsa-done";
    default:
      return "bg-dsa-node text-dsa-node-fg border-border";
  }
};

const svgColor = (c?: StepColor) => {
  switch (c) {
    case "active":
      return "var(--color-dsa-active)";
    case "visited":
      return "var(--color-dsa-visited)";
    case "done":
    case "path":
      return "var(--color-dsa-done)";
    case "warn":
      return "var(--color-dsa-warn)";
    default:
      return "var(--color-dsa-node)";
  }
};
const svgFg = (c?: StepColor) => {
  switch (c) {
    case "active":
      return "var(--color-dsa-active-fg)";
    case "done":
    case "path":
      return "var(--color-dsa-done-fg)";
    default:
      return "var(--color-dsa-node-fg)";
  }
};

export function BarsRender({ p }: { p: BarsPayload }) {
  const max = Math.max(1, ...p.arr.map((v) => Math.abs(v)));
  const sortedSet = new Set(p.sorted ?? []);
  return (
    <div className="flex items-end gap-1 h-64 px-2 pt-4 pb-2 justify-center overflow-x-auto">
      {p.arr.map((v, i) => {
        const h = (Math.abs(v) / max) * 220 + 20;
        const c = sortedSet.has(i) ? "done" : p.highlights?.[i];
        return (
          <div key={i} className="flex flex-col items-center gap-1 min-w-[28px]">
            <div
              className={`w-7 rounded-t-md border transition-all duration-200 ${colorClass(c)}`}
              style={{ height: h }}
              title={String(v)}
            />
            <span className="text-[10px] mono text-muted-foreground">{v}</span>
            {p.labels?.[i] ? <span className="text-[10px] text-primary">{p.labels[i]}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

export function CellsRender({ p }: { p: CellsPayload }) {
  return (
    <div className="p-4 flex flex-col items-center gap-3">
      <div className="flex flex-wrap gap-1 justify-center max-w-full">
        {p.arr.map((v, i) => {
          const c = p.highlights?.[i];
          const ptrs = Object.entries(p.pointers ?? {})
            .filter(([, idx]) => idx === i)
            .map(([name]) => name);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`min-w-[44px] h-11 flex items-center justify-center rounded-md border text-sm mono ${colorClass(c)}`}
              >
                {v === null || v === undefined ? "" : v}
              </div>
              <span className="text-[10px] text-muted-foreground mono">{i}</span>
              {ptrs.length ? (
                <span className="text-[10px] text-primary mono">↑{ptrs.join(",")}</span>
              ) : null}
            </div>
          );
        })}
      </div>
      {p.extra ? <div className="text-xs text-muted-foreground mono">{p.extra}</div> : null}
    </div>
  );
}

export function ListRender({ p }: { p: ListPayload }) {
  const arrow = p.kind === "doubly" ? "⇄" : "→";
  return (
    <div className="p-4 flex flex-wrap gap-2 items-center justify-center">
      {p.nodes.map((n, i) => {
        const ptrs = Object.entries(p.pointers ?? {})
          .filter(([, idx]) => idx === i)
          .map(([name]) => name);
        return (
          <div key={n.id} className="flex flex-col items-center gap-1">
            <div className="flex items-center">
              <div className={`min-w-[52px] h-11 px-2 flex items-center justify-center rounded-md border mono ${colorClass(n.color)}`}>
                {n.val}
              </div>
              {i < p.nodes.length - 1 ? (
                <span className="mx-1 text-muted-foreground text-lg">{arrow}</span>
              ) : p.kind === "circular" ? (
                <span className="mx-1 text-primary text-lg">↩</span>
              ) : (
                <span className="mx-1 text-muted-foreground text-lg">∅</span>
              )}
            </div>
            {ptrs.length ? (
              <span className="text-[10px] text-primary mono">↑{ptrs.join(",")}</span>
            ) : null}
          </div>
        );
      })}
      {!p.nodes.length ? <span className="text-muted-foreground text-sm">(empty list)</span> : null}
    </div>
  );
}

export function TreeRender({ p }: { p: TreePayload }) {
  return (
    <div className="p-2 overflow-auto flex justify-center">
      <svg width={p.width} height={p.height} className="max-w-full">
        {p.edges.map((e, i) => {
          const a = p.nodes.find((n) => n.id === e.from);
          const b = p.nodes.find((n) => n.id === e.to);
          if (!a || !b) return null;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={svgColor(e.color) === "var(--color-dsa-node)" ? "var(--color-dsa-edge)" : svgColor(e.color)}
              strokeWidth={e.color ? 3 : 2}
            />
          );
        })}
        {p.nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={18} fill={svgColor(n.color)} stroke="var(--color-border)" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={12} fill={svgFg(n.color)} className="mono">
              {n.val}
            </text>
            {n.extra ? (
              <text x={n.x} y={n.y + 34} textAnchor="middle" fontSize={10} fill="var(--color-muted-foreground)">
                {n.extra}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function GraphRender({ p }: { p: GraphPayload }) {
  return (
    <div className="p-2 overflow-auto flex justify-center">
      <svg width={p.width} height={p.height} className="max-w-full">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-dsa-edge)" />
          </marker>
        </defs>
        {p.edges.map((e, i) => {
          const a = p.nodes.find((n) => n.id === e.from)!;
          const b = p.nodes.find((n) => n.id === e.to)!;
          if (!a || !b) return null;
          const stroke = e.color ? svgColor(e.color) : "var(--color-dsa-edge)";
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          return (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={stroke}
                strokeWidth={e.color ? 3 : 1.5}
                markerEnd={e.directed ? "url(#arrow)" : undefined}
              />
              {e.weight !== undefined ? (
                <text x={midX} y={midY - 4} fontSize={11} textAnchor="middle" fill="var(--color-foreground)" className="mono">
                  {e.weight}
                </text>
              ) : null}
            </g>
          );
        })}
        {p.nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={20} fill={svgColor(n.color)} stroke="var(--color-border)" strokeWidth={1.5} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={12} fill={svgFg(n.color)} className="mono">
              {n.label ?? n.id}
            </text>
            {p.distances && p.distances[n.id] !== undefined ? (
              <text x={n.x} y={n.y + 36} textAnchor="middle" fontSize={11} fill="var(--color-primary)" className="mono">
                d={p.distances[n.id]}
              </text>
            ) : null}
            {n.extra ? (
              <text x={n.x} y={n.y - 26} textAnchor="middle" fontSize={10} fill="var(--color-muted-foreground)">
                {n.extra}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function GridRender({ p }: { p: GridPayload }) {
  return (
    <div className="p-4 flex flex-col items-center gap-2">
      {p.caption ? <div className="text-xs text-muted-foreground">{p.caption}</div> : null}
      <div className="inline-block">
        {p.colLabels ? (
          <div className="flex gap-0.5 ml-8">
            {p.colLabels.map((l, i) => (
              <div key={i} className="w-8 text-center text-[10px] text-muted-foreground mono">
                {l}
              </div>
            ))}
          </div>
        ) : null}
        {p.cells.map((row, r) => (
          <div key={r} className="flex gap-0.5 items-center">
            {p.rowLabels ? (
              <div className="w-8 text-right text-[10px] text-muted-foreground mono pr-1">
                {p.rowLabels[r]}
              </div>
            ) : null}
            {row.map((v, c) => (
              <div
                key={c}
                className={`w-8 h-8 flex items-center justify-center border rounded-sm text-xs mono ${colorClass(p.colors[r]?.[c])}`}
              >
                {v}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TextRender({ p }: { p: TextPayload }) {
  const renderChars = (s: string, hs?: { start: number; end: number; color: StepColor }[]) => (
    <div className="flex flex-wrap gap-0.5">
      {Array.from(s).map((ch, i) => {
        const h = hs?.find((r) => i >= r.start && i < r.end);
        return (
          <div key={i} className={`w-7 h-8 flex items-center justify-center border rounded-sm text-sm mono ${colorClass(h?.color)}`}>
            {ch}
          </div>
        );
      })}
    </div>
  );
  return (
    <div className="p-4 flex flex-col items-center gap-3">
      <div>
        <div className="text-[10px] text-muted-foreground mb-1">text</div>
        {renderChars(p.text, p.highlights)}
      </div>
      {p.pattern !== undefined ? (
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">pattern</div>
          {renderChars(p.pattern, p.patternHighlights)}
        </div>
      ) : null}
      {p.extra ? <div className="text-xs text-muted-foreground mono">{p.extra}</div> : null}
    </div>
  );
}

export function HashRender({ p }: { p: HashPayload }) {
  return (
    <div className="p-4 flex flex-col gap-1 max-w-2xl mx-auto">
      {p.buckets.map((bucket, i) => {
        const isHi = p.highlightBucket === i;
        return (
          <div key={i} className={`flex items-center gap-2 rounded-md border px-2 py-1 ${isHi ? "border-dsa-active bg-dsa-active/10" : "border-border"}`}>
            <div className="w-10 text-right mono text-xs text-muted-foreground">[{i}]</div>
            <div className="flex flex-wrap gap-1">
              {bucket.length === 0 ? (
                <span className="text-xs text-muted-foreground">∅</span>
              ) : (
                bucket.map((entry, j) => (
                  <div key={j} className={`px-2 py-1 rounded border text-xs mono ${colorClass(entry.color)}`}>
                    {entry.key}
                    <span className="text-muted-foreground">:</span>
                    {entry.val}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
      {p.extra ? <div className="text-xs text-muted-foreground mono mt-2">{p.extra}</div> : null}
    </div>
  );
}

export function BitsRender({ p }: { p: BitsPayload }) {
  const row = (label: string, bits: string) => (
    <div className="flex items-center gap-3">
      <div className="w-16 text-xs mono text-muted-foreground">{label}</div>
      <div className="flex gap-0.5">
        {Array.from(bits).map((b, i) => (
          <div
            key={i}
            className={`w-7 h-8 flex items-center justify-center border rounded-sm text-sm mono ${
              p.highlights?.includes(i) ? colorClass("active") : colorClass()
            }`}
          >
            {b}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="p-4 flex flex-col gap-2 items-center">
      {row("A", p.a)}
      {p.b ? row("B", p.b) : null}
      {p.op ? <div className="text-xs mono text-primary">op: {p.op}</div> : null}
      {p.result ? row("=", p.result) : null}
    </div>
  );
}

export function ConceptRender({ p }: { p: ConceptPayload }) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">{p.body}</p>
      {p.bullets?.length ? (
        <ul className="list-disc pl-6 text-sm space-y-1">
          {p.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}
      {p.example ? (
        <pre className="mt-3 rounded-md p-3 text-xs mono bg-dsa-code-bg border border-border overflow-x-auto">
          {p.example}
        </pre>
      ) : null}
    </div>
  );
}

export function StepRender({ kind, payload }: { kind: string; payload: unknown }) {
  switch (kind) {
    case "bars":
      return <BarsRender p={payload as BarsPayload} />;
    case "cells":
      return <CellsRender p={payload as CellsPayload} />;
    case "list":
      return <ListRender p={payload as ListPayload} />;
    case "tree":
      return <TreeRender p={payload as TreePayload} />;
    case "graph":
      return <GraphRender p={payload as GraphPayload} />;
    case "grid":
      return <GridRender p={payload as GridPayload} />;
    case "text":
      return <TextRender p={payload as TextPayload} />;
    case "hash":
      return <HashRender p={payload as HashPayload} />;
    case "bits":
      return <BitsRender p={payload as BitsPayload} />;
    case "concept":
      return <ConceptRender p={payload as ConceptPayload} />;
    default:
      return <div className="p-4 text-muted-foreground">Unknown renderer: {kind}</div>;
  }
}
