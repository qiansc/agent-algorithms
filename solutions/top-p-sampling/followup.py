from bisect import bisect_right

from solution import EPS


class NucleusSampler:
    """分布和 p 固定：只排序一次，之后每次抽样只做一次二分查找。"""

    def __init__(self, probs: list[float], p: float) -> None:
        if not probs or not 0 < p <= 1 or any(x < 0 for x in probs):
            raise ValueError("need non-negative probs and 0 < p <= 1")
        order = sorted(range(len(probs)), key=lambda i: (-probs[i], i))
        self.ids: list[int] = []
        self.ends: list[float] = []  # ends[j]：前 j + 1 项的累计概率
        mass = 0.0
        for i in order:
            if probs[i] == 0:
                break
            mass += probs[i]
            self.ids.append(i)
            self.ends.append(mass)
            if mass >= p - EPS:
                break

    def draw(self, u: float) -> int:
        if not 0 <= u < 1:
            raise ValueError("0 <= u < 1")
        point = u * self.ends[-1]
        # 第一个严格大于 point 的累计值，就是 point 落进的那一段
        j = bisect_right(self.ends, point)
        return self.ids[min(j, len(self.ids) - 1)]
