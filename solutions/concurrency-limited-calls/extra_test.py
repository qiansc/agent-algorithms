import asyncio

from followup import gather_limited, simulate
from solution import run_limited


def test_simulate_matches_heap_order():
    # 完成时刻两两相差至少 2 个单位，真实计时下顺序也不会抖动
    durations = [9, 1, 2, 2, 2]
    _, order = run_limited(durations, 2)
    assert order == [1, 2, 3, 4, 0]
    assert asyncio.run(simulate(durations, 2, unit=0.1)) == order


def test_at_most_limit_running_and_fifo_start():
    active = 0
    peak = 0
    started: list[int] = []

    def make(i: int):
        async def job() -> int:
            nonlocal active, peak
            active += 1
            peak = max(peak, active)
            started.append(i)
            await asyncio.sleep(0.01)
            active -= 1
            return i * i

        return job

    result = asyncio.run(gather_limited([make(i) for i in range(7)], 3))
    assert result == [i * i for i in range(7)]  # 结果按提交顺序
    assert peak == 3
    assert started == list(range(7))


def test_failed_call_releases_its_slot():
    log: list[str] = []

    async def fail() -> str:
        raise RuntimeError("tool failed")

    async def ok() -> str:
        log.append("ok")
        return "ok"

    async def main() -> None:
        try:
            await gather_limited([fail, ok], 1)
        except RuntimeError:
            pass
        await asyncio.sleep(0.02)  # 等后面那个调用拿到名额

    asyncio.run(main())
    assert log == ["ok"]


def test_bad_limit():
    try:
        asyncio.run(gather_limited([], 0))
    except ValueError:
        return
    raise AssertionError("expected ValueError")
