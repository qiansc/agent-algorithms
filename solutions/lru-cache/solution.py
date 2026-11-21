class Node:
    __slots__ = ("key", "value", "prev", "next")

    def __init__(self, key: str = "", value: int = 0) -> None:
        self.key = key
        self.value = value
        self.prev: Node | None = None
        self.next: Node | None = None


class LRUCache:
    def __init__(self, capacity: int) -> None:
        if capacity < 0:
            raise ValueError("capacity must be >= 0")
        self.capacity = capacity
        self.nodes: dict[str, Node] = {}  # 键 -> 链表里的节点
        # 两个哨兵：head 后面是最久没用的，tail 前面是刚用过的
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node: Node) -> None:
        node.prev.next = node.next
        node.next.prev = node.prev

    def _push_back(self, node: Node) -> None:
        last = self.tail.prev
        last.next = self.tail.prev = node
        node.prev, node.next = last, self.tail

    def get(self, key: str) -> int | None:
        node = self.nodes.get(key)
        if node is None:
            return None
        self._unlink(node)  # 读一次也算使用，挪到最新的一端
        self._push_back(node)
        return node.value

    def put(self, key: str, value: int) -> None:
        node = self.nodes.get(key)
        if node is None:
            node = self.nodes[key] = Node(key, value)
        else:
            self._unlink(node)  # 覆盖旧键：键数不变，不会挤掉别人
            node.value = value
        self._push_back(node)
        if len(self.nodes) > self.capacity:
            oldest = self.head.next
            self._unlink(oldest)
            del self.nodes[oldest.key]
