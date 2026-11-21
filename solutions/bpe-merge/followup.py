def encode(
    tokens: list[int], merges: list[tuple[int, int, int]]
) -> list[int]:
    """按训练时学到的顺序依次合并。merges[k] = (a, b, 新 ID)。"""
    out = list(tokens)
    for a, b, new_id in merges:
        merged: list[int] = []
        i = 0
        while i < len(out):
            nxt = out[i + 1] if i + 1 < len(out) else None
            if out[i] == a and nxt == b:
                merged.append(new_id)
                i += 2
            else:
                merged.append(out[i])
                i += 1
        out = merged
    return out
