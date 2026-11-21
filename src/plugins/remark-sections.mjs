// 按二级标题整理题目页和设计页：
// - “题目”“样例”连续的两节包进一张题目卡片；
// - “延伸”“参考”整节折叠，标题变成折叠条；
// - 思路里以“为什么”开头的三级小节折叠，需要时再展开。
// 顶层的 import / export 保持在最外层，不能被包进别的元素。

const textOf = (node) =>
  node.value ?? (node.children ?? []).map(textOf).join('');

const el = (name, className, children) => ({
  type: 'mdxJsxFlowElement',
  name,
  attributes: className ? [{ type: 'mdxJsxAttribute', name: 'class', value: className }] : [],
  children,
});

const summary = (heading) => el('summary', null, [{ type: 'paragraph', children: heading.children }]);

function foldWhy(nodes) {
  const out = [];
  let open = null;
  for (const n of nodes) {
    const isH3 = n.type === 'heading' && n.depth === 3;
    if (isH3 && textOf(n).trim().startsWith('为什么')) {
      open = el('details', 'fold fold-why', [summary(n)]);
      out.push(open);
      continue;
    }
    if (isH3 || (n.type === 'heading' && n.depth <= 2)) open = null;
    if (open) open.children.push(n);
    else out.push(n);
  }
  return out;
}

export default function remarkSections() {
  return (tree, file) => {
    const path = file.path ?? file.history?.[0] ?? '';
    if (!/content\/docs\/(problems|design)\//.test(path)) return;

    const top = [];
    const sections = [];
    for (const n of tree.children) {
      if (n.type === 'mdxjsEsm') {
        top.push(n);
      } else if (n.type === 'heading' && n.depth === 2) {
        sections.push({ heading: n, body: [] });
      } else if (sections.length) {
        sections[sections.length - 1].body.push(n);
      } else {
        top.push(n);
      }
    }
    if (!sections.length) return;

    const slug = path.match(/content\/docs\/problems\/[^/]+\/([^/]+)\.mdx?$/)?.[1];
    const result = [...top];
    let card = null;
    let playgroundAdded = false;
    const addPlayground = () => {
      if (!slug || playgroundAdded) return;
      playgroundAdded = true;
      result.push(
        { type: 'heading', depth: 2, children: [{ type: 'text', value: '动手写' }] },
        {
          type: 'mdxJsxFlowElement',
          name: 'div',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'class', value: 'playground not-content' },
            { type: 'mdxJsxAttribute', name: 'data-playground', value: slug },
          ],
          children: [{ type: 'paragraph', children: [{ type: 'text', value: '编辑器加载中……' }] }],
        },
      );
    };
    for (const { heading, body } of sections) {
      const title = textOf(heading).trim();
      if (title === '题目' || title === '样例') {
        if (!card) {
          card = el('div', 'problem-card', []);
          result.push(card);
        }
        card.children.push(heading, ...body);
        continue;
      }
      if (card) addPlayground();
      card = null;
      if (title.startsWith('延伸') || title === '参考') {
        const cls = title === '参考' ? 'fold fold-section fold-ref' : 'fold fold-section';
        result.push(el('details', cls, [summary(heading), ...body]));
        continue;
      }
      result.push(heading, ...(title === '思路' ? foldWhy(body) : body));
    }
    tree.children = result;
  };
}
