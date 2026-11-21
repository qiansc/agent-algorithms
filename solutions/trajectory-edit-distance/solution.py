def trace_distance(a: list[str], b: list[str]) -> int:
    if len(b) > len(a):
        # 距离对称；让 b 是较短的一条，一行只要 len(b) + 1 格
        a, b = b, a
    # previous[j]：a 的上一个前缀变成 b[:j] 的最少步数；第 0 行是插入 j 次
    previous = list(range(len(b) + 1))
    for i, action in enumerate(a, 1):
        current = [i]  # 第 0 列：把 a[:i] 全部删掉
        for j, target in enumerate(b, 1):
            current.append(min(
                # 删掉 a 的这一步
                previous[j] + 1,
                # 插入 b 的这一步
                current[j - 1] + 1,
                # 相同就保留，不同就替换
                previous[j - 1] + (action != target),
            ))
        previous = current
    return previous[-1]
