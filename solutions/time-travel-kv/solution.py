from bisect import bisect_right


class TimeMap:
    def __init__(self) -> None:
        # 键 -> (写入时刻列表, 值列表)
        # 两个列表下标一一对应，时刻严格递增
        self.history: dict[str, tuple[list[int], list[str]]] = {}

    def set(self, key: str, t: int, value: str) -> None:
        times, values = self.history.setdefault(key, ([], []))
        if times and t <= times[-1]:
            raise ValueError("timestamps must strictly increase")
        times.append(t)
        values.append(value)

    def get(self, key: str, t: int) -> str | None:
        if key not in self.history:
            return None
        times, values = self.history[key]
        pos = bisect_right(times, t)  # 第一条写入时刻 > t 的位置
        # pos 为 0 表示 t 时这个键还没写过；不能用 values[-1]
        return values[pos - 1] if pos > 0 else None
