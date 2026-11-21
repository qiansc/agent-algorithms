from heapq import heappush, heapreplace


class KthScore:
    def __init__(self, k: int) -> None:
        if k < 1:
            raise ValueError("k must be >= 1")
        self.k = k
        self.top: list[float] = []  # 小顶堆，只放目前最高的 k 个分数

    def add(self, score: float) -> float | None:
        if len(self.top) < self.k:
            heappush(self.top, score)
        elif score > self.top[0]:
            # 新分数挤掉门槛：弹出堆顶、放入新值，一步完成
            heapreplace(self.top, score)
        if len(self.top) < self.k:
            return None
        return self.top[0]  # k 个里最小的，就是全体的第 k 大
