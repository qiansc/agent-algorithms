export type Expand = (path: readonly string[]) => [string, number][];

// 束宽为 width，恰好走 depth 步，返回 [路径, 累计分]。
// 某一层一个新序列都没有时返回 null。
export function beamPlan(
  expand: Expand,
  depth: number,
  width: number,
): [string[], number] | null {
  if (width < 1 || depth < 0) {
    throw new Error('width 至少为 1，depth 不能为负');
  }
  let beam: [string[], number][] = [[[], 0]];
  for (let step = 0; step < depth; step++) {
    // 这一层所有父序列共用一个候选池
    const candidates: [string[], number][] = [];
    for (const [path, total] of beam) {
      for (const [action, increment] of expand(path)) {
        candidates.push([[...path, action], total + increment]);
      }
    }
    if (candidates.length === 0) return null;
    // sort 从 ES2019 起保证稳定：同分时保持生成顺序，先生成的在前
    candidates.sort((x, y) => y[1] - x[1]);
    beam = candidates.slice(0, width);
  }
  return beam[0];
}

// 用表格描述搜索树，供测试使用。
// table 每项是 [路径, [[动作, 增量分], ...]]，表里没有的路径没有后继。
export function beamPlanFromTable(
  table: [string[], [string, number][]][],
  depth: number,
  width: number,
): [string[], number] | null {
  // 数组不能直接当 Map 的键，用 JSON 字符串代替
  const children = new Map(
    table.map(([path, moves]) => [JSON.stringify(path), moves]),
  );
  return beamPlan(
    (path) => children.get(JSON.stringify(path)) ?? [],
    depth,
    width,
  );
}
