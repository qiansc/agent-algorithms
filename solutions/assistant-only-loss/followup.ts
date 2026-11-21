import { assistantLoss } from './solution.ts';

type Sample = [number[][], number[]]; // [logits, labels]

// 一批对话按 token 平均：总损失和有效位置数分别累加，最后再除。
export function batchAssistantLoss(batch: Sample[]): number | null {
  let total = 0;
  let count = 0;
  for (const [logits, labels] of batch) {
    // 这一条的有效位置数；位置 0 不参与
    const n = labels.slice(1).filter((y) => y !== -100).length;
    if (n) {
      // 这一条的平均损失乘回个数，就是它的损失总和
      total += (assistantLoss(logits, labels) as number) * n;
      count += n;
    }
  }
  return count ? total / count : null;
}
