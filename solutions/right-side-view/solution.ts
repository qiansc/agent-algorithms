// 一棵树写成 [值, 左子树, 右子树]，空树是 null。
export type Tree<T> = readonly [T, Tree<T>, Tree<T>] | null;

export function rightView<T>(root: Tree<T>): T[] {
  if (root === null) return [];
  // 用数组加头指针当队列：shift() 每次要整体前移，是 O(n)
  const queue: NonNullable<Tree<T>>[] = [root];
  let head = 0;
  const result: T[] = [];
  while (head < queue.length) {
    // 这一层有几个节点，只弹出这么多个
    const width = queue.length - head;
    let value!: T;
    for (let i = 0; i < width; i++) {
      const node = queue[head++];
      if (!Array.isArray(node) || node.length !== 3) {
        throw new Error('节点必须是 [值, 左, 右]');
      }
      const [v, left, right] = node;
      value = v;
      if (left !== null) queue.push(left);
      if (right !== null) queue.push(right);
    }
    result.push(value); // 这一层最后弹出的，就是最靠右的
  }
  return result;
}
