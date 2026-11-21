// 图示组件共用的小工具。颜色全部来自 viz.css 里的主题变量，深浅色自动切换。
export type Tone = 'default' | 'accent' | 'strong' | 'soft' | 'muted' | 'warn' | 'done' | 'ghost';

export function textWidth(text: string | number, size = 14): number {
  let w = 0;
  for (const ch of String(text)) {
    w += /[⺀-￿]/.test(ch) ? size : size * 0.62;
  }
  return w;
}

export function toneClass(tone?: Tone | null): string {
  return `t-${tone ?? 'default'}`;
}

let counter = 0;
export function uid(prefix = 'v'): string {
  counter += 1;
  return `${prefix}${counter}`;
}

// 很小的行内格式：`代码` 和 **加粗**，用于图注和步骤说明。
export function inline(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export interface TreeInput {
  id?: string;
  label: string | number;
  sub?: string;
  tone?: Tone;
  edgeLabel?: string;
  edgeTone?: Tone;
  children?: TreeInput[];
}

export interface GraphNode {
  id: string;
  label: string | number;
  x: number;
  y: number;
  tone?: Tone;
  shape?: 'circle' | 'rect';
  w?: number;
  h?: number;
  r?: number;
  sub?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  tone?: Tone;
  dashed?: boolean;
  bend?: number;
  directed?: boolean;
}

// 简单的树布局：叶子从左到右等距排开，父节点放在孩子正中间。
export function treeLayout(
  root: TreeInput,
  opts: { levelGap?: number; siblingGap?: number; x0?: number; y0?: number } = {},
): { nodes: GraphNode[]; edges: GraphEdge[]; width: number; height: number } {
  const levelGap = opts.levelGap ?? 72;
  const siblingGap = opts.siblingGap ?? 72;
  const x0 = opts.x0 ?? 36;
  const y0 = opts.y0 ?? 30;
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let leaf = 0;
  let auto = 0;
  let maxDepth = 0;
  function walk(node: TreeInput, depth: number): GraphNode {
    const id = node.id ?? `n${auto++}`;
    maxDepth = Math.max(maxDepth, depth);
    const kids = (node.children ?? []).map((c) => ({ c, g: walk(c, depth + 1) }));
    const x = kids.length
      ? (kids[0].g.x + kids[kids.length - 1].g.x) / 2
      : x0 + siblingGap * leaf++;
    const g: GraphNode = { id, label: node.label, x, y: y0 + depth * levelGap, tone: node.tone, sub: node.sub };
    nodes.push(g);
    for (const { c, g: child } of kids) {
      edges.push({ from: id, to: child.id, label: c.edgeLabel, tone: c.edgeTone });
    }
    return g;
  }
  walk(root, 0);
  const width = x0 * 2 + siblingGap * Math.max(leaf - 1, 0);
  const height = y0 * 2 + levelGap * maxDepth;
  return { nodes, edges, width, height };
}
