from bisect import bisect_left, bisect_right


class TimeMapAnyOrder:
    """写入时刻可以乱序；同一键同一时刻再次写入时覆盖旧值。"""

    def __init__(self) -> None:
        self.history: dict[str, tuple[list[int], list[str]]] = {}

    def set(self, key: str, t: int, value: str) -> None:
        times, values = self.history.setdefault(key, ([], []))
        pos = bisect_left(times, t)  # 插到这里，列表仍然有序
        if pos < len(times) and times[pos] == t:
            values[pos] = value
        else:
            times.insert(pos, t)  # 后面的元素整体后移，O(m)
            values.insert(pos, value)

    def get(self, key: str, t: int) -> str | None:
        if key not in self.history:
            return None
        times, values = self.history[key]
        pos = bisect_right(times, t)
        return values[pos - 1] if pos > 0 else None
