import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Search,
  SkipBack,
  SkipForward,
  StepForward,
  StepBack,
  Copy,
} from "lucide-react";

const searchSchema = z.object({
  p: fallback(z.string(), "right-triangle").default("right-triangle"),
  n: fallback(z.number().int(), 6).default(6),
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/patterns")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "C++ Pattern Programs — Animated Builder" },
      {
        name: "description",
        content:
          "10+ classic C++ pattern programs (triangle, pyramid, diamond, heart, Floyd's triangle, Pascal's triangle) with step-by-step build animation, downloadable code and shareable URLs.",
      },
    ],
  }),
  component: PatternsPage,
});

type Cell = { ch: string; on: boolean };
type Pattern = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  tags: string[];
  code: string;
  build: (n: number) => Cell[][];
};

const pad = (rows: string[]) => {
  const w = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => r.padEnd(w, " ").split("").map((ch) => ({ ch, on: false })));
};

const PATTERNS: Pattern[] = [
  {
    id: "right-triangle",
    name: "Right-Angled Triangle",
    emoji: "📐",
    desc: "Stars increasing each row.",
    tags: ["triangle", "star", "basic"],
    code: `#include <iostream>
using namespace std;
int main() {
  int n; cin >> n;
  for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= i; j++) cout << "* ";
    cout << "\\n";
  }
}`,
    build: (n) => pad(Array.from({ length: n }, (_, i) => "* ".repeat(i + 1).trimEnd())),
  },
  {
    id: "inverted-triangle",
    name: "Inverted Triangle",
    emoji: "🔻",
    desc: "Stars decreasing each row.",
    tags: ["triangle", "star", "inverted"],
    code: `#include <iostream>
using namespace std;
int main() {
  int n; cin >> n;
  for (int i = n; i >= 1; i--) {
    for (int j = 1; j <= i; j++) cout << "* ";
    cout << "\\n";
  }
}`,
    build: (n) => pad(Array.from({ length: n }, (_, i) => "* ".repeat(n - i).trimEnd())),
  },
  {
    id: "pyramid",
    name: "Pyramid",
    emoji: "🔺",
    desc: "Centered pyramid of stars.",
    tags: ["pyramid", "star", "centered"],
    code: `#include <iostream>
using namespace std;
int main() {
  int n; cin >> n;
  for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= n - i; j++) cout << " ";
    for (int j = 1; j <= 2*i - 1; j++) cout << "*";
    cout << "\\n";
  }
}`,
    build: (n) =>
      pad(Array.from({ length: n }, (_, i) => " ".repeat(n - i - 1) + "*".repeat(2 * i + 1))),
  },
  {
    id: "diamond",
    name: "Diamond",
    emoji: "💎",
    desc: "Pyramid + inverted pyramid.",
    tags: ["diamond", "star", "pyramid"],
    code: `#include <iostream>
using namespace std;
int main() {
  int n; cin >> n;
  for (int i = 1; i <= n; i++) {
    for (int j = 0; j < n - i; j++) cout << " ";
    for (int j = 0; j < 2*i - 1; j++) cout << "*";
    cout << "\\n";
  }
  for (int i = n - 1; i >= 1; i--) {
    for (int j = 0; j < n - i; j++) cout << " ";
    for (int j = 0; j < 2*i - 1; j++) cout << "*";
    cout << "\\n";
  }
}`,
    build: (n) => {
      const top = Array.from({ length: n }, (_, i) => " ".repeat(n - i - 1) + "*".repeat(2 * i + 1));
      const bot = Array.from({ length: n - 1 }, (_, i) => " ".repeat(i + 1) + "*".repeat(2 * (n - i - 1) - 1));
      return pad([...top, ...bot]);
    },
  },
  {
    id: "hollow-square",
    name: "Hollow Square",
    emoji: "⬛",
    desc: "Border of stars.",
    tags: ["square", "hollow", "border"],
    code: `#include <iostream>
using namespace std;
int main() {
  int n; cin >> n;
  for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
      if (i==0||i==n-1||j==0||j==n-1) cout << "* ";
      else cout << "  ";
    }
    cout << "\\n";
  }
}`,
    build: (n) => {
      const rows: string[] = [];
      for (let i = 0; i < n; i++) {
        let r = "";
        for (let j = 0; j < n; j++) {
          r += i === 0 || i === n - 1 || j === 0 || j === n - 1 ? "* " : "  ";
        }
        rows.push(r.trimEnd());
      }
      return pad(rows);
    },
  },
  {
    id: "floyd",
    name: "Floyd's Triangle",
    emoji: "🔢",
    desc: "Consecutive integers in triangle form.",
    tags: ["floyd", "number", "triangle"],
    code: `#include <iostream>
using namespace std;
int main() {
  int n; cin >> n;
  int k = 1;
  for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= i; j++) cout << k++ << " ";
    cout << "\\n";
  }
}`,
    build: (n) => {
      let k = 1;
      const rows: string[] = [];
      for (let i = 1; i <= n; i++) {
        const parts: string[] = [];
        for (let j = 1; j <= i; j++) parts.push(String(k++).padStart(2, " "));
        rows.push(parts.join(" "));
      }
      return pad(rows);
    },
  },
  {
    id: "pascal",
    name: "Pascal's Triangle",
    emoji: "🧮",
    desc: "Each number is the sum of the two above it.",
    tags: ["pascal", "number", "triangle", "binomial"],
    code: `#include <iostream>
using namespace std;
int main() {
  int n; cin >> n;
  for (int i = 0; i < n; i++) {
    int val = 1;
    for (int s = 0; s < n - i - 1; s++) cout << "  ";
    for (int j = 0; j <= i; j++) {
      cout << val << "   ";
      val = val * (i - j) / (j + 1);
    }
    cout << "\\n";
  }
}`,
    build: (n) => {
      const rows: string[] = [];
      for (let i = 0; i < n; i++) {
        let val = 1;
        let r = "  ".repeat(n - i - 1);
        for (let j = 0; j <= i; j++) {
          r += String(val).padEnd(4, " ");
          val = (val * (i - j)) / (j + 1);
        }
        rows.push(r.trimEnd());
      }
      return pad(rows);
    },
  },
  {
    id: "number-triangle",
    name: "Number Triangle",
    emoji: "1️⃣",
    desc: "Row i printed i times.",
    tags: ["number", "triangle"],
    code: `#include <iostream>
using namespace std;
int main() {
  int n; cin >> n;
  for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= i; j++) cout << i << " ";
    cout << "\\n";
  }
}`,
    build: (n) =>
      pad(
        Array.from({ length: n }, (_, i) =>
          Array.from({ length: i + 1 }, () => String(i + 1)).join(" "),
        ),
      ),
  },
  {
    id: "alphabet",
    name: "Alphabet Pyramid",
    emoji: "🔤",
    desc: "Letters forming a pyramid.",
    tags: ["alphabet", "letter", "pyramid"],
    code: `#include <iostream>
using namespace std;
int main() {
  int n; cin >> n;
  for (int i = 0; i < n; i++) {
    for (int s = 0; s < n - i - 1; s++) cout << " ";
    for (int j = 0; j <= i; j++) cout << char('A' + j) << " ";
    cout << "\\n";
  }
}`,
    build: (n) => {
      const rows: string[] = [];
      for (let i = 0; i < n; i++) {
        let r = " ".repeat(n - i - 1);
        for (let j = 0; j <= i; j++) r += String.fromCharCode(65 + j) + " ";
        rows.push(r.trimEnd());
      }
      return pad(rows);
    },
  },
  {
    id: "hourglass",
    name: "Hourglass",
    emoji: "⏳",
    desc: "Inverted pyramid stacked on a pyramid.",
    tags: ["hourglass", "star", "pyramid"],
    code: `#include <iostream>
using namespace std;
int main() {
  int n; cin >> n;
  for (int i = n; i >= 1; i--) {
    for (int j = 0; j < n - i; j++) cout << " ";
    for (int j = 0; j < 2*i - 1; j++) cout << "*";
    cout << "\\n";
  }
  for (int i = 2; i <= n; i++) {
    for (int j = 0; j < n - i; j++) cout << " ";
    for (int j = 0; j < 2*i - 1; j++) cout << "*";
    cout << "\\n";
  }
}`,
    build: (n) => {
      const top = Array.from({ length: n }, (_, k) => {
        const i = n - k;
        return " ".repeat(n - i) + "*".repeat(2 * i - 1);
      });
      const bot = Array.from({ length: n - 1 }, (_, k) => {
        const i = k + 2;
        return " ".repeat(n - i) + "*".repeat(2 * i - 1);
      });
      return pad([...top, ...bot]);
    },
  },
  {
    id: "heart",
    name: "Heart ❤️",
    emoji: "❤️",
    desc: "Classic ASCII heart via implicit curve.",
    tags: ["heart", "love", "curve"],
    code: `#include <iostream>
#include <cmath>
using namespace std;
int main() {
  for (float y = 1.5f; y > -1.5f; y -= 0.1f) {
    for (float x = -1.5f; x < 1.5f; x += 0.05f) {
      float a = x*x + y*y - 1;
      cout << ((a*a*a - x*x*y*y*y <= 0.0f) ? '*' : ' ');
    }
    cout << "\\n";
  }
}`,
    build: (n) => {
      const H = Math.max(10, n * 2);
      const W = Math.max(20, n * 4);
      const rows: string[] = [];
      for (let r = 0; r < H; r++) {
        const y = 1.3 - (2.6 * r) / (H - 1);
        let line = "";
        for (let c = 0; c < W; c++) {
          const x = -1.5 + (3 * c) / (W - 1);
          const a = x * x + y * y - 1;
          line += a * a * a - x * x * y * y * y <= 0 ? "*" : " ";
        }
        rows.push(line);
      }
      return pad(rows);
    },
  },
  {
    id: "butterfly",
    name: "Butterfly",
    emoji: "🦋",
    desc: "Two triangles mirrored with a gap.",
    tags: ["butterfly", "star", "mirror"],
    code: `#include <iostream>
using namespace std;
int main() {
  int n; cin >> n;
  for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= i; j++) cout << "*";
    for (int j = 1; j <= 2*(n - i); j++) cout << " ";
    for (int j = 1; j <= i; j++) cout << "*";
    cout << "\\n";
  }
  for (int i = n; i >= 1; i--) {
    for (int j = 1; j <= i; j++) cout << "*";
    for (int j = 1; j <= 2*(n - i); j++) cout << " ";
    for (int j = 1; j <= i; j++) cout << "*";
    cout << "\\n";
  }
}`,
    build: (n) => {
      const mk = (i: number) => "*".repeat(i) + " ".repeat(2 * (n - i)) + "*".repeat(i);
      const rows = [
        ...Array.from({ length: n }, (_, k) => mk(k + 1)),
        ...Array.from({ length: n }, (_, k) => mk(n - k)),
      ];
      return pad(rows);
    },
  },
];

