import { createFileRoute } from "@tanstack/react-router";
import { Sandbox } from "@/components/dsa/Sandbox";

export const Route = createFileRoute("/sandbox")({
  head: () => ({
    meta: [
      { title: "JS Sandbox — DSA Visualizer" },
      { name: "description", content: "Run JavaScript in a sandboxed iframe with 2-second timeout." },
    ],
  }),
  component: () => <Sandbox />,
});
