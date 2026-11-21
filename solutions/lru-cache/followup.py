from collections import OrderedDict


class LRUCacheShort:
    def __init__(self, capacity: int) -> None:
        if capacity < 0:
            raise ValueError("capacity must be >= 0")
        self.capacity = capacity
        self.data: OrderedDict[str, int] = OrderedDict()  # 最旧的在最前

    def get(self, key: str) -> int | None:
        if key not in self.data:
            return None
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key: str, value: int) -> None:
        self.data[key] = value
        self.data.move_to_end(key)  # 覆盖旧键时也要挪到最新
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)
