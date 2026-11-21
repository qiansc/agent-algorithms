export type ToolEvent = [number, string, 'start' | 'end'];

export function exclusiveTime(events: ToolEvent[]): Map<string, number> {
  const stack: string[] = []; // 没结束的调用，栈顶是此刻在干活的
  const elapsed = new Map<string, number>(); // 工具名 -> 独占耗时
  let previous = events.length > 0 ? events[0][0] : 0;
  for (const [t, tool, kind] of events) {
    if (t < previous) throw new Error('时间戳不能倒退');
    // 上一条到这一条之间是旧栈顶在干活；栈空就是空闲
    if (stack.length > 0) {
      const top = stack[stack.length - 1];
      elapsed.set(top, elapsed.get(top)! + t - previous);
    }
    if (kind === 'start') {
      stack.push(tool);
      if (!elapsed.has(tool)) elapsed.set(tool, 0);
    } else if (kind === 'end') {
      if (stack.length === 0 || stack[stack.length - 1] !== tool) {
        throw new Error(`${tool} 的 end 对不上最近的 start`);
      }
      stack.pop();
    } else {
      throw new Error(`未知事件类型 ${String(kind)}`);
    }
    previous = t;
  }
  if (stack.length > 0) {
    throw new Error(`${stack[stack.length - 1]} 没有结束`);
  }
  return elapsed;
}
