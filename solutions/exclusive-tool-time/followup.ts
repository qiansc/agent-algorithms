import type { ToolEvent } from './solution.ts';

export function exclusiveTimeUnits(
  events: ToolEvent[],
): Map<string, number> {
  // 时间按整格计：end t 表示第 t 格也跑完了
  const stack: string[] = [];
  const elapsed = new Map<string, number>();
  // 下一段还没结算的时间从哪一格开始
  let previous = events.length > 0 ? events[0][0] : 0;
  for (const [t, tool, kind] of events) {
    if (kind === 'start') {
      if (stack.length > 0) {
        const top = stack[stack.length - 1];
        elapsed.set(top, elapsed.get(top)! + t - previous);
      }
      stack.push(tool);
      if (!elapsed.has(tool)) elapsed.set(tool, 0);
      previous = t;
    } else if (kind === 'end') {
      if (stack.length === 0 || stack[stack.length - 1] !== tool) {
        throw new Error(`${tool} 的 end 对不上最近的 start`);
      }
      // 第 t 格也算这个工具的，所以结算到 t + 1
      const top = stack.pop()!;
      elapsed.set(top, elapsed.get(top)! + t + 1 - previous);
      previous = t + 1;
    } else {
      throw new Error(`未知事件类型 ${String(kind)}`);
    }
  }
  if (stack.length > 0) {
    throw new Error(`${stack[stack.length - 1]} 没有结束`);
  }
  return elapsed;
}
