import { useMemo, useState } from "react";
import type { OpCommand, OpDef, TopicDef } from "@/lib/dsa/types";
import { safeGenerate } from "@/lib/dsa/registry";
import { usePlayer } from "@/lib/dsa/usePlayer";
import { StepRender } from "@/lib/dsa/renderers";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, X, Undo2 } from "lucide-react";

export function Visualizer({ topic }: { topic: TopicDef }) {
  const hasOps = !!(topic.ops && topic.runOps);
  const [input, setInput] = useState(topic.defaultInput);
  const [applied, setApplied] = useState(topic.defaultInput);
  const [commands, setCommands] = useState<OpCommand[]>(topic.initialCommands ?? []);

  const steps = useMemo(() => {
    if (hasOps && topic.runOps) {
      try {
        const s = topic.runOps(commands);
        return s.length ? s : [{ note: "no operations yet", payload: { title: topic.name, body: "Click an operation button above to begin." } }];
      } catch (e) {
        return [{ note: "error: " + (e instanceof Error ? e.message : String(e)), payload: { title: topic.name, body: String(e) } }];
      }
    }
    return safeGenerate(topic, applied);
  }, [topic, applied, commands, hasOps]);

  const player = usePlayer(steps);
  const step = player.current;
  const lines = topic.code.split("\n");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex flex-wrap items-center gap-3 bg-card">
        <span className="text-2xl">{topic.emoji}</span>
        <div>
          <h1 className="text-lg font-bold leading-tight">{topic.name}</h1>
          <div className="text-[11px] text-muted-foreground">{topic.group}</div>
        </div>
        <div className="flex gap-2 ml-auto items-center flex-wrap">
          <Badge variant="secondary" className="mono text-[11px]">T: {topic.complexity.time}</Badge>
          <Badge variant="secondary" className="mono text-[11px]">S: {topic.complexity.space}</Badge>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0 overflow-auto bg-background">
        <StepRender kind={topic.renderer} payload={step.payload} />
      </div>

      {/* Controls */}
      <div className="border-t border-border bg-card p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" onClick={player.reset} title="Reset"><RotateCcw className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={player.stepBack} title="Step back"><SkipBack className="h-4 w-4" /></Button>
          <Button size="icon" onClick={player.toggle} title={player.playing ? "Pause" : "Play"}>
            {player.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={player.stepForward} title="Step forward"><SkipForward className="h-4 w-4" /></Button>
          <div className="flex items-center gap-2 min-w-[160px]">
            <span className="text-[10px] text-muted-foreground">speed</span>
            <Slider min={0.25} max={4} step={0.25} value={[player.speed]} onValueChange={(v) => player.setSpeed(v[0])} />
            <span className="text-[10px] mono w-8">{player.speed.toFixed(2)}x</span>
          </div>
          <div className="text-xs mono text-muted-foreground ml-2">
            step {player.index + 1}/{player.total}
          </div>
        </div>

        {!hasOps && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground min-w-[60px]">input</span>
            <input
              className="flex-1 rounded-md border border-input bg-input px-2 py-1 text-xs mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={topic.inputHint ?? topic.defaultInput}
            />
            <Button size="sm" onClick={() => { setApplied(input); player.reset(); }}>Apply</Button>
          </div>
        )}
        {!hasOps && topic.inputHint ? <div className="text-[10px] text-muted-foreground">hint: {topic.inputHint}</div> : null}

        {step.note ? (
          <div className="text-xs px-2 py-1 rounded-md bg-muted mono">{step.note}</div>
        ) : null}
      </div>

      {/* Operations panel */}
      {hasOps && topic.ops ? (
        <OpsPanel
          ops={topic.ops}
          commands={commands}
          onAdd={(cmd) => { setCommands((prev) => [...prev, cmd]); player.reset(); }}
          onUndo={() => { setCommands((prev) => prev.slice(0, -1)); player.reset(); }}
          onClear={() => { setCommands([]); player.reset(); }}
          onRemove={(i) => { setCommands((prev) => prev.filter((_, j) => j !== i)); player.reset(); }}
        />
      ) : null}

      {/* Info panel */}
      <div className="border-t border-border bg-card">
        <Tabs defaultValue="code">
          <TabsList className="rounded-none border-b border-border w-full justify-start">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="explain">Explanation</TabsTrigger>
            <TabsTrigger value="uses">Use Cases</TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="p-0 max-h-64 overflow-auto">
            <pre className="p-3 text-xs mono bg-dsa-code-bg">
              {lines.map((line, i) => {
                const lineNo = i + 1;
                const isActive = step.line === lineNo;
                return (
                  <div key={i} className={`flex gap-3 px-2 py-0.5 rounded-sm ${isActive ? "bg-dsa-active/20 border-l-2 border-dsa-active" : ""}`}>
                    <span className="text-muted-foreground w-6 text-right select-none">{lineNo}</span>
                    <span>{line || " "}</span>
                  </div>
                );
              })}
            </pre>
          </TabsContent>
          <TabsContent value="explain" className="p-4 text-sm max-h-64 overflow-auto">
            {topic.explanation}
          </TabsContent>
          <TabsContent value="uses" className="p-4 text-sm max-h-64 overflow-auto">
            {topic.useCases?.length ? (
              <ul className="list-disc pl-6 space-y-1">
                {topic.useCases.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            ) : (
              <div className="text-muted-foreground">—</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OpsPanel({
  ops,
  commands,
  onAdd,
  onUndo,
  onClear,
  onRemove,
}: {
  ops: OpDef[];
  commands: OpCommand[];
  onAdd: (c: OpCommand) => void;
  onUndo: () => void;
  onClear: () => void;
  onRemove: (i: number) => void;
}) {
  const [args, setArgs] = useState<Record<string, string[]>>({});
  const getArgs = (id: string, len: number) => {
    const cur = args[id] ?? [];
    return Array.from({ length: len }, (_, i) => cur[i] ?? "");
  };
  const setArg = (id: string, i: number, v: string) => {
    setArgs((prev) => {
      const cur = [...(prev[id] ?? [])];
      cur[i] = v;
      return { ...prev, [id]: cur };
    });
  };
  return (
    <div className="border-t border-border bg-card p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-primary uppercase tracking-wider">Operations</div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={onUndo} disabled={!commands.length}>
            <Undo2 className="h-3 w-3 mr-1" /> Undo
          </Button>
          <Button size="sm" variant="outline" onClick={onClear} disabled={!commands.length}>
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ops.map((op) => {
          const argCount = op.args?.length ?? 0;
          const values = getArgs(op.id, argCount);
          return (
            <div key={op.id} className="flex items-center gap-1 border border-border rounded-md p-1.5">
              <Button
                size="sm"
                variant="secondary"
                className="mono text-[11px] flex-1 justify-start"
                onClick={() => onAdd({ op: op.id, args: values })}
                title={op.description ?? op.label}
              >
                {op.label}
              </Button>
              {op.args?.map((a, i) => (
                <input
                  key={i}
                  type={a.kind === "number" ? "number" : "text"}
                  className="w-14 rounded-sm border border-input bg-input px-1.5 py-1 text-[11px] mono"
                  placeholder={a.placeholder ?? a.name}
                  value={values[i]}
                  onChange={(e) => setArg(op.id, i, e.target.value)}
                />
              ))}
            </div>
          );
        })}
      </div>

      {commands.length ? (
        <div className="flex flex-col gap-1">
          <div className="text-[10px] text-muted-foreground">History ({commands.length})</div>
          <div className="flex flex-wrap gap-1">
            {commands.map((c, i) => (
              <button
                key={i}
                onClick={() => onRemove(i)}
                className="text-[10px] mono px-2 py-0.5 rounded bg-muted hover:bg-destructive hover:text-destructive-foreground transition"
                title="Click to remove"
              >
                {c.op}({c.args.filter(Boolean).join(", ")}) ×
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-muted-foreground italic">Click any operation above to run it on the structure.</div>
      )}
    </div>
  );
}
