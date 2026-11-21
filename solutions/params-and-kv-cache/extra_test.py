from solution import kv_cache_bytes, param_count


def test_kv_cache_sample():
    assert kv_cache_bytes(32, 8, 128, 4096, 1, 2) == 536870912  # 0.5 GiB
    assert kv_cache_bytes(32, 32, 128, 4096, 1, 2) == 2 * 2**30  # 普通多头：2 GiB
    assert kv_cache_bytes(32, 8, 128, 1, 1, 2) == 128 * 1024     # 每 token 128 KiB
    assert kv_cache_bytes(1, 8, 128, 1, 1, 2) == 4096            # 每 token 每层 4 KiB
    assert kv_cache_bytes(32, 8, 128, 8192, 8, 2) == 8 * 2**30   # 延伸：8 GiB
    assert kv_cache_bytes(1, 1, 1, 1, 1, 1) == 2


def test_kv_cache_errors():
    for args in [(0, 8, 128, 4096, 1, 2), (32, 8, 128, 4096, 0, 2), (32, 8, 128, -1, 1, 2)]:
        try:
            kv_cache_bytes(*args)
        except ValueError:
            continue
        raise AssertionError(f"expected ValueError for {args}")


def test_followup_numbers():
    weights = 2 * param_count(32, 4096, 32, 8, 14336, 128256, False)
    assert weights == 16060522496
    per_token = kv_cache_bytes(32, 8, 128, 1, 1, 2)
    free = 24 * 2**30 - weights
    assert free == 9709281280
    assert free // per_token == 74075
    assert free // (8 * per_token) == 9259                          # batch = 8
    assert free // kv_cache_bytes(32, 32, 128, 1, 1, 2) == 18518   # 普通多头
