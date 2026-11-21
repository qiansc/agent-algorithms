from typing import Any

Tree = tuple[Any, "Tree", "Tree"] | None


def right_view_dfs(root: Tree) -> list[Any]:
    """深度优先、先右后左；每个深度第一次碰到的节点就是答案。

    额外空间 O(树高)。
    """
    result = []
    stack = [(root, 0)] if root is not None else []
    while stack:
        (value, left, right), depth = stack.pop()
        if depth == len(result):  # 这个深度第一次到达
            result.append(value)
        # 栈后进先出：先压左、再压右，右边就先被处理
        if left is not None:
            stack.append((left, depth + 1))
        if right is not None:
            stack.append((right, depth + 1))
    return result
