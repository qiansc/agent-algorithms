// 在线编辑器的检查：按浏览器里的方式（sucrase 编译、不能 import）加载每道题的
// “答案”和“初始代码”。答案必须通过全部用例；初始代码必须能加载，并且还没通过核心用例。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'sucrase';
import { runCase, caseGroup, type Spec } from '../src/lib/judge.ts';
import { buildStarter } from '../src/lib/starter.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'solutions');
const only = new Set((process.env.ONLY ?? '').split(',').filter(Boolean));

function load(code: string, name: string): Record<string, any> {
  let js = transform(code, { transforms: ['typescript', 'imports'], filePath: 'solution.ts' }).code;
  js += `\n;try { if (typeof exports.${name} === 'undefined' && typeof ${name} !== 'undefined') exports.${name} = ${name}; } catch (e) {}`;
  const exp: Record<string, any> = {};
  const quiet = { log() {}, info() {}, warn() {}, error() {} };
  new Function('exports', 'module', 'console', 'require', js)(exp, { exports: exp }, quiet, () => {
    throw new Error('no import in playground');
  });
  return exp;
}

const slugs = readdirSync(root)
  .filter((s) => !s.startsWith('design-') && existsSync(join(root, s, 'cases.json')))
  .filter((s) => only.size === 0 || only.has(s))
  .sort();

for (const slug of slugs) {
  const spec = JSON.parse(readFileSync(join(root, slug, 'cases.json'), 'utf8')) as Spec;
  const source = readFileSync(join(root, slug, 'solution.ts'), 'utf8');
  test(`playground · ${slug} · 答案通过全部用例`, () => {
    const mod = load(buildStarter(source, spec as never, 'answer'), spec.typescript);
    for (const c of spec.cases) {
      const r = runCase(mod, spec, c);
      assert.ok(r.ok, `${c.name}: ${r.reason ?? r.error}`);
    }
  });
  test(`playground · ${slug} · 初始代码能加载`, () => {
    const mod = load(buildStarter(source, spec as never), spec.typescript);
    const core = spec.cases.find((c) => caseGroup(c) === 'core')!;
    assert.equal(runCase(mod, spec, core).ok, false, '初始代码不应该直接通过核心用例');
  });
}
