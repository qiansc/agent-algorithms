from collections import deque


def order_kind(n: int, edges: list[tuple[int, int]]) -> str:
    """返回 "cycle"（有环）、"unique"（合法顺序唯一）或 "many"。"""
    children: list[list[int]] = [[] for _ in range(n)]
    missing = [0] * n
    for before, after in edges:
        children[before].append(after)
        missing[after] += 1

    ready = deque(i for i in range(n) if missing[i] == 0)
    done = 0
    unique = True
    while ready:
        if len(ready) > 1:  # 这一步有两个以上的工具可选
            unique = False
        tool = ready.popleft()
        done += 1
        for child in children[tool]:
            missing[child] -= 1
            if missing[child] == 0:
                ready.append(child)
    if done < n:
        return "cycle"
    return "unique" if unique else "many"
