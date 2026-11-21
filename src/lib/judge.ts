// 判题规则：仓库里的 TypeScript 测试和网页上的在线编辑器共用这一份，
// 保证两边对“对不对”的判断完全一致。规则与 tests/run_python.py 相同。

export interface Case {
  name?: string;
  args?: unknown[];
  expected?: unknown;
  raises?: boolean;
  tol?: number;
  init?: unknown[];
  calls?: [string, unknown[]][];
}

export interface Spec {
  kind?: 'function' | 'class';
  python?: string;
  typescript: string;
  methods?: Record<string, string>;
  tol?: number;
  cases: Case[];
}

export interface CaseResult {
  ok: boolean;
  got?: unknown;
  error?: string;
  reason?: string;
}

export function decode(v: unknown): unknown {
  if (v === '__inf__') return Infinity;
  if (v === '__-inf__') return -Infinity;
  if (Array.isArray(v)) return v.map(decode);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, decode(x)]));
  }
  return v;
}

export function normalize(v: unknown): unknown {
  if (v === undefined) return null;
  if (v === Infinity) return '__inf__';
  if (v === -Infinity) return '__-inf__';
  if (Array.isArray(v)) return v.map(normalize);
  if (v instanceof Set) return [...v].map(normalize).sort();
  if (v instanceof Map) {
    return Object.fromEntries([...v].map(([k, x]) => [String(k), normalize(x)]));
  }
  if (typeof v === 'bigint') return Number(v);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, normalize(x)]));
  }
  return v;
}

export function same(got: unknown, want: unknown, tol: number, path = '$'): string | null {
  if (typeof want === 'number' && typeof got === 'number') {
    return Math.abs(got - want) <= tol * Math.max(1, Math.abs(want))
      ? null
      : `${path}: got ${got}, want ${want}`;
  }
  if (Array.isArray(want) && Array.isArray(got)) {
    if (got.length !== want.length) {
      return `${path}: length ${got.length} != ${want.length}`;
    }
    for (let i = 0; i < want.length; i++) {
      const err = same(got[i], want[i], tol, `${path}[${i}]`);
      if (err) return err;
    }
    return null;
  }
  if (
    want && got && typeof want === 'object' && typeof got === 'object' &&
    !Array.isArray(want) && !Array.isArray(got)
  ) {
    const a = Object.keys(got).sort();
    const b = Object.keys(want).sort();
    if (JSON.stringify(a) !== JSON.stringify(b)) return `${path}: keys ${a} != ${b}`;
    for (const k of b) {
      const err = same(
        (got as Record<string, unknown>)[k],
        (want as Record<string, unknown>)[k],
        tol,
        `${path}.${k}`,
      );
      if (err) return err;
    }
    return null;
  }
  return got === want ? null : `${path}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`;
}

// 跑一条用例。mod 是解法模块的导出对象。
export function runCase(mod: Record<string, any>, spec: Spec, c: Case): CaseResult {
  const tol = c.tol ?? spec.tol ?? 1e-9;
  const target = mod[spec.typescript];
  if (target === undefined) {
    return { ok: false, reason: `没有找到导出的 ${spec.typescript}` };
  }
  try {
    let got: unknown;
    if (spec.kind === 'class') {
      const obj = new target(...(decode(c.init ?? []) as unknown[]));
      got = (c.calls ?? []).map(([m, args]) => {
        const name = spec.methods?.[m] ?? m;
        if (typeof obj[name] !== 'function') throw new Error(`没有方法 ${name}`);
        return normalize(obj[name](...(decode(args) as unknown[])));
      });
    } else {
      if (typeof target !== 'function') return { ok: false, reason: `${spec.typescript} 不是函数` };
      if (c.raises) {
        try {
          const r = target(...(decode(c.args ?? []) as unknown[]));
          return { ok: false, got: normalize(r), reason: '应该抛出异常，却正常返回了' };
        } catch {
          return { ok: true };
        }
      }
      got = normalize(target(...(decode(c.args ?? []) as unknown[])));
    }
    const err = same(got, c.expected, tol);
    return err ? { ok: false, got, reason: err } : { ok: true, got };
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    return { ok: false, error: msg, reason: c.raises ? undefined : '运行时抛出了异常' };
  }
}

// 核心用例：题目里的样例；其余都算边界用例。
export function caseGroup(c: Case): 'core' | 'edge' {
  return (c.name ?? '').includes('样例') ? 'core' : 'edge';
}
