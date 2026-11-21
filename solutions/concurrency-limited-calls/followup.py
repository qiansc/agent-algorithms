import asyncio
from collections.abc import Awaitable, Callable
from typing import TypeVar

T = TypeVar("T")


async def gather_limited(
    jobs: list[Callable[[], Awaitable[T]]], limit: int
) -> list[T]:
    """按提交顺序启动，同时最多运行 limit 个；结果按提交顺序返回。"""
    if limit < 1:
        raise ValueError("limit must be >= 1")
    sem = asyncio.Semaphore(limit)

    async def run(job: Callable[[], Awaitable[T]]) -> T:
        async with sem:  # 正常结束、抛异常都会归还名额
            return await job()

    return await asyncio.gather(*(run(job) for job in jobs))


async def simulate(
    durations: list[int], limit: int, unit: float = 0.01
) -> list[int]:
    """每个时间单位睡 unit 秒，返回调用的完成顺序。"""
    done: list[int] = []

    def make(i: int, d: int) -> Callable[[], Awaitable[None]]:
        async def job() -> None:
            await asyncio.sleep(d * unit)
            done.append(i)

        return job

    jobs = [make(i, d) for i, d in enumerate(durations)]
    await gather_limited(jobs, limit)
    return done
