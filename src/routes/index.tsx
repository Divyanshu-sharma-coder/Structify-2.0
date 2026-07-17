import { Link, createFileRoute } from "@tanstack/react-router";
import { GROUPED } from "@/lib/dsa/registry";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-2">
        <span className="text-primary">DSA</span> Visualizer
      </h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Step-by-step interactive visualizations for every core data structure and algorithm.
        Pick a topic to see it animate, tweak the input, and step through the logic.
      </p>

      {(["ds", "algo"] as const).map((cat) => (
        <section key={cat} className="mb-10">
          <h2 className="text-xl font-semibold mb-4">{cat === "ds" ? "Data Structures" : "Algorithms"}</h2>
          {Object.entries(GROUPED[cat]).map(([group, items]) => (
            <div key={group} className="mb-6">
              <h3 className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-2">{group}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {items.map((t) => (
                  <Link
                    key={t.slug}
                    to={cat === "ds" ? "/ds/$topic" : "/algo/$topic"}
                    params={{ topic: t.slug }}
                    className="group rounded-lg border border-border bg-card hover:border-primary hover:bg-accent transition-colors p-3 flex items-center gap-2"
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground mono truncate">{t.complexity.time}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
