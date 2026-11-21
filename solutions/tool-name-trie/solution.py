class _Node:
    def __init__(self) -> None:
        self.children: dict[str, "_Node"] = {}  # 下一个字符 -> 子节点
        self.end = False  # 走到这里是否已经拼出一个完整的名字


class ToolNames:
    def __init__(self, names: list[str]) -> None:
        self.root = _Node()
        for name in names:
            if not name or not all("a" <= c <= "z" for c in name):
                raise ValueError(f"工具名须为非空小写字母串：{name!r}")
            node = self.root
            for c in name:
                node = node.children.setdefault(c, _Node())
            node.end = True  # 盖章；这个节点可能还有孩子

    def walk(self, prefix: str) -> _Node | None:
        node = self.root
        for c in prefix:
            node = node.children.get(c)
            if node is None:
                return None
        return node

    def allowed(self, prefix: str) -> tuple[list[str], bool]:
        node = self.walk(prefix)
        if node is None:
            return [], False
        return sorted(node.children), node.end
