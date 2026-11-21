from collections.abc import Callable, Iterable

Path = tuple[str, ...]
Expand = Callable[[Path], Iterable[tuple[str, int]]]


def beam_plan(
    expand: Expand, depth: int, width: int
) -> tuple[Path, int] | None:
    """束宽为 width，恰好走 depth 步，返回 (路径, 累计分)。

    某一层一个新序列都没有时返回 None。
    """
    if width < 1 or depth < 0:
        raise ValueError("width 至少为 1，depth 不能为负")
    beam: list[tuple[Path, int]] = [((), 0)]
    for _ in range(depth):
        candidates = []  # 这一层所有父序列共用一个候选池
        for path, total in beam:
            for action, increment in expand(path):
                candidates.append((path + (action,), total + increment))
        if not candidates:
            return None
        # sort 是稳定的：同分时保持生成顺序，先生成的在前
        candidates.sort(key=lambda item: item[1], reverse=True)
        beam = candidates[:width]
    return beam[0]


def beam_plan_from_table(
    table: list[list], depth: int, width: int
) -> tuple[Path, int] | None:
    """用表格描述搜索树，供测试使用。

    table 每项是 [路径, [[动作, 增量分], ...]]，表里没有的路径没有后继。
    """
    children = {tuple(path): moves for path, moves in table}
    return beam_plan(
        lambda path: [(a, inc) for a, inc in children.get(path, [])],
        depth,
        width,
    )
