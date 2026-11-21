from math import sqrt


def _unit(vec: list[float]) -> list[float] | None:
    length = sqrt(sum(x * x for x in vec))
    if length == 0:
        return None
    return [x / length for x in vec]


class CosineIndex:
    def __init__(self, docs: list[list[float]]) -> None:
        # 入库时归一化一次；全零文档没有方向，不入库
        self.dim = len(docs[0]) if docs else 0
        self.units: list[tuple[int, list[float]]] = []
        for idx, vec in enumerate(docs):
            unit = _unit(vec)
            if unit is not None:
                self.units.append((idx, unit))

    def query(self, q: list[float], k: int) -> list[int]:
        if self.units and len(q) != self.dim:
            raise ValueError("查询向量维数不对")
        qu = _unit(q)
        if qu is None:
            raise ValueError("查询向量不能全为零")
        if k <= 0:
            return []
        # 两边都是单位向量，点积就是余弦，每篇只剩 d 次乘加
        scored = []
        for idx, u in self.units:
            scored.append((sum(a * b for a, b in zip(qu, u)), idx))
        scored.sort(key=lambda t: (-t[0], t[1]))
        return [idx for _, idx in scored[:k]]
