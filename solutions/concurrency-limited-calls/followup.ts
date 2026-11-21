// 信号量：手里有 limit 个名额，用完了就排队等别人归还。
export class Semaphore {
  private free: number;
  private waiters: (() => void)[] = [];

  constructor(limit: number) {
    if (limit < 1) throw new RangeError('limit must be >= 1');
    this.free = limit;
  }

  async acquire(): Promise<void> {
    if (this.free > 0) {
      this.free -= 1;
      return;
    }
    // 没有名额：排进队尾，等 release 把名额直接交过来
    await new Promise<void>((resolve) => this.waiters.push(resolve));
  }

  release(): void {
    const next = this.waiters.shift();
    if (next) next(); // 名额直接转交，free 不变
    else this.free += 1;
  }
}

// 按提交顺序启动，同时最多运行 limit 个；结果按提交顺序返回。
export async function gatherLimited<T>(
  jobs: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const sem = new Semaphore(limit);
  return Promise.all(
    jobs.map(async (job) => {
      await sem.acquire();
      try {
        return await job();
      } finally {
        sem.release(); // 正常结束、抛异常都会归还名额
      }
    }),
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 每个时间单位睡 unit 毫秒，返回调用的完成顺序。
export async function simulate(
  durations: number[],
  limit: number,
  unit = 10,
): Promise<number[]> {
  const done: number[] = [];
  await gatherLimited(
    durations.map((d, i) => async () => {
      await sleep(d * unit);
      done.push(i);
    }),
    limit,
  );
  return done;
}
