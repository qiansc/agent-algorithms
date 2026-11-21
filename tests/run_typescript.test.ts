// 用 solutions/<slug>/cases.json 检查每道题的 TypeScript 解法。
// 判题规则在 src/lib/judge.ts，网页上的在线编辑器用的也是它。
// 运行：node --test tests/run_typescript.test.ts；只跑某几题：ONLY=slug1,slug2 node --test ...
import { test } from 'node:test';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runCase, type Spec } from '../src/lib/judge.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'solutions');
const only = new Set((process.env.ONLY ?? '').split(',').filter(Boolean));

const dirs = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && (only.size === 0 || only.has(d.name)))
  .map((d) => d.name)
  .sort();

for (const slug of dirs) {
  const casesPath = join(root, slug, 'cases.json');
  if (!existsSync(casesPath)) continue;
  const spec = JSON.parse(readFileSync(casesPath, 'utf8')) as Spec;
  const mod = (await import(pathToFileURL(join(root, slug, 'solution.ts')).href)) as Record<string, any>;
  spec.cases.forEach((c, i) => {
    test(`${slug} · ${c.name ?? `case ${i}`}`, () => {
      const r = runCase(mod, spec, c);
      if (!r.ok) throw new Error(r.reason ?? r.error ?? 'failed');
    });
  });
  const extra = join(root, slug, 'extra.test.ts');
  if (existsSync(extra)) await import(pathToFileURL(extra).href);
}
