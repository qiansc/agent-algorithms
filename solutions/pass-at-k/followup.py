from solution import pass_at_k


def mean_pass_at_k(tasks: list[tuple[int, int]], k: int) -> float:
    """tasks 里每项是一道题的 (n, c)。先逐题算 pass@k，再取平均。"""
    if not tasks:
        raise ValueError("至少要有一道题")
    return sum(pass_at_k(n, c, k) for n, c in tasks) / len(tasks)
