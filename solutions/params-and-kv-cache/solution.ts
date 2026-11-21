function requirePositive(values: Record<string, number>): void {
  for (const [name, v] of Object.entries(values)) {
    if (!Number.isInteger(v) || v <= 0) {
      throw new Error(`${name} must be a positive integer`);
    }
  }
}

// 结果用普通 number：约 8e9，远小于 Number.MAX_SAFE_INTEGER（约 9e15）
export function paramCount(
  layers: number,
  d: number,
  heads: number,
  kvHeads: number,
  ffn: number,
  vocab: number,
  tied: boolean,
): number {
  requirePositive({ layers, d, heads, kvHeads, ffn, vocab });
  if (d % heads !== 0 || heads % kvHeads !== 0) {
    throw new Error('need d % heads == 0 and heads % kvHeads == 0');
  }
  const headDim = d / heads;
  // wq、wo：d×d；wk、wv：d×(kvHeads·headDim)
  const attn = 2 * d * d + 2 * d * kvHeads * headDim;
  const mlp = 3 * d * ffn; // SwiGLU 的 gate、up、down
  const norms = 2 * d; // 注意力前、FFN 前各一个 RMSNorm
  const embed = vocab * d * (tied ? 1 : 2); // 输入嵌入 + 输出层
  const finalNorm = d;
  return layers * (attn + mlp + norms) + finalNorm + embed;
}

export function kvCacheBytes(
  layers: number,
  kvHeads: number,
  headDim: number,
  seqLen: number,
  batch: number,
  bytesPer: number,
): number {
  requirePositive({ layers, kvHeads, headDim, seqLen, batch, bytesPer });
  const perTokenPerLayer = 2 * kvHeads * headDim; // K 和 V 两份
  return perTokenPerLayer * layers * seqLen * batch * bytesPer;
}
