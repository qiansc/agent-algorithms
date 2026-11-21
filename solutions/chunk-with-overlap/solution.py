def chunk_spans(
    n: int, size: int, overlap: int
) -> list[tuple[int, int]]:
    if n < 0 or size <= 0 or not 0 <= overlap < size:
        raise ValueError("need n >= 0 and 0 <= overlap < size")
    step = size - overlap  # 相邻两块起点的距离，一定 >= 1
    spans: list[tuple[int, int]] = []
    start = 0
    while start < n:
        end = min(start + size, n)
        spans.append((start, end))
        if end == n:
            break  # 这一块已经到文档末尾，再切只会切出重复的碎片
        start += step
    return spans
