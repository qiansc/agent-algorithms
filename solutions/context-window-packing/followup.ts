// 一条消息：(角色, token 数)
export type Message = [role: string, tokens: number];

// 不要求以 user 开头，但工具调用和它的结果必须同进同出。
export function packContextBlocks(
  messages: Message[],
  budget: number,
): [Message[], number] {
  if (budget < 0) throw new RangeError('budget must be >= 0');
  const system = messages.slice(0, 1).filter((m) => m[0] === 'system');
  let used = system.reduce((sum, [, tokens]) => sum + tokens, 0);
  if (used > budget) {
    throw new RangeError('system prompt alone exceeds budget');
  }

  // tool 结果并进它前面那条消息所在的块，
  // 也就是发出调用的那条助手消息
  const blocks: Message[][] = [];
  for (const m of messages.slice(system.length)) {
    if (m[0] === 'tool' && blocks.length > 0) {
      blocks[blocks.length - 1].push(m);
    } else {
      blocks.push([m]);
    }
  }
  const cost = blocks.map((b) =>
    b.reduce((sum, [, tokens]) => sum + tokens, 0),
  );

  // 和原题一样从新往旧装，放不下就停；
  // 只是单位从“一条消息”换成了“一个块”
  let start = blocks.length;
  while (start > 0 && used + cost[start - 1] <= budget) {
    start -= 1;
    used += cost[start];
  }
  return [[...system, ...blocks.slice(start).flat()], budget - used];
}
