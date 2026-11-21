from solution import Hit


def merge_hits_with_gap(hits: list[Hit], gap: int) -> list[Hit]:
    """同一文档里两段之间空着不超过 gap 个 token，也拼成一段。"""
    if gap < 0:
        raise ValueError("gap must be >= 0")
    merged: list[Hit] = []
    for doc, start, end in sorted(hits):
        last = merged[-1] if merged else None
        if last and last[0] == doc and start <= last[2] + gap:
            merged[-1] = (doc, last[1], max(last[2], end))
        else:
            merged.append((doc, start, end))
    return merged


def total_tokens(spans: list[Hit]) -> int:
    return sum(end - start for _, start, end in spans)
