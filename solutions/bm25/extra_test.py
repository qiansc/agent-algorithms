import math

from followup import bm25_idf_variant

DOCS = ["cat sat mat", "dog sat log", "cat cat ran far away"]


def close(a, b):
    return len(a) == len(b) and all(math.isclose(x, y, abs_tol=1e-9) for x, y in zip(a, b))


def test_followup_plus_one_matches_main():
    from solution import bm25

    assert close(bm25_idf_variant(DOCS, "cat sat", False), bm25(DOCS, "cat sat"))


def test_followup_classic_idf_reverses_order():
    got = bm25_idf_variant(DOCS, "cat sat", True)
    assert close(got, [-1.1037482227800874, -0.5518741113900437, -0.6372154688214936])


def test_followup_classic_idf_ranks_miss_first():
    docs = ["cat sat", "cat ran", "cat dog", "bird flew"]
    got = bm25_idf_variant(docs, "cat", True)
    assert got[3] == 0.0 and all(x < 0 for x in got[:3])
    assert close(bm25_idf_variant(docs, "cat", False)[:3], [0.3566749439387324] * 3)
