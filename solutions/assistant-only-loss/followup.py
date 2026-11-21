from solution import assistant_loss

Sample = tuple[list[list[float]], list[int]]  # (logits, labels)


def batch_assistant_loss(batch: list[Sample]) -> float | None:
    """一批对话按 token 平均：总损失和有效位置数分别累加，最后再除。"""
    total = 0.0
    count = 0
    for logits, labels in batch:
        # 这一条的有效位置数；位置 0 不参与
        n = sum(1 for y in labels[1:] if y != -100)
        if n:
            # 这一条的平均损失乘回个数，就是它的损失总和
            total += assistant_loss(logits, labels) * n
            count += n
    return total / count if count else None
