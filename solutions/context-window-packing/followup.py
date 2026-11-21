Message = tuple[str, int]  # (角色, token 数)


def pack_context_blocks(
    messages: list[Message], budget: int
) -> tuple[list[Message], int]:
    """不要求以 user 开头，但工具调用和它的结果必须同进同出。"""
    if budget < 0:
        raise ValueError("budget must be >= 0")
    system = [m for m in messages[:1] if m[0] == "system"]
    used = sum(tokens for _, tokens in system)
    if used > budget:
        raise ValueError("system prompt alone exceeds budget")

    # tool 结果并进它前面那条消息所在的块，
    # 也就是发出调用的那条助手消息
    blocks: list[list[Message]] = []
    for m in messages[len(system):]:
        if m[0] == "tool" and blocks:
            blocks[-1].append(m)
        else:
            blocks.append([m])
    cost = [sum(tokens for _, tokens in b) for b in blocks]

    # 和原题一样从新往旧装，放不下就停；
    # 只是单位从“一条消息”换成了“一个块”
    start = len(blocks)
    while start > 0 and used + cost[start - 1] <= budget:
        start -= 1
        used += cost[start]
    kept = [m for b in blocks[start:] for m in b]
    return system + kept, budget - used