// Explain how a pattern is built as a series of high-level steps.
function buildGuide(p: Pattern, n: number): string[] {
  const steps: string[] = [];
  steps.push(`Read input n = ${n} (controls how many rows/size).`);
  switch (p.id) {
    case "right-triangle":
      steps.push("Outer loop i from 1..n — one row per iteration.");
      steps.push("Inner loop j from 1..i — print i stars.");
      steps.push("Newline after each row → staircase of stars.");
      break;
    case "inverted-triangle":
      steps.push("Outer loop i from n..1 — decreasing row size.");
      steps.push("Inner loop prints i stars, then a newline.");
      break;
    case "pyramid":
      steps.push("For each row i, print (n − i) leading spaces to center it.");
      steps.push("Then print (2·i − 1) stars — odd counts 1, 3, 5, …");
      steps.push("Newline → a symmetric pyramid.");
      break;
    case "diamond":
      steps.push("Top half: same as pyramid for i = 1..n.");
      steps.push("Bottom half: mirror the pyramid for i = n−1..1.");
      break;
    case "hollow-square":
      steps.push("Iterate every cell (i, j) of an n × n grid.");
      steps.push("Print a star only on the border (i=0, i=n−1, j=0 or j=n−1).");
      steps.push("Print spaces inside — creates a hollow frame.");
      break;
    case "floyd":
      steps.push("Keep a running counter k = 1.");
      steps.push("Row i prints i numbers, each is k then k++.");
      break;
    case "pascal":
      steps.push("Row i has i+1 entries; start val = 1.");
      steps.push("For each column j compute next val = val · (i − j) / (j + 1).");
      steps.push("Add leading spaces so rows stay centered.");
      break;
    case "number-triangle":
      steps.push("Row i prints the digit i, repeated i times.");
      break;
    case "alphabet":
      steps.push("Row i prints letters A, B, C… up to the i-th letter.");
      steps.push("Leading spaces center it into a pyramid.");
      break;
    case "hourglass":
      steps.push("Top half: inverted pyramid i = n..1.");
      steps.push("Bottom half: growing pyramid i = 2..n.");
      break;
    case "heart":
      steps.push("Sample points (x, y) over the plane.");
      steps.push("Plot '*' when the heart curve inequality holds: (x² + y² − 1)³ − x²y³ ≤ 0.");
      break;
    case "butterfly":
      steps.push("Upper wings: i stars, 2(n − i) spaces, i stars — for i = 1..n.");
      steps.push("Lower wings: same rule reversed for i = n..1.");
      break;
    default:
      steps.push("Build the pattern row by row.");
  }
  steps.push("Repeat until the final shape appears.");
  return steps;
}

function PatternsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const activeId = PATTERNS.some((p) => p.id === search.p) ? search.p : PATTERNS[0].id;
  const n = Math.max(3, Math.min(12, search.n || 6));
  const q = search.q || "";

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<number | null>(null);

  const pattern = useMemo(() => PATTERNS.find((p) => p.id === activeId)!, [activeId]);
  const grid = useMemo(() => pattern.build(n), [pattern, n]);
  const total = useMemo(() => grid.reduce((s, r) => s + r.length, 0), [grid]);
  const guide = useMemo(() => buildGuide(pattern, n), [pattern, n]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return PATTERNS;
    return PATTERNS.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.desc.toLowerCase().includes(term) ||
        p.tags.some((t) => t.includes(term)),
    );
  }, [q]);

  // Reset progress when pattern/size changes
  useEffect(() => {
    setProgress(0);
    setPlaying(false);
  }, [activeId, n]);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (!playing) return;
    if (progress >= total) {
      setPlaying(false);
      return;
    }
    const delay = Math.max(4, 40 / speed);
    timer.current = window.setTimeout(() => setProgress((p) => Math.min(total, p + 1)), delay);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, progress, total, speed]);

  const revealed = useMemo(() => {
    let left = progress;
    return grid.map((row) =>
      row.map((c) => {
        if (left <= 0) return { ...c, on: false };
        left--;
        return { ...c, on: true };
      }),
    );
  }, [grid, progress]);

  // Determine which guide step we're on based on progress through rows.
  const currentGuideStep = useMemo(() => {
    if (total === 0) return 0;
    const ratio = progress / total;
    // step 0 = read input; middle steps map to the loop; last step = final.
    if (progress === 0) return 0;
    if (progress >= total) return guide.length - 1;
    const mid = guide.length - 2;
    return 1 + Math.min(mid - 1, Math.floor(ratio * mid));
  }, [progress, total, guide.length]);

  const setPattern = (id: string) => {
    navigate({ to: ".", search: { ...search, p: id } });
  };
  const setN = (nv: number) => {
    navigate({ to: ".", search: { ...search, n: nv } });
  };
  const setQ = (qv: string) => {
    navigate({ to: ".", search: { ...search, q: qv } });
  };

  const downloadCode = () => {
    const blob = new Blob([pattern.code + "\n"], { type: "text/x-c++src" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pattern.id}.cpp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${pattern.id}.cpp`);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(pattern.code);
    toast.success("Code copied");
  };

  const shareUrl = async () => {
    const url = `${window.location.origin}/patterns?p=${encodeURIComponent(pattern.id)}&n=${n}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: pattern.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Shareable link copied");
      }
    } catch {
      // user cancelled share
    }
  };

  // step forward by one full row
  const rowStarts = useMemo(() => {
    const arr: number[] = [];
    let acc = 0;
    for (const r of grid) {
      arr.push(acc);
      acc += r.length;
    }
    arr.push(acc);
    return arr;
  }, [grid]);

  const stepRowForward = () => {
    setPlaying(false);
    const next = rowStarts.find((s) => s > progress) ?? total;
    setProgress(next);
  };
  const stepRowBack = () => {
    setPlaying(false);
    const prev = [...rowStarts].reverse().find((s) => s < progress) ?? 0;
    setProgress(prev);
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0">
      {/* Pattern list */}
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-border bg-card overflow-auto">
        <div className="p-3">
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">
            C++ Patterns
          </div>
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search patterns…"
              className="h-8 pl-7 text-xs"
            />
          </div>
        </div>
        <div className="flex md:flex-col gap-1 p-2 overflow-x-auto">
          {filtered.length === 0 && (
            <div className="text-xs text-muted-foreground px-3 py-2">No matches</div>
          )}
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setPattern(p.id)}
              className={`text-left px-3 py-2 rounded-md text-xs flex items-center gap-2 whitespace-nowrap md:whitespace-normal transition-colors ${
                activeId === p.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <span>{p.emoji}</span>
              <span className="font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="border-b border-border px-4 py-3 flex items-center gap-3 bg-card flex-wrap">
          <span className="text-2xl">{pattern.emoji}</span>
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight truncate">{pattern.name}</h1>
            <div className="text-[11px] text-muted-foreground truncate">{pattern.desc}</div>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-[11px]">C++</Badge>
            <Button size="sm" variant="outline" onClick={copyCode}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy
            </Button>
            <Button size="sm" variant="outline" onClick={downloadCode}>
              <Download className="h-3.5 w-3.5 mr-1" /> Download .cpp
            </Button>
            <Button size="sm" variant="outline" onClick={shareUrl}>
              <Share2 className="h-3.5 w-3.5 mr-1" /> Share
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-rows-[1fr_1fr_auto] lg:grid-rows-1 lg:grid-cols-[1fr_1fr_260px]">
          {/* Canvas */}
          <div className="border-b lg:border-b-0 lg:border-r border-border overflow-auto bg-background p-4">
            <pre className="font-mono text-[13px] leading-[1.15] whitespace-pre">
              {revealed.map((row, r) => (
                <div key={r}>
                  {row.map((c, i) => {
                    const idx = rowStarts[r] + i;
                    const justPlaced = idx === progress - 1;
                    return (
                      <span
                        key={i}
                        className={
                          c.on
                            ? justPlaced
                              ? "text-primary font-bold"
                              : "text-foreground"
                            : "text-transparent"
                        }
                      >
                        {c.ch === " " ? "\u00A0" : c.ch}
                      </span>
                    );
                  })}
                </div>
              ))}
            </pre>
          </div>

          {/* Code */}
          <div className="overflow-auto bg-dsa-code-bg border-b lg:border-b-0 lg:border-r border-border">
            <pre className="p-4 text-xs font-mono">
              {pattern.code.split("\n").map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-muted-foreground w-6 text-right select-none">{i + 1}</span>
                  <span>{line || " "}</span>
                </div>
              ))}
            </pre>
          </div>

          {/* Step-by-step guide */}
          <div className="overflow-auto bg-card p-4">
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-3">
              Step-by-step
            </div>
            <ol className="space-y-2">
              {guide.map((g, i) => {
                const active = i === currentGuideStep;
                const done = i < currentGuideStep;
                return (
                  <li
                    key={i}
                    className={`text-xs leading-snug flex gap-2 rounded-md p-2 transition-colors ${
                      active
                        ? "bg-primary/10 border border-primary/40 text-foreground"
                        : done
                          ? "text-muted-foreground"
                          : "text-muted-foreground/70"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : done
                            ? "bg-muted text-foreground"
                            : "bg-muted/50"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span>{g}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Controls */}
        <div className="border-t border-border bg-card p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => { setProgress(0); setPlaying(false); }} title="Restart">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={stepRowBack} title="Previous row">
              <StepBack className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (progress >= total) setProgress(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? (
                <><Pause className="h-4 w-4 mr-1" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-1" /> Play</>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={stepRowForward} title="Next row">
              <StepForward className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setProgress(total); setPlaying(false); }} title="Skip to end">
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setProgress(0); setPlaying(false); }}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
            <div className="text-[11px] mono text-muted-foreground ml-auto">
              {progress}/{total} chars • step {Math.min(currentGuideStep + 1, guide.length)}/{guide.length}
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: total ? `${(progress / total) * 100}%` : "0%" }}
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-[180px] flex-1">
              <span className="text-[10px] text-muted-foreground w-10">size n</span>
              <Slider min={3} max={12} step={1} value={[n]} onValueChange={(v) => setN(v[0])} />
              <span className="text-[10px] mono w-6">{n}</span>
            </div>
            <div className="flex items-center gap-2 min-w-[180px] flex-1">
              <span className="text-[10px] text-muted-foreground w-10">speed</span>
              <Slider min={0.25} max={6} step={0.25} value={[speed]} onValueChange={(v) => setSpeed(v[0])} />
              <span className="text-[10px] mono w-10">{speed.toFixed(2)}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
