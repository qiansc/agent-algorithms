import random

from followup import TimeMapAnyOrder
from solution import TimeMap


def test_non_increasing_time_raises():
    for bad in (10, 7):
        m = TimeMap()
        m.set("座位", 10, "过道")
        try:
            m.set("座位", bad, "靠窗")
        except ValueError:
            continue
        raise AssertionError(f"t={bad} should raise")


def test_followup_out_of_order_writes():
    m = TimeMapAnyOrder()
    m.set("座位", 10, "过道")
    m.set("座位", 3, "靠窗")
    assert [m.get("座位", t) for t in (2, 3, 9, 10)] == [None, "靠窗", "靠窗", "过道"]
    m.set("座位", 3, "前排")  # 同一时刻再写一次：覆盖
    assert [m.get("座位", t) for t in (3, 9)] == ["前排", "前排"]


def test_followup_matches_linear_scan():
    rng = random.Random(26)
    m = TimeMapAnyOrder()
    log: dict[str, dict[int, str]] = {}
    for _ in range(500):
        key = rng.choice("ab")
        t = rng.randint(0, 60)
        if rng.random() < 0.5:
            value = f"{key}{t}-{rng.randint(0, 9)}"
            m.set(key, t, value)
            log.setdefault(key, {})[t] = value
        else:
            older = [s for s in log.get(key, {}) if s <= t]
            want = log[key][max(older)] if older else None
            assert m.get(key, t) == want
