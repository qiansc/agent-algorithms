import { uctPick } from './solution.ts';

// 每一轮用 UCT 选一个孩子，再把 rewards 里的下一个奖励回传给它。
// 回传就是 n 加 1、W 加上奖励。返回每一轮选中的下标。
export function uctRounds(
  children: number[][],
  rewards: number[],
  c = Math.SQRT2,
): number[] {
  // 复制一份，不改调用方的数组
  const stats = children.map(([n, w]) => [n, w]);
  const picks: number[] = [];
  for (const reward of rewards) {
    const i = uctPick(stats, c);
    stats[i][0] += 1;
    stats[i][1] += reward;
    picks.push(i);
  }
  return picks;
}
