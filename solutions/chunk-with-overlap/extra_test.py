import random

from followup import chunk_sentences
from solution import chunk_spans


def test_followup_example():
    assert chunk_sentences([3, 2, 4, 1, 3], 6, 2) == [(0, 2), (1, 3), (3, 5)]
    assert chunk_sentences([], 6, 2) == []
    assert chunk_sentences([9, 2], 6, 2) == [(0, 1), (1, 2)]  # 超长句单独成块
    assert chunk_sentences([2, 2, 2], 6, 0) == [(0, 3)]
    for bad in ([1, 0], [1, -2]):
        try:
            chunk_sentences(bad, 6, 2)
        except ValueError:
            continue
        raise AssertionError("expected ValueError")


def test_followup_properties():
    rng = random.Random(9)
    for _ in range(500):
        size = rng.randint(1, 12)
        overlap = rng.randint(0, size - 1)
        lengths = [rng.randint(1, 8) for _ in range(rng.randint(0, 15))]
        spans = chunk_sentences(lengths, size, overlap)
        if not lengths:
            assert spans == []
            continue
        assert spans[0][0] == 0 and spans[-1][1] == len(lengths)
        for a, b in spans:
            assert a < b
            assert sum(lengths[a:b]) <= size or b - a == 1
        for (a1, b1), (a2, b2) in zip(spans, spans[1:]):
            assert a1 < a2 <= b1 < b2  # 每块都往前走，并且接得上
            assert sum(lengths[a2:b1]) <= overlap


def test_spans_properties():
    rng = random.Random(4)
    for _ in range(500):
        size = rng.randint(1, 10)
        overlap = rng.randint(0, size - 1)
        n = rng.randint(0, 40)
        spans = chunk_spans(n, size, overlap)
        if n == 0:
            assert spans == []
            continue
        assert spans[0][0] == 0 and spans[-1][1] == n
        assert sum(1 for _, e in spans if e == n) == 1  # 只有最后一块到末尾
        for (a1, b1), (a2, b2) in zip(spans, spans[1:]):
            assert a2 - a1 == size - overlap and b1 - a2 == overlap
