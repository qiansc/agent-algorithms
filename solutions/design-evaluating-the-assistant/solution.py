# 每个任务跑 n 次，results[i] 是第 i 个任务每次是否成功。
# pass@k：k 次里至少成功一次的概率；pass^k：k 次全部成功的概率。
# 两者都是“从 n 次里不放回地抽 k 次”的无偏估计，再对任务取平均。


def _all_fail(n: int, c: int, k: int) -> float:
    """C(n-c, k) / C(n, k)：抽到的 k 次全是失败的概率。"""
    p = 1.0
    for i in range(k):
        p *= (n - c - i) / (n - i)
        if p == 0.0:
            break
    return p


def _all_pass(n: int, c: int, k: int) -> float:
    """C(c, k) / C(n, k)：抽到的 k 次全是成功的概率。"""
    p = 1.0
    for i in range(k):
        p *= (c - i) / (n - i)
        if p == 0.0:
            break
    return p


def pass_metrics(results: list[list[bool]],
                 k: int) -> dict[str, float]:
    if not results:
        raise ValueError("no tasks")
    if k < 1:
        raise ValueError("k must be >= 1")
    if any(len(r) < k for r in results):
        raise ValueError("every task needs at least k trials")
    at1 = at_k = hat_k = 0.0
    for r in results:
        n, c = len(r), sum(r)
        at1 += c / n
        at_k += 1.0 - _all_fail(n, c, k)
        hat_k += _all_pass(n, c, k)
    m = len(results)
    return {"pass@1": at1 / m, "pass@k": at_k / m,
            "pass^k": hat_k / m}
