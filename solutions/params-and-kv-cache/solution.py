def _require_positive(**values: int) -> None:
    for name, v in values.items():
        if not isinstance(v, int) or isinstance(v, bool) or v <= 0:
            raise ValueError(f"{name} must be a positive integer")


def param_count(
    layers: int,
    d: int,
    heads: int,
    kv_heads: int,
    ffn: int,
    vocab: int,
    tied: bool,
) -> int:
    _require_positive(layers=layers, d=d, heads=heads,
                      kv_heads=kv_heads, ffn=ffn, vocab=vocab)
    if d % heads or heads % kv_heads:
        raise ValueError("need d % heads == 0 and heads % kv_heads == 0")
    head_dim = d // heads
    # wq、wo：d×d；wk、wv：d×(kv_heads·head_dim)
    attn = 2 * d * d + 2 * d * kv_heads * head_dim
    mlp = 3 * d * ffn          # SwiGLU 的 gate、up、down
    norms = 2 * d              # 注意力前、FFN 前各一个 RMSNorm
    embed = vocab * d * (1 if tied else 2)  # 输入嵌入 + 输出层
    final_norm = d
    return layers * (attn + mlp + norms) + final_norm + embed


def kv_cache_bytes(
    layers: int,
    kv_heads: int,
    head_dim: int,
    seq_len: int,
    batch: int,
    bytes_per: int,
) -> int:
    _require_positive(layers=layers, kv_heads=kv_heads,
                      head_dim=head_dim, seq_len=seq_len,
                      batch=batch, bytes_per=bytes_per)
    per_token_per_layer = 2 * kv_heads * head_dim  # K 和 V 两份
    return per_token_per_layer * layers * seq_len * batch * bytes_per
