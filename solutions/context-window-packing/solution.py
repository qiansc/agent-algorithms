Message = tuple[str, int]  # (角色, token 数)


def pack_context(
    messages: list[Message], budget: int
) -> tuple[list[Message], int]:
    if budget < 0:
        raise ValueError("budget must be >= 0")
    # 只有第一条、且角色是 system 时才算系统提示
    system = [m for m in messages[:1] if m[0] == "system"]
    history = messages[len(system):]
    used = sum(tokens for _, tokens in system)
    if used > budget:
        raise ValueError("system prompt alone exceeds budget")

    start = len(history)  # 保留 history[start:]
    while start > 0 and used + history[start - 1][1] <= budget:
        start -= 1
        used += history[start][1]
    # 第一条放不下就停，不跳过它去装更旧的消息。
    # 开头不是 user 的消息依次丢掉，并把它们的 token 还回预算
    while start < len(history) and history[start][0] != "user":
        used -= history[start][1]
        start += 1
    return system + history[start:], budget - used
