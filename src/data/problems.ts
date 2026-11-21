// 全站题目清单。编号按这里的顺序自动生成，页面地址由 group 和 slug 决定。
export type Level = '入门' | '核心' | '进阶';
// 难度参照力扣：有对应原题的取原题难度，其余按同类题估计。
export type Difficulty = '简单' | '中等' | '困难';

export interface Group {
  id: string;
  name: string;
}

export interface Problem {
  slug: string;
  title: string;
  group: string;
  difficulty: Difficulty;
  level: Level;
  minutes: number;
}

export const groups: Group[] = [
  { id: 'retrieval', name: '检索与排序' },
  { id: 'context', name: '上下文与记忆' },
  { id: 'planning', name: '工具调用与规划' },
  { id: 'engineering', name: 'Agent 工程' },
  { id: 'model', name: '模型推理' },
  { id: 'training', name: '训练与评测' },
  { id: 'classic', name: '经典算法' },
];

const list: Problem[] = [
  { slug: 'top-k-tools', title: '统计最常被调用的 K 个工具', group: 'retrieval', difficulty: '中等', level: '核心', minutes: 15 },
  { slug: 'rrf-fusion', title: '两份检索榜单，只靠名次怎样合并', group: 'retrieval', difficulty: '简单', level: '入门', minutes: 20 },
  { slug: 'cosine-top-k', title: '手写一个精确的余弦检索器', group: 'retrieval', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'bm25', title: '三篇小文档，手算 BM25 排序', group: 'retrieval', difficulty: '中等', level: '核心', minutes: 25 },
  { slug: 'mmr-rerank', title: '用 MMR 选出既相关又不重复的片段', group: 'retrieval', difficulty: '中等', level: '核心', minutes: 25 },
  { slug: 'shortest-evidence-window', title: '截取覆盖所有检索词的最短原文', group: 'retrieval', difficulty: '困难', level: '核心', minutes: 30 },
  { slug: 'posting-list-intersection', title: '求同时含有几个词的文档编号', group: 'retrieval', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'merge-hit-spans', title: '合并同篇文档里重复命中的原文区间', group: 'retrieval', difficulty: '中等', level: '核心', minutes: 20 },
  { slug: 'kth-score-stream', title: '分数逐个到达，随时返回第 K 大', group: 'retrieval', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'recall-mrr', title: '写一个 Recall@K 和 MRR@K 评测函数', group: 'retrieval', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'auc-with-ties', title: '分数有并列时，AUC 怎么算', group: 'retrieval', difficulty: '中等', level: '核心', minutes: 25 },

  { slug: 'chunk-with-overlap', title: '按固定长度和重叠切分文档', group: 'context', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'context-window-packing', title: '上下文超长了，保留哪些历史消息', group: 'context', difficulty: '简单', level: '核心', minutes: 25 },
  { slug: 'lru-cache', title: '缓存满了，应该丢掉哪次工具查询', group: 'context', difficulty: '中等', level: '入门', minutes: 30 },
  { slug: 'time-travel-kv', title: '回放对话时，当时生效的是哪个偏好', group: 'context', difficulty: '中等', level: '核心', minutes: 20 },

  { slug: 'lexicographic-tool-order', title: '工具有先后依赖，排出字典序最小的执行顺序', group: 'planning', difficulty: '中等', level: '入门', minutes: 25 },
  { slug: 'parallel-finish-time', title: '多个工具可以并行，结果最早什么时候到齐', group: 'planning', difficulty: '困难', level: '核心', minutes: 25 },
  { slug: 'concurrency-limited-calls', title: '最多同时跑 k 个调用，每个什么时候完成', group: 'planning', difficulty: '中等', level: '核心', minutes: 25 },
  { slug: 'capped-cost-path', title: '最多调用 K 次，最便宜的工具链多少钱', group: 'planning', difficulty: '中等', level: '进阶', minutes: 30 },
  { slug: 'weighted-interval-scheduling', title: '一个浏览器只能跑一个任务，怎样选收益最大', group: 'planning', difficulty: '困难', level: '进阶', minutes: 30 },
  { slug: 'dual-budget-knapsack', title: '调用次数和 token 都有限，哪些分支值得跑', group: 'planning', difficulty: '中等', level: '进阶', minutes: 30 },
  { slug: 'cheapest-checkout', title: '满减凑单：怎样加菜付得最少', group: 'planning', difficulty: '中等', level: '核心', minutes: 30 },
  { slug: 'on-time-deliveries', title: '一位骑手，最多能准时送达几单', group: 'planning', difficulty: '困难', level: '核心', minutes: 30 },
  { slug: 'beam-search-plan', title: '给定动作分数，手写一次束搜索', group: 'planning', difficulty: '中等', level: '进阶', minutes: 25 },
  { slug: 'uct-selection', title: '树搜索选下一步：UCT 公式选哪个孩子', group: 'planning', difficulty: '简单', level: '核心', minutes: 20 },

  { slug: 'sliding-window-rate-limit', title: '一分钟最多接三次，哪些请求会放行', group: 'engineering', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'exclusive-tool-time', title: '一段嵌套调用日志，每个工具自己花了多久', group: 'engineering', difficulty: '中等', level: '核心', minutes: 25 },
  { slug: 'streaming-think-filter', title: '流式输出里隐藏思考内容，标签可能被切开', group: 'engineering', difficulty: '中等', level: '入门', minutes: 30 },
  { slug: 'deep-merge-config', title: '深度合并两份嵌套配置', group: 'engineering', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'tool-name-trie', title: '工具名只生成了一半，下一步允许输出什么', group: 'engineering', difficulty: '中等', level: '核心', minutes: 20 },

  { slug: 'masked-softmax', title: '合法动作的概率：手写带掩码的稳定 softmax', group: 'model', difficulty: '简单', level: '入门', minutes: 20 },
  { slug: 'top-p-sampling', title: '给定随机数，Top-p 会抽中哪个 token', group: 'model', difficulty: '中等', level: '核心', minutes: 20 },
  { slug: 'sampling-penalties', title: '重复惩罚、温度、Top-k 依次作用后的概率', group: 'model', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'causal-attention', title: '只能看见左侧 token 的单头注意力', group: 'model', difficulty: '中等', level: '入门', minutes: 25 },
  { slug: 'multi-head-attention', title: '把单头因果注意力改成多头', group: 'model', difficulty: '中等', level: '入门', minutes: 30 },
  { slug: 'rope', title: '给向量加上旋转位置编码 RoPE', group: 'model', difficulty: '中等', level: '核心', minutes: 25 },
  { slug: 'layernorm-rmsnorm', title: '手写 LayerNorm 和 RMSNorm', group: 'model', difficulty: '简单', level: '核心', minutes: 15 },
  { slug: 'params-and-kv-cache', title: '按配置估算参数量和 KV Cache 显存', group: 'model', difficulty: '简单', level: '入门', minutes: 20 },
  { slug: 'lora-layer', title: '写一个 LoRA 线性层，再把它合并回原权重', group: 'model', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'bpe-merge', title: '手写一轮 BPE 合并', group: 'model', difficulty: '中等', level: '进阶', minutes: 25 },

  { slug: 'assistant-only-loss', title: '只计算助手 token 的交叉熵', group: 'training', difficulty: '中等', level: '核心', minutes: 25 },
  { slug: 'info-nce', title: '一批查询和文档，算 InfoNCE 对比损失', group: 'training', difficulty: '中等', level: '核心', minutes: 25 },
  { slug: 'gae', title: '一条短轨迹，倒着算出 GAE 优势', group: 'training', difficulty: '中等', level: '核心', minutes: 25 },
  { slug: 'ppo-clip', title: '给定新旧动作概率，算 PPO 裁剪损失', group: 'training', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'grpo-advantage', title: '同一任务的多次尝试，算 GRPO 组内优势', group: 'training', difficulty: '简单', level: '核心', minutes: 15 },
  { slug: 'dpo-loss', title: '两条回答哪条更符合偏好：DPO 损失', group: 'training', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'pass-at-k', title: '五次尝试两次成功，pass@2 是多少', group: 'training', difficulty: '简单', level: '核心', minutes: 20 },
  { slug: 'trajectory-edit-distance', title: '两条工具轨迹，最少改几步才能一样', group: 'training', difficulty: '中等', level: '核心', minutes: 25 },
  { slug: 'routing-threshold', title: '工具路由器的阈值设多少，总损失最低', group: 'training', difficulty: '中等', level: '进阶', minutes: 25 },

  { slug: 'longest-unique-substring', title: '最长无重复子串', group: 'classic', difficulty: '中等', level: '入门', minutes: 20 },
  { slug: 'spiral-matrix', title: '按顺时针读出矩阵', group: 'classic', difficulty: '中等', level: '核心', minutes: 20 },
  { slug: 'right-side-view', title: '站在二叉树右边，每层能看到谁', group: 'classic', difficulty: '中等', level: '核心', minutes: 20 },
  { slug: 'subarray-sum-k', title: '连续几步的总奖励正好是 k，有多少种截法', group: 'classic', difficulty: '中等', level: '核心', minutes: 20 },
  { slug: 'number-of-islands', title: '岛屿数量和最大岛屿面积', group: 'classic', difficulty: '中等', level: '入门', minutes: 25 },
  { slug: 'longest-increasing-subsequence', title: '最长递增子序列，O(n log n)', group: 'classic', difficulty: '中等', level: '入门', minutes: 25 },
  { slug: 'longest-common-subsequence', title: '最长公共子序列，并输出这条序列', group: 'classic', difficulty: '中等', level: '核心', minutes: 25 },
  { slug: 'largest-number-below', title: '用给定数字拼出小于 n 的最大数', group: 'classic', difficulty: '中等', level: '核心', minutes: 25 },
];

