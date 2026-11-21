import type { Tree } from './solution.ts';

/**
 * 深度优先、先右后左；每个深度第一次碰到的节点就是答案。
 * 额外空间 O(树高)。
 */
export function rightViewDfs<T>(root: Tree<T>): T[] {
  const result: T[] = [];
  const stack: [NonNullable<Tree<T>>, number][] = [];
  if (root !== null) stack.push([root, 0]);
  while (stack.length > 0) {
    const [[value, left, right], depth] = stack.pop()!;
    // 这个深度第一次到达
    if (depth === result.length) result.push(value);
    // 栈后进先出：先压左、再压右，右边就先被处理
    if (left !== null) stack.push([left, depth + 1]);
    if (right !== null) stack.push([right, depth + 1]);
  }
  return result;
}
