// 在独立线程里编译并运行读者的代码，逐条跑测试用例。
// 主线程超时后会直接结束这个线程，死循环不会卡住页面。
import { transform } from 'sucrase';
import { runCase, normalize, type Spec } from '../../lib/judge';

interface Job {
  code: string;
  spec: Spec & { cases: (Spec['cases'][number] & { group: 'core' | 'edge' })[] };
}

const MAX_LOG_LINES = 200;

function show(v: unknown): string {
  if (typeof v === 'string') return v;
  try {
    const s = JSON.stringify(normalize(v));
    return s === undefined ? String(v) : s;
  } catch {
    return String(v);
  }
}

// new Function 会在代码前面加两行，报错行号要减回去。
function userLine(e: unknown): number | null {
  const stack = e instanceof Error ? (e.stack ?? '') : '';
  const m = stack.match(/<anonymous>:(\d+):(\d+)/);
  return m ? Number(m[1]) - 2 : null;
}

self.onmessage = (event: MessageEvent<Job>) => {
  const { code, spec } = event.data;
  const logs: string[] = [];
  const push = (prefix: string) => (...args: unknown[]) => {
    if (logs.length < MAX_LOG_LINES) logs.push(prefix + args.map(show).join(' '));
  };
  const fakeConsole = { log: push(''), info: push(''), warn: push('⚠ '), error: push('✖ ') };

  let js: string;
  try {
    js = transform(code, { transforms: ['typescript', 'imports'], filePath: 'solution.ts' }).code;
  } catch (e) {
    const err = e as Error & { loc?: { line: number; column: number } };
    postMessage({
      type: 'syntax',
      message: err.message.replace(/^Error transforming [^:]+:\s*/, '').replace(/\s*\(\d+:\d+\)$/, ''),
      line: err.loc?.line ?? null,
      column: err.loc ? err.loc.column + 1 : null,
    });
    return;
  }

  // 没写 export 也能找到：最后把同名的顶层函数或类补到导出里
  const name = spec.typescript;
  js += `\n;try { if (typeof exports.${name} === 'undefined' && typeof ${name} !== 'undefined') exports.${name} = ${name}; } catch (e) {}`;

  const exportsObj: Record<string, unknown> = {};
  try {
    new Function('exports', 'module', 'console', 'require', js)(
      exportsObj,
      { exports: exportsObj },
      fakeConsole,
      () => {
        throw new Error('在线编辑器里不能 import 其他模块');
      },
    );
  } catch (e) {
    postMessage({
      type: 'runtime',
      message: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
      line: userLine(e),
      logs,
    });
    return;
  }

  if (exportsObj[name] === undefined) {
    postMessage({ type: 'missing', name, logs });
    return;
  }

  const results = spec.cases.map((c) => {
    const t0 = performance.now();
    const r = runCase(exportsObj as Record<string, any>, spec, c);
    return {
      name: c.name ?? '',
      group: c.group,
      ok: r.ok,
      input: spec.kind === 'class' ? { init: c.init, calls: c.calls } : c.args,
      expected: c.raises ? '（应抛出异常）' : c.expected,
      got: r.got,
      error: r.error,
      reason: r.reason,
      ms: performance.now() - t0,
    };
  });
  postMessage({ type: 'done', results, logs });
};
