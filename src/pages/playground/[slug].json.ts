// 每道题生成一份在线编辑器用的数据：初始代码、导出名和全部测试用例。
import type { APIRoute } from 'astro';
import { problems } from '../../data/problems';
import { caseGroup, type Spec } from '../../lib/judge';
import { buildStarter } from '../../lib/starter';

const solutions = import.meta.glob('/solutions/*/solution.ts', { query: '?raw', import: 'default', eager: true });
const specs = import.meta.glob('/solutions/*/cases.json', { import: 'default', eager: true });

export function getStaticPaths() {
  return problems.map((p) => ({ params: { slug: p.slug } }));
}

export const GET: APIRoute = ({ params }) => {
  const slug = params.slug as string;
  const spec = specs[`/solutions/${slug}/cases.json`] as Spec & { starter?: unknown };
  const source = solutions[`/solutions/${slug}/solution.ts`] as string;
  const body = {
    slug,
    kind: spec.kind ?? 'function',
    typescript: spec.typescript,
    methods: spec.methods ?? {},
    tol: spec.tol,
    starter: buildStarter(source, spec as never),
    answer: buildStarter(source, spec as never, 'answer'),
    cases: spec.cases.map((c) => ({ ...c, group: caseGroup(c) })),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
