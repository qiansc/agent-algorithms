from solution import ToolNames


def allowed_tokens(
    names: ToolNames, prefix: str, vocab: list[str]
) -> list[str]:
    """一个 token 可能含多个字符：每个字符都要能依次走通。"""
    start = names.walk(prefix)
    if start is None:
        return []
    ok = []
    for token in set(vocab):
        node = start
        for c in token:
            node = node.children.get(c)
            if node is None:
                break
        if token and node is not None:
            ok.append(token)
    return sorted(ok)
