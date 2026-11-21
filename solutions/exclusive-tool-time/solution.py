Event = tuple[int, str, str]


def exclusive_time(events: list[Event]) -> dict[str, int]:
    stack: list[str] = []         # 没结束的调用，栈顶是此刻在干活的
    elapsed: dict[str, int] = {}  # 工具名 -> 独占耗时
    previous = events[0][0] if events else 0
    for t, tool, kind in events:
        if t < previous:
            raise ValueError("时间戳不能倒退")
        # 上一条到这一条之间是旧栈顶在干活；栈空就是空闲
        if stack:
            elapsed[stack[-1]] += t - previous
        if kind == "start":
            stack.append(tool)
            elapsed.setdefault(tool, 0)
        elif kind == "end":
            if not stack or stack[-1] != tool:
                raise ValueError(f"{tool} 的 end 对不上最近的 start")
            stack.pop()
        else:
            raise ValueError(f"未知事件类型 {kind!r}")
        previous = t
    if stack:
        raise ValueError(f"{stack[-1]} 没有结束")
    return elapsed
