from collections import deque


def plan_time(duration: list[int], edges: list[tuple[int, int]]) -> int:
    n = len(duration)
    if any(d <= 0 for d in duration):
        raise ValueError("durations must be positive")
    children: list[list[int]] = [[] for _ in range(n)]
    missing = [0] * n  # 入度：还有几个前置没完成
    for parent, child in edges:
        if not (0 <= parent < n and 0 <= child < n):
            raise ValueError("tool id out of range")
        children[parent].append(child)
        missing[child] += 1

    # finish[v]：v 最早什么时候完成。没有前置时就是它自己的耗时
    finish = list(duration)
    ready = deque(i for i in range(n) if missing[i] == 0)
    completed = 0
    while ready:
        parent = ready.popleft()
        completed += 1
        for child in children[parent]:
            # child 要等最晚的那个前置，所以取 max
            via_parent = finish[parent] + duration[child]
            finish[child] = max(finish[child], via_parent)
            missing[child] -= 1
            if missing[child] == 0:
                ready.append(child)
    if completed < n:
        return -1  # 有环：环上的工具永远等不到前置
    return max(finish, default=0)
