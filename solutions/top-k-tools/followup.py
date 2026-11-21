import heapq
from collections import Counter


class _Entry:
    """堆里的一项。a < b 表示 a 比 b 差：次数更少，或同次数而名称更大。"""

    def __init__(self, name: str, count: int) -> None:
        self.name = name
        self.count = count

    def __lt__(self, other: "_Entry") -> bool:
        if self.count != other.count:
            return self.count < other.count
        return self.name > other.name


def top_tools_heap(calls: list[str], k: int) -> list[str]:
    if k <= 0:
        return []
    # 计数必须先做完，不能边读边淘汰
    counts = Counter(calls)
    heap: list[_Entry] = []  # 小顶堆，堆顶是目前留下的 k 个里最差的那个
    for name, count in counts.items():
        entry = _Entry(name, count)
        if len(heap) < k:
            heapq.heappush(heap, entry)
        elif heap[0] < entry:  # 新来的比堆顶好，换掉堆顶
            heapq.heapreplace(heap, entry)
    result = []
    while heap:  # 从最差的开始弹出，最后倒过来
        result.append(heapq.heappop(heap).name)
    return result[::-1]
