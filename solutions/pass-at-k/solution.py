import math


def pass_at_k(n: int, c: int, k: int) -> float:
    if not all(isinstance(x, int) for x in (n, c, k)):
        raise ValueError("n、c、k 必须是整数")
    if not (0 <= c <= n and 1 <= k <= n):
        raise ValueError("要求 0 <= c <= n 且 1 <= k <= n")
    if c == 0:
        return 0.0
    if n - c < k:
        return 1.0  # 失败记录凑不满 k 条，抽到的里面一定有成功
    # 全失败的概率 = 每一抽都继续落在失败记录上的概率连乘，改成对数相加
    log_failure = 0.0
    for i in range(k):
        # 已经拿走 i 条失败记录：池里剩 n - i 条，成功的仍是 c 条
        log_failure += math.log1p(-c / (n - i))
    return -math.expm1(log_failure)  # 1 - exp(x)，结果很小时也保留精度
