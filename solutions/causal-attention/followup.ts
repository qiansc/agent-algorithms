/** 逐个生成 token：缓存各位置的 K、V，新位置只算自己这一行。 */
export class KVCache {
  keys: number[][] = [];
  values: number[][] = [];

  step(q: number[], k: number[], v: number[]): number[] {
    this.keys.push(k); // 先存自己：新位置可以看见自己
    this.values.push(v);
    const scale = Math.sqrt(q.length);
    const scores = this.keys.map(
      (key) => key.reduce((acc, x, c) => acc + q[c] * x, 0) / scale,
    );
    const peak = Math.max(...scores);
    const weights = scores.map((s) => Math.exp(s - peak));
    const total = weights.reduce((a, b) => a + b, 0);
    const row = new Array<number>(v.length).fill(0);
    weights.forEach((w, j) => {
      this.values[j].forEach((x, c) => {
        row[c] += (w / total) * x;
      });
    });
    return row;
  }
}
