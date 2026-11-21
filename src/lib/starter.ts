// 由参考解法生成在线编辑器的初始代码：
// 顶部是第一个样例的输入（写成变量），中间是空的函数或类，底部是调用和期望结果。
import { caseGroup, type Case, type Spec } from './judge.ts';

// 找到从 from 开始的第一个“行末的 {”，即函数体或类体的开头。
function bodyBrace(src: string, from: number): number {
  let depth = 0;
  for (let i = from; i < src.length; i++) {
    const ch = src[i];
    if (ch === '>' && src[i - 1] === '=') continue; // 箭头 => 不是括号
    if (ch === '(' || ch === '[' || ch === '<') depth++;
    else if (ch === ')' || ch === ']' || ch === '>') depth = Math.max(0, depth - 1);
    else if (ch === '{' && depth === 0) {
      const rest = src.slice(i + 1, src.indexOf('\n', i) === -1 ? undefined : src.indexOf('\n', i));
      if (rest.trim() === '') return i;
    }
  }
  return -1;
}

// 找到与 open 位置的 { 配对的 }。
function matchBrace(src: string, open: number): number {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return i;
  }
  return src.length - 1;
}

function splitTopLevel(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '>' && s[i - 1] === '=') {
      cur += ch;
      continue;
    }
    if ('([{<'.includes(ch)) depth++;
    if (')]}>'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

function paramNames(signature: string): string[] {
  const open = signature.indexOf('(');
  let depth = 0;
  let close = open;
  for (let i = open; i < signature.length; i++) {
    if (signature[i] === '(') depth++;
    if (signature[i] === ')' && --depth === 0) {
      close = i;
      break;
    }
  }
  return splitTopLevel(signature.slice(open + 1, close))
    .map((p) => p.trim().replace(/^\.\.\./, '').split(/[?:=\s]/)[0])
    .filter(Boolean);
}

// 把 JSON 值写成 TypeScript 字面量（无穷大写成 Infinity）。
function literal(v: unknown): string {
  if (v === '__inf__') return 'Infinity';
  if (v === '__-inf__') return '-Infinity';
  if (Array.isArray(v)) return `[${v.map(literal).join(', ')}]`;
  if (v && typeof v === 'object') {
    const body = Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${literal(x)}`);
    return `{ ${body.join(', ')} }`;
  }
  return JSON.stringify(v);
}

function caseTitle(c: Case | undefined): string {
  const name = c?.name ?? '';
  return name.startsWith('样例') ? `// ${name}` : `// 样例：${name}`;
}

function brief(v: unknown): string {
  const s = literal(v);
  return s.length > 80 ? `${s.slice(0, 77)}...` : s;
}

// 顶层的类型声明原样保留，方便看懂签名里的类型。
function typeDecls(src: string): string[] {
  const out: string[] = [];
  const re = /^(?:export\s+)?(type|interface)\s+\w+/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const start = m.index;
    let end: number;
    if (m[1] === 'interface') {
      end = matchBrace(src, src.indexOf('{', start)) + 1;
    } else {
      end = start;
      let depth = 0;
      for (; end < src.length; end++) {
        const ch = src[end];
        if (ch === '>' && src[end - 1] === '=') continue;
        if ('([{<'.includes(ch)) depth++;
        if (')]}>'.includes(ch)) depth--;
        if (ch === ';' && depth === 0) break;
      }
      end += 1;
    }
    out.push(src.slice(start, end).replace(/^export\s+/, ''));
    re.lastIndex = end;
  }
  return out;
}

function functionStub(src: string, name: string) {
  const start = src.search(new RegExp(`export\\s+function\\s+${name}\\b`));
  if (start < 0) throw new Error(`export function ${name} not found`);
  const brace = bodyBrace(src, src.indexOf('(', start));
  const signature = src.slice(start, brace).trimEnd();
  return { signature, stub: `${signature} {\n  // 在这里写你的解法\n}` };
}

function classStub(src: string, name: string) {
  const start = src.search(new RegExp(`export\\s+class\\s+${name}\\b`));
  if (start < 0) throw new Error(`export class ${name} not found`);
  const open = bodyBrace(src, start);
  const close = matchBrace(src, open);
  const body = src.slice(open + 1, close);
  const members: string[] = [];
  const voidMethods = new Set<string>();
  const re = /^ {2}(?:static\s+)?(?:get\s+|set\s+)?(constructor|[A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\(/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const brace = bodyBrace(body, body.indexOf('(', m.index));
    if (brace < 0) continue;
    const sig = body.slice(m.index, brace).trimEnd();
    if (/\)\s*:\s*void$/.test(sig)) voidMethods.add(m[1]);
    members.push(`${sig} {\n    // 在这里写\n  }`);
    re.lastIndex = matchBrace(body, brace) + 1;
  }
  const header = src.slice(start, open).trimEnd();
  return { code: `${header} {\n${members.join('\n\n')}\n}`, voidMethods };
}

// 整段保留某个导出函数（例如只为测试服务的包装函数）。
function keepFunction(src: string, name: string): string {
  const start = src.search(new RegExp(`export\\s+function\\s+${name}\\b`));
  if (start < 0) throw new Error(`export function ${name} not found`);
  const brace = bodyBrace(src, src.indexOf('(', start));
  return src.slice(start, matchBrace(src, brace) + 1);
}

export interface StarterOptions {
  stub?: string[];
  keep?: string[];
}

// mode = 'answer' 时，中间放完整的参考解法，样例部分保持不变。
export function buildStarter(
  solutionTs: string,
  spec: Spec & { starter?: StarterOptions },
  mode: 'starter' | 'answer' = 'starter',
): string {
  const answer = mode === 'answer';
  const first: Case | undefined = spec.cases.find((c) => caseGroup(c) === 'core') ?? spec.cases[0];
  const types = answer ? [] : typeDecls(solutionTs);
  const lines: string[] = [];
  if (spec.kind === 'class') {
    const { code, voidMethods } = classStub(solutionTs, spec.typescript);
    lines.push(answer ? solutionTs.trimEnd() : code);
    if (first) {
      lines.push('', caseTitle(first));
      lines.push(`const obj = new ${spec.typescript}(${(first.init ?? []).map(literal).join(', ')});`);
      const calls = first.calls ?? [];
      calls.slice(0, 10).forEach(([m, args], i) => {
        const method = spec.methods?.[m] ?? m;
        const want = Array.isArray(first.expected) ? first.expected[i] : undefined;
        const call = `obj.${method}(${args.map(literal).join(', ')})`;
        lines.push(
          voidMethods.has(method) ? `${call};` : `console.log(${call}); // 期望 ${brief(want)}`,
        );
      });
    }
    return [...types, ...(types.length ? [''] : []), ...lines].join('\n') + '\n';
  }
  const { signature, stub: mainStub } = functionStub(solutionTs, spec.typescript);
  const names = paramNames(signature);
  const opts = spec.starter;
  const stub = opts
    ? [
        ...(opts.stub ?? []).map((n) => functionStub(solutionTs, n).stub),
        ...(opts.keep ?? []).map((n) => `// 测试用的包装函数，保留即可\n${keepFunction(solutionTs, n)}`),
      ].join('\n\n')
    : mainStub;
  const args = first?.args ?? [];
  const vars = args.map((a, i) => `const ${names[i] ?? `arg${i}`} = ${literal(a)};`);
  const want = first?.raises ? '抛出异常' : brief(first?.expected);
  return [
    caseTitle(first),
    ...vars,
    '',
    ...types,
    ...(types.length ? [''] : []),
    answer ? solutionTs.trimEnd() : stub,
    '',
    `console.log(${spec.typescript}(${args.map((_, i) => names[i] ?? `arg${i}`).join(', ')})); // 期望 ${want}`,
    '',
  ].join('\n');
}
