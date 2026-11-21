def lcs_length(a: list[str], b: list[str]) -> int:
    if len(a) < len(b):
        a, b = b, a  # 让 b 是短的那个，两行数组的长度取 min(m, n) + 1
    prev = [0] * (len(b) + 1)
    for x in a:
        cur = [0] * (len(b) + 1)
        for j, y in enumerate(b, start=1):
            if x == y:
                cur[j] = prev[j - 1] + 1
            else:
                cur[j] = max(prev[j], cur[j - 1])
        prev = cur
    return prev[-1]


def rouge_l(
    reference: str,
    candidate: str,
) -> tuple[float, float, float]:
    """返回 (精确率, 召回率, F1)。按空白切词，大小写敏感。"""
    ref, cand = reference.split(), candidate.split()
    hit = lcs_length(ref, cand)
    if hit == 0:
        return 0.0, 0.0, 0.0  # 也覆盖了任一方为空的情况，避免除以 0
    precision = hit / len(cand)  # 分母是模型输出的词数
    recall = hit / len(ref)      # 分母是参考答案的词数
    f1 = 2 * precision * recall / (precision + recall)
    return precision, recall, f1
