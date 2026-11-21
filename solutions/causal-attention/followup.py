import math


class KVCache:
    """逐个生成 token：缓存各位置的 K、V，新位置只算自己这一行。"""

    def __init__(self) -> None:
        self.keys: list[list[float]] = []
        self.values: list[list[float]] = []

    def step(
        self, q: list[float], k: list[float], v: list[float]
    ) -> list[float]:
        self.keys.append(k)  # 先存自己：新位置可以看见自己
        self.values.append(v)
        scale = math.sqrt(len(q))
        scores = [
            sum(a * b for a, b in zip(q, key)) / scale
            for key in self.keys
        ]
        peak = max(scores)
        weights = [math.exp(s - peak) for s in scores]
        total = sum(weights)
        row = [0.0] * len(v)
        for w, value in zip(weights, self.values):
            for c, x in enumerate(value):
                row[c] += w / total * x
        return row
