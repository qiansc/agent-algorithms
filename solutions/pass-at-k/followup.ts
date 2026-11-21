import { passAtK } from './solution.ts';

// tasks 里每项是一道题的 [n, c]。先逐题算 pass@k，再取平均。
export function meanPassAtK(
  tasks: [number, number][],
  k: number,
): number {
  if (tasks.length === 0) throw new Error('至少要有一道题');
  return (
    tasks.reduce((s, [n, c]) => s + passAtK(n, c, k), 0) / tasks.length
  );
}
