import heapq


def tool_order(n: int, edges: list[tuple[int, int]]) -> list[int]:
    children: list[list[int]] = [[] for _ in range(n)]
    missing = [0] * n  # 入度：还差几个前置工具没执行
    for before, after in edges:
        if not (0 <= before < n and 0 <= after < n):
            raise ValueError("tool id out of range")
        children[before].append(after)
        missing[after] += 1

    ready = [i for i in range(n) if missing[i] == 0]
    heapq.heapify(ready)  # 所有已就绪的工具，堆顶是编号最小的
    order: list[int] = []
    while ready:
        tool = heapq.heappop(ready)
        order.append(tool)
        for child in children[tool]:
            missing[child] -= 1
            if missing[child] == 0:
                heapq.heappush(ready, child)
    # 堆空了还有工具没执行：剩下的互相等待，有环
    return order if len(order) == n else []
