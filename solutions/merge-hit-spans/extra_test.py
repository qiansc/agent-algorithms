import random

from followup import merge_hits_with_gap, total_tokens
from solution import merge_hits

SAMPLE = [(2, 1, 5), (1, 8, 10), (1, 2, 6), (1, 5, 8), (1, 13, 14)]


def test_tokens_saved():
    assert total_tokens(SAMPLE) == 14
    assert total_tokens(merge_hits(SAMPLE)) == 13


def test_followup_gap():
    assert merge_hits_with_gap(SAMPLE, 0) == merge_hits(SAMPLE)
    assert merge_hits_with_gap(SAMPLE, 2) == [(1, 2, 10), (1, 13, 14), (2, 1, 5)]
    got = merge_hits_with_gap(SAMPLE, 3)
    assert got == [(1, 2, 14), (2, 1, 5)]
    assert total_tokens(got) == 16  # 比无空隙合并多读 10、11、12 三个 token
    try:
        merge_hits_with_gap(SAMPLE, -1)
    except ValueError:
        pass
    else:
        raise AssertionError("expected ValueError")


def test_against_token_sets():
    rng = random.Random(8)
    for _ in range(300):
        hits = []
        for _ in range(rng.randint(0, 8)):
            s = rng.randint(0, 15)
            hits.append((rng.randint(1, 3), s, s + rng.randint(1, 4)))
        got = merge_hits(hits)
        covered = {(d, t) for d, s, e in hits for t in range(s, e)}
        assert {(d, t) for d, s, e in got for t in range(s, e)} == covered
        for (d1, _, e1), (d2, s2, _) in zip(got, got[1:]):
            assert d1 < d2 or e1 < s2  # 相邻两段之间必须真有空隙
