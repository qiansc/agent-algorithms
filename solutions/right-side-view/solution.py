from collections import deque
from typing import Any

# 一棵树写成 (值, 左子树, 右子树)，空树是 None。
Tree = tuple[Any, "Tree", "Tree"] | None


def right_view(root: Tree) -> list[Any]:
    if root is None:
        return []
    queue = deque([root])
    result = []
    while queue:
        width = len(queue)  # 这一层有几个节点，只弹出这么多个
        for _ in range(width):
            # 节点不是三项时，解包会抛 ValueError
            value, left, right = queue.popleft()
            if left is not None:
                queue.append(left)
            if right is not None:
                queue.append(right)
        result.append(value)  # 这一层最后弹出的，就是最靠右的
    return result
