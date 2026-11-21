// 一条消息：(角色, token 数)
export type Message = [role: string, tokens: number];

export function packContext(
  messages: Message[],
  budget: number,
): [Message[], number] {
  if (budget < 0) throw new RangeError('budget must be >= 0');
  // 只有第一条、且角色是 system 时才算系统提示
  const system = messages.slice(0, 1).filter((m) => m[0] === 'system');
  const history = messages.slice(system.length);
  let used = system.reduce((sum, [, tokens]) => sum + tokens, 0);
  if (used > budget) {
    throw new RangeError('system prompt alone exceeds budget');
  }

  let start = history.length; // 保留 history[start..]
  while (start > 0 && used + history[start - 1][1] <= budget) {
    start -= 1;
    used += history[start][1];
  }
  // 第一条放不下就停，不跳过它去装更旧的消息。
  // 开头不是 user 的消息依次丢掉，并把它们的 token 还回预算
  while (start < history.length && history[start][0] !== 'user') {
    used -= history[start][1];
    start += 1;
  }
  return [[...system, ...history.slice(start)], budget - used];
}
