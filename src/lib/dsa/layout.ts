import type { TreeNode, TreeEdge } from "./types";

// Layout a rooted tree given adjacency (children) starting from root id 0.
// Uses in-order X positioning to produce clean visuals.
export function layoutBinaryTree(
  values: (number | string | null)[],
  width = 720,
  levelHeight = 70,
): { nodes: TreeNode[]; edges: TreeEdge[]; width: number; height: number } {
  // values is a level-order array; null = missing node.
  const nodes: TreeNode[] = [];
  const edges: TreeEdge[] = [];
  const positions: Record<number, { depth: number; order: number }> = {};

  // BFS to determine which nodes exist
  const existing: number[] = [];
  for (let i = 0; i < values.length; i++) if (values[i] !== null && values[i] !== undefined) existing.push(i);

  // Compute in-order sequence by depth
  let counter = 0;
  const inorder = (i: number, depth: number) => {
    if (i >= values.length || values[i] === null || values[i] === undefined) return;
    inorder(2 * i + 1, depth + 1);
    positions[i] = { depth, order: counter++ };
    inorder(2 * i + 2, depth + 1);
  };
  inorder(0, 0);

  const maxOrder = Math.max(1, counter - 1);
  const maxDepth = existing.reduce((m, i) => Math.max(m, Math.floor(Math.log2(i + 1))), 0);
  const height = (maxDepth + 1) * levelHeight + 40;

  for (const i of existing) {
    const p = positions[i];
    const x = 40 + (p.order / Math.max(1, maxOrder)) * (width - 80);
    const y = 30 + p.depth * levelHeight;
    nodes.push({ id: i, val: values[i]!, x, y });
    if (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (values[parent] !== null && values[parent] !== undefined) {
        edges.push({ from: parent, to: i });
      }
    }
  }
  return { nodes, edges, width, height };
}

export function circleLayout(ids: string[], width = 720, height = 420) {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 50;
  const map: Record<string, { x: number; y: number }> = {};
  ids.forEach((id, i) => {
    const t = (i / ids.length) * Math.PI * 2 - Math.PI / 2;
    map[id] = { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) };
  });
  return { map, width, height };
}
