import json
import random
from pathlib import Path

from followup import LRUCacheShort
from solution import LRUCache

CASES = json.loads((Path(__file__).parent / "cases.json").read_text(encoding="utf-8"))


def run(cls, capacity, calls):
    cache = cls(capacity)
    return [getattr(cache, method)(*args) for method, args in calls]


def test_short_version_matches_cases():
    for case in CASES["cases"]:
        assert run(LRUCacheShort, *case["init"], case["calls"]) == case["expected"], case["name"]


def test_short_version_matches_linked_list():
    rng = random.Random(25)
    for _ in range(300):
        capacity = rng.randint(0, 4)
        calls = []
        for _ in range(40):
            key = rng.choice("ABCDEF")
            if rng.random() < 0.5:
                calls.append(("get", [key]))
            else:
                calls.append(("put", [key, rng.randint(0, 9)]))
        assert run(LRUCacheShort, capacity, calls) == run(LRUCache, capacity, calls)


def test_negative_capacity_raises():
    for cls in (LRUCache, LRUCacheShort):
        try:
            cls(-1)
        except ValueError:
            continue
        raise AssertionError(f"{cls.__name__}(-1) should raise")
