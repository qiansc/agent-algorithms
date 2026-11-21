// 计划执行器：按依赖关系并发执行一份工具调用计划。
// 用模拟时钟写，方便测试；接真实工具时把 ms 换成 await 工具调用。
export interface Step {
  id: string;
  tool: string;
  after: string[];
  ms: number; // 耗时
  ok: boolean;
}
type Status = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

// 不可逆的工具不许出现在自动执行的计划里
const IRREVERSIBLE = new Set(['place_order', 'pay']);

export function validatePlan(steps: Step[]): void {
  const ids = steps.map((s) => s.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('duplicate step id');
  }
  const known = new Set(ids);
  for (const s of steps) {
    if (IRREVERSIBLE.has(s.tool)) {
      throw new Error(`${s.id}: ${s.tool} needs confirmation`);
    }
    for (const dep of s.after) {
      if (!known.has(dep)) {
        throw new Error(`${s.id}: unknown dependency ${dep}`);
      }
    }
  }
  // 用 Kahn 算法查环：能排完说明没有环
  const indeg = new Map(steps.map((s) => [s.id, s.after.length]));
  const children = new Map<string, string[]>(ids.map((i) => [i, []]));
  for (const s of steps) {
    for (const dep of s.after) children.get(dep)!.push(s.id);
  }
  const queue = ids.filter((i) => indeg.get(i) === 0);
  let seen = 0;
  while (queue.length) {
    const cur = queue.pop()!;
    seen += 1;
    for (const nxt of children.get(cur)!) {
      indeg.set(nxt, indeg.get(nxt)! - 1);
      if (indeg.get(nxt) === 0) queue.push(nxt);
    }
  }
  if (seen !== ids.length) throw new Error('plan has a cycle');
}

export function executePlan(steps: Step[], maxParallel: number) {
  if (maxParallel < 1) throw new Error('maxParallel must be >= 1');
  validatePlan(steps);
  const byId = new Map(steps.map((s) => [s.id, s]));
  const status: Record<string, Status> = {};
  for (const s of steps) status[s.id] = 'pending';
  const start: Record<string, number> = {};
  const end: Record<string, number> = {};
  let running: [number, string][] = []; // [结束时间, id]
  let now = 0;

  while (true) {
    // 上游失败或被跳过的步骤直接跳过，不再调用
    let changed = true;
    while (changed) {
      changed = false;
      for (const s of steps) {
        const bad = s.after.some(
          (d) => status[d] === 'failed' || status[d] === 'skipped',
        );
        if (status[s.id] === 'pending' && bad) {
          status[s.id] = 'skipped';
          changed = true;
        }
      }
    }
    // 空出来的并发位按计划顺序分给已就绪的步骤
    for (const s of steps) {
      if (running.length >= maxParallel) break;
      const ready = s.after.every((d) => status[d] === 'done');
      if (status[s.id] === 'pending' && ready) {
        status[s.id] = 'running';
        start[s.id] = now;
        running.push([now + s.ms, s.id]);
      }
    }
    if (running.length === 0) break;
    // 时钟拨到最早结束的时刻，同一时刻结束的步骤一起收尾
    now = Math.min(...running.map(([t]) => t));
    for (const [t, sid] of running) {
      if (t === now) {
        end[sid] = t;
        status[sid] = byId.get(sid)!.ok ? 'done' : 'failed';
      }
    }
    running = running.filter((r) => r[0] !== now);
  }

  // Math.max() 对空数组返回 -Infinity，先判空
  const ends = Object.values(end);
  const total = ends.length ? Math.max(...ends) : 0;
  return { status, start, end, total };
}
