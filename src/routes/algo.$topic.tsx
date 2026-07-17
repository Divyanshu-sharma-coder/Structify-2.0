import { createFileRoute, notFound } from "@tanstack/react-router";
import { TOPIC_BY_SLUG } from "@/lib/dsa/registry";
import { Visualizer } from "@/components/dsa/Visualizer";

export const Route = createFileRoute("/algo/$topic")({
  head: ({ params }) => {
    const t = TOPIC_BY_SLUG[params.topic];
    const title = t ? `${t.name} — DSA Visualizer` : "Algorithm — DSA Visualizer";
    return {
      meta: [
        { title },
        { name: "description", content: t?.explanation ?? "Algorithm visualizer." },
        { property: "og:title", content: title },
        { property: "og:description", content: t?.explanation ?? "Interactive algorithm visualization." },
      ],
    };
  },
  component: Page,
});

function Page() {
  const { topic } = Route.useParams();
  const def = TOPIC_BY_SLUG[topic];
  if (!def || def.category !== "algo") throw notFound();
  return <Visualizer topic={def} />;
}