export const problems = list.map((p, i) => ({ ...p, number: i + 1 }));

export function getProblem(slug: string) {
  const found = problems.find((p) => p.slug === slug);
  if (!found) throw new Error(`unknown problem: ${slug}`);
  return found;
}

export function problemPath(slug: string) {
  const p = getProblem(slug);
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/problems/${p.group}/${p.slug}/`;
}

export function groupName(id: string) {
  return groups.find((g) => g.id === id)?.name ?? id;
}

// 首页的学习安排。题目用 slug，设计练习用 design: 前缀。
export interface StudyDay {
  title: string;
  theme: string;
  items: string[];
}

export const threeDayPlan: StudyDay[] = [
  {
    title: '第 1 天',
    theme: '高频基础',
    items: [
      'longest-unique-substring',
      'lru-cache',
      'causal-attention',
      'multi-head-attention',
      'rrf-fusion',
      'lexicographic-tool-order',
      'masked-softmax',
      'number-of-islands',
      'longest-increasing-subsequence',
      'streaming-think-filter',
      'params-and-kv-cache',
    ],
  },
  {
    title: '第 2 天',
    theme: 'Agent 工程与外卖场景',
    items: [
      'concurrency-limited-calls',
      'deep-merge-config',
      'context-window-packing',
      'parallel-finish-time',
      'sliding-window-rate-limit',
      'exclusive-tool-time',
      'cheapest-checkout',
      'auc-with-ties',
      'bm25',
      'mmr-rerank',
      'design:intent-to-tool-plan',
      'design:confirm-before-payment',
    ],
  },
  {
    title: '第 3 天',
    theme: '动态规划与训练目标',
    items: [
      'longest-common-subsequence',
      'trajectory-edit-distance',
      'largest-number-below',
      'spiral-matrix',
      'subarray-sum-k',
      'grpo-advantage',
      'ppo-clip',
      'dpo-loss',
      'rope',
      'layernorm-rmsnorm',
      'design:out-of-stock-fallback',
      'design:context-and-memory',
      'design:evaluating-the-assistant',
    ],
  },
];

export const designs = [
  { slug: 'intent-to-tool-plan', title: '从一句话到工具调用计划' },
  { slug: 'confirm-before-payment', title: '下单与支付：确认、幂等和重试' },
  { slug: 'out-of-stock-fallback', title: '缺货、闭店和超时：怎样降级' },
  { slug: 'context-and-memory', title: '会话状态和长期偏好怎么存' },
  { slug: 'evaluating-the-assistant', title: '怎样评测一个点餐助手' },
];
