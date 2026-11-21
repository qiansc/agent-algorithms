import heapq


def max_on_time(orders: list[list[int]]) -> int:
    """orders[i] = [d, D]：往返 d 分钟，最晚第 D 分钟回到店里。

    返回最多能准时完成几单。
    """
    for order in orders:
        if len(order) != 2:
            raise ValueError("每一单必须是 [d, D]")
        d, deadline = order
        if d < 1 or deadline < 0:
            raise ValueError("d 至少为 1，D 不能为负")
    chosen: list[int] = []  # 已选订单的时长，取负数当最大堆用
    total = 0               # 已选订单按截止时间排好后，最后一单的完成时刻
    for d, deadline in sorted(orders, key=lambda o: o[1]):
        heapq.heappush(chosen, -d)
        total += d
        if total > deadline:
            # 超时了：去掉已选里最长的一单（可能就是刚放进来的这单）
            total += heapq.heappop(chosen)
    return len(chosen)
