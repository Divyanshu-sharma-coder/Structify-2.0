# DSA Visualizer — Full Rebuild in React

Rebuild the app as a native TanStack Start + React application. Every topic from your list (27 data structures + 26 algorithms) becomes its own visualizer route with step-by-step animation, custom input, play/pause/step controls, code panel, complexity card, and a shared JS sandbox tab.

The current `public/dsa.html` iframe is removed. All logic moves into typed React components using the existing shadcn + Tailwind v4 design system.

## What you get

**Shell**
- Left sidebar: collapsible groups matching your outline (Primitive, Linear, Hash, Tree, Graph DS / Core, Sorting, Searching, Two-Pointer, Traversals, Advanced Graph, Advanced Paradigms).
- Top bar: topic title, category tag, complexity chips (Time / Space), Reset button.
- Main canvas: SVG/HTML visualization on top, control bar in the middle (Play, Pause, Step ◀ ▶, speed slider, custom input field), code + explanation tabs at the bottom.
- Right panel: definition, use cases, pseudocode, step-log with current-line highlight.
- Bottom tab: **Sandbox** — Monaco editor, Run button, executes user JS in a sandboxed `<iframe srcdoc>` worker with 2s timeout, prints console output and (when the user calls `visualize(array)`) drives the current visualizer.

**Data Structures (all 27, each with its own animated visualizer)**
- Primitive & Built-in: Integers/Floats, Booleans, Chars/Strings, Pointers/References
- Linear: Static Array, Dynamic Array, Singly LL, Doubly LL, Circular LL, Stack, Queue, Deque
- Hash-based: Hash Map, Hash Set
- Tree-based: Binary Tree, BST, AVL, Red-Black, Splay, B-Tree / B+ Tree, Min/Max Heap, Trie, Segment Tree, Fenwick (BIT)
- Graph-based: Adjacency Matrix, Adjacency List, DSU / Union-Find

**Algorithms (all 26, each with animation over a sample dataset the user can edit)**
- Core: Bit Manipulation, Recursion, Divide & Conquer, Greedy, DP
- Sorting: Bubble, Selection, Insertion, Merge, Quick, Heap, Radix, Counting, Bucket
- Searching: Linear, Binary, Ternary
- Two-Pointer/Window: Two Pointers, Sliding Window, Fast & Slow (Floyd's), Prefix Sum
- Traversals: BFS, DFS, Tree traversals (Pre/In/Post)
- Advanced Graph: Dijkstra, Bellman-Ford, Floyd-Warshall, Kruskal, Prim, Topological (Kahn)
- Advanced Paradigms: Backtracking (N-Queens demo), KMP, Rabin-Karp, Convex Hull (Graham Scan)

## Technical section

**Routing**
- `src/routes/__root.tsx` — shared shell (SidebarProvider + AppSidebar + header + Outlet). Head metadata updated to real title/description/og/twitter.
- `src/routes/index.tsx` — landing overview grid of all topics.
- `src/routes/ds/$topic.tsx` — dynamic route rendering the DS visualizer for the slug.
- `src/routes/algo/$topic.tsx` — dynamic route for algorithms.
- `src/routes/sandbox.tsx` — full-page code sandbox.
- Sitemap + robots per template rule; entries generated from the topic registry.

**Engine**
- `src/lib/dsa/registry.ts` — single source of truth: `{ slug, name, category, group, complexity, defaultInput, visualizer, code, explanation }` for all 53 topics. Sidebar and both dynamic routes read from it.
- `src/lib/dsa/stepper.ts` — generic step engine. Each visualizer exposes `generateSteps(input) => Step[]`; a `useStepPlayer(steps)` hook drives current index with Play/Pause/Step/Speed.
- `src/lib/dsa/visualizers/*.tsx` — one file per topic, exporting `{ generateSteps, Render }`. `Render` receives the current `Step` and draws it (SVG for trees/graphs, flex boxes for arrays/lists, grid for matrices).
- Colors, radii, animation timings come from `src/styles.css` tokens; a new `dsa` token scope (accent-node, accent-active, accent-visited, accent-path) is added there — no ad-hoc hex.

**Sandbox**
- `src/components/dsa/Sandbox.tsx` uses `@monaco-editor/react` (added via `bun add`).
- Execution: dynamically created `<iframe sandbox="allow-scripts">` with `srcdoc` containing a bootstrap script that receives the user code via `postMessage`, runs it inside a `Function()` with a `visualize`, `log`, and `assert` API, and posts results back. Hard 2s timer terminates by removing the iframe.
- No `eval` in the parent frame, no network access from the iframe, no cookies.

**Design system additions (src/styles.css only)**
- New tokens: `--dsa-node`, `--dsa-node-active`, `--dsa-node-visited`, `--dsa-edge`, `--dsa-highlight`, `--dsa-code-bg` mapped in `@theme inline` so classes like `bg-dsa-node` work.
- Keeps default light + dark themes; visualizer defaults to dark scheme via a `.dsa-dark` scope on the layout to preserve the current look-and-feel of your uploaded HTML.

**Delivery order (single build, but grouped so I can verify as I go)**
1. Shell, sidebar, routing, registry skeleton, design tokens, sandbox.
2. Linear DS + basic sorts + searches (highest-value visuals).
3. Trees + heaps + trie + segment/Fenwick + traversals.
4. Graphs + all advanced graph algorithms + DSU.
5. Advanced paradigms (backtracking, KMP, Rabin-Karp, Convex Hull) + primitives + hash + bit manipulation + DP + recursion + D&C + greedy.
6. Sitemap/robots regeneration, `__root.tsx` metadata, final typecheck.

**Out of scope (call out explicitly)**
- Python execution in the sandbox (JS only).
- AST-based complexity engine — complexity is shown from the registry, not derived.
- Persistence / accounts / backend — no Lovable Cloud needed for this build.

## Ascii layout

```text
+--------------------------------------------------------------+
| DSA Visualizer                                     [Sandbox] |
+----------+---------------------------------------------------+
| Sidebar  | Title  [tag]           T:O(n) S:O(1)     [Reset]  |
| Linear   |---------------------------------------------------|
|  Array   |                                                   |
|  Stack*  |            SVG / grid visualization               |
|  Queue   |                                                   |
| Trees    |---------------------------------------------------|
|  BST     | ◀  ▶  ▷Play  speed=====o    input:[ 5,2,8,1,9 ]  |
|  AVL     |---------------------------------------------------|
| Graphs   | Code | Explanation | Steps                        |
|  BFS     | ```pseudocode with current line highlighted```    |
+----------+---------------------------------------------------+
```

Approve and I'll build it in the order above.
