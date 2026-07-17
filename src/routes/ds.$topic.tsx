import { createFileRoute, notFound } from "@tanstack/react-router";
import { TOPIC_BY_SLUG } from "@/lib/dsa/registry";
import { Visualizer } from "@/components/dsa/Visualizer";

export const Route = createFileRoute("/ds/$topic")({
  head: ({ params }) => {
    const t = TOPIC_BY_SLUG[params.topic];
    const title = t ? `${t.name} — DSA Visualizer` : "Topic — DSA Visualizer";
    return {
      meta: [
        { title },
        { name: "description", content: t?.explanation ?? "Data structure visualizer." },
        { property: "og:title", content: title },
        { property: "og:description", content: t?.explanation ?? "Interactive data structure visualization." },
      ],
    };
  },
  component: Page,
});

function Page() {
  const { topic } = Route.useParams();
  const def = TOPIC_BY_SLUG[topic];
  if (!def || def.category !== "ds") throw notFound();
  return <Visualizer topic={def} />;
}
