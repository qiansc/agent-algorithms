from collections import Counter


def top_tools(calls: list[str], k: int) -> list[str]:
    if k <= 0:
        return []
    counts = Counter(calls)  # 工具名 -> 调用次数
    # 排序键 (-次数, 名称)：次数多的在前，次数相同按名称升序
    ordered = sorted(counts, key=lambda name: (-counts[name], name))
    return ordered[:k]
