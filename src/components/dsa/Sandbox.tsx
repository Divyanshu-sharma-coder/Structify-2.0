import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function Sandbox() {
  const [code, setCode] = useState(`// Available: log(...), assert(cond, msg)
const arr = [5,2,8,1,9,3];
function quickSort(a) {
  if (a.length <= 1) return a;
  const p = a[0], l = [], r = [];
  for (let i = 1; i < a.length; i++) (a[i] < p ? l : r).push(a[i]);
  return [...quickSort(l), p, ...quickSort(r)];
}
log("sorted =", quickSort(arr));
`);
  const [output, setOutput] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const run = () => {
    setOutput([]);
    const html = `<!doctype html><html><body><script>
      (function(){
        const send = (t,m)=>parent.postMessage({t,m},'*');
        const log = (...a)=>send('log', a.map(x=>{try{return typeof x==='string'?x:JSON.stringify(x)}catch(e){return String(x)}}).join(' '));
        const assert = (c,m)=>send(c?'log':'err', (c?'✓ ':'✗ ')+(m||''));
        try {
          new Function('log','assert', ${JSON.stringify(code)})(log, assert);
          send('done','');
        } catch(e){ send('err', String(e && e.stack || e)); }
      })();
    <\/script></body></html>`;
    const handler = (e: MessageEvent) => {
      const d = e.data as { t: string; m: string };
      if (!d || typeof d !== "object" || !d.t) return;
      if (d.t === "log" || d.t === "err") setOutput((o) => [...o, (d.t === "err" ? "! " : "") + d.m]);
      if (d.t === "done") { window.removeEventListener("message", handler); if (iframeRef.current) iframeRef.current.remove(); }
    };
    window.addEventListener("message", handler);
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
    iframeRef.current = iframe;
    window.setTimeout(() => {
      window.removeEventListener("message", handler);
      if (iframeRef.current) iframeRef.current.remove();
      setOutput((o) => [...o, "! timeout (2s)"]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-4 py-3 flex items-center gap-2 bg-card">
        <h1 className="text-lg font-bold">💻 JS Sandbox</h1>
        <div className="text-xs text-muted-foreground">iframe-sandboxed, 2s timeout</div>
        <Button size="sm" onClick={run} className="ml-auto">Run</Button>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="mono text-xs p-4 bg-dsa-code-bg border-r border-border resize-none focus:outline-none"
        />
        <pre className="mono text-xs p-4 bg-background overflow-auto whitespace-pre-wrap">
          {output.length ? output.join("\n") : <span className="text-muted-foreground">// output appears here</span>}
        </pre>
      </div>
    </div>
  );
}
