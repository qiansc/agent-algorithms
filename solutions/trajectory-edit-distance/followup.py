Edit = tuple[str, str | None, str | None]


def trace_edits(a: list[str], b: list[str]) -> list[Edit]:
    """返回一份最短的修改清单，每项是 (操作, a 里的工具, b 里的工具)。

    操作是 keep / replace / delete / insert。最短方案不止一种时，
    从右下角往回走，依次优先：保留或替换、删除、插入。
    """
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + (a[i - 1] != b[j - 1]),
            )
    edits: list[Edit] = []
    i, j = m, n
    while i > 0 or j > 0:
        if (
            i > 0
            and j > 0
            and dp[i][j] == dp[i - 1][j - 1] + (a[i - 1] != b[j - 1])
        ):
            op = "keep" if a[i - 1] == b[j - 1] else "replace"
            edits.append((op, a[i - 1], b[j - 1]))
            i, j = i - 1, j - 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            edits.append(("delete", a[i - 1], None))
            i -= 1
        else:
            edits.append(("insert", None, b[j - 1]))
            j -= 1
    edits.reverse()  # 回溯得到的是倒序
    return edits
