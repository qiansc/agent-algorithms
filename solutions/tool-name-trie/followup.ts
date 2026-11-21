import type { ToolNames } from './solution.ts';

// 一个 token 可能含多个字符：每个字符都要能依次走通
export function allowedTokens(
  names: ToolNames,
  prefix: string,
  vocab: string[],
): string[] {
  const start = names.walk(prefix);
  if (!start) return [];
  const ok: string[] = [];
  for (const token of new Set(vocab)) {
    let node = start;
    let alive = token.length > 0;
    for (const c of token) {
      const next = node.children.get(c);
      if (!next) {
        alive = false;
        break;
      }
      node = next;
    }
    if (alive) ok.push(token);
  }
  return ok.sort();
}
