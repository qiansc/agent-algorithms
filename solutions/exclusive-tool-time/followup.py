from solution import Event


def exclusive_time_units(events: list[Event]) -> dict[str, int]:
    # 时间按整格计：end t 表示第 t 格也跑完了
    stack: list[str] = []
    elapsed: dict[str, int] = {}
    # 下一段还没结算的时间从哪一格开始
    previous = events[0][0] if events else 0
    for t, tool, kind in events:
        if kind == "start":
            if stack:
                elapsed[stack[-1]] += t - previous
            stack.append(tool)
            elapsed.setdefault(tool, 0)
            previous = t
        elif kind == "end":
            if not stack or stack[-1] != tool:
                raise ValueError(f"{tool} 的 end 对不上最近的 start")
            # 第 t 格也算这个工具的，所以结算到 t + 1
            elapsed[stack.pop()] += t + 1 - previous
            previous = t + 1
        else:
            raise ValueError(f"未知事件类型 {kind!r}")
    if stack:
        raise ValueError(f"{stack[-1]} 没有结束")
    return elapsed
