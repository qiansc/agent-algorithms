// 题目页的在线编辑器：写 TypeScript，运行全部测试，分“核心用例”和“边界用例”显示结果。
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

interface CaseView {
  name: string;
  group: 'core' | 'edge';
  ok: boolean;
  input: unknown;
  expected: unknown;
  got?: unknown;
  error?: string;
  reason?: string;
  ms: number;
}

type Outcome =
  | { type: 'syntax'; message: string; line: number | null; column: number | null }
  | { type: 'runtime'; message: string; line: number | null; logs: string[] }
  | { type: 'missing'; name: string; logs: string[] }
  | { type: 'timeout' }
  | { type: 'done'; results: CaseView[]; logs: string[] };

const TIME_LIMIT_MS = 5000;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--pg-bg)', color: 'var(--sl-color-gray-1)', fontSize: '0.86rem' },
  '.cm-content': { fontFamily: 'var(--sl-font-mono)', padding: '0.6rem 0' },
  '.cm-gutters': {
    backgroundColor: 'var(--pg-bg)',
    color: 'var(--sl-color-gray-4)',
    border: 'none',
    borderRight: '1px solid var(--sl-color-gray-5)',
  },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--pg-active)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--sl-color-accent)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--pg-selection) !important',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--sl-font-mono)', lineHeight: '1.6' },
  '.cm-tooltip': { backgroundColor: 'var(--sl-color-black)', border: '1px solid var(--sl-color-gray-5)' },
});

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.controlKeyword, t.operatorKeyword], color: 'var(--pg-kw)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--pg-str)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--pg-num)' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--pg-comment)', fontStyle: 'italic' },
  { tag: [t.typeName, t.className, t.namespace], color: 'var(--pg-type)' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--pg-fn)' },
  { tag: [t.definition(t.variableName)], color: 'var(--sl-color-white)' },
]);

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function show(v: unknown, limit = 400): string {
  let s: string;
  try {
    s = typeof v === 'string' ? v : JSON.stringify(v);
  } catch {
    s = String(v);
  }
  if (s === undefined) s = 'undefined';
  return s.length > limit ? `${s.slice(0, limit)} …（共 ${s.length} 个字符）` : s;
}

// 把判题给出的差异说明换成中文；最外层的值不同时不用再说一遍。
function explain(reason?: string): string | null {
  if (!reason) return null;
  let m = reason.match(/^(\S+): got (.*), want (.*)$/s);
  if (m) return m[1] === '$' ? null : `${m[1]} 处得到 ${m[2]}，应为 ${m[3]}`;
  m = reason.match(/^(\S+): length (\d+) != (\d+)/);
  if (m) return `${m[1] === '$' ? '结果' : m[1]} 的长度是 ${m[2]}，应为 ${m[3]}`;
  m = reason.match(/^(\S+): keys (.*) != (.*)$/);
  if (m) return `${m[1] === '$' ? '结果' : m[1]} 的键是 [${m[2]}]，应为 [${m[3]}]`;
  return reason;
}

function detailRow(label: string, value: string, cls = '') {
  const row = el('div', `pg-detail-row ${cls}`);
  row.append(el('span', 'pg-detail-label', label), el('code', 'pg-detail-value', value));
  return row;
}

export async function mount(root: HTMLElement) {
  const slug = root.dataset.playground!;
  const data = await fetch(`${base}/playground/${slug}.json`).then((r) => r.json());
  const storageKey = `agent-algorithms:code:${slug}`;
  root.replaceChildren();

  const bar = el('div', 'pg-bar');
  const label = el('span', 'pg-lang', 'TypeScript');
  const hint = el('span', 'pg-hint', '⌘/Ctrl + Enter 运行');
  const reset = el('button', 'pg-btn', '重置');
  const answerBtn = el('button', 'pg-btn', '答案');
  answerBtn.type = 'button';
  const run = el('button', 'pg-btn pg-run', '运行测试');
  reset.type = 'button';
  run.type = 'button';
  bar.append(label, hint, answerBtn, reset, run);

  const editorBox = el('div', 'pg-editor');
  const output = el('div', 'pg-output');
  output.hidden = true;
  root.append(bar, editorBox, output);

  let saveTimer: number | undefined;
  const view = new EditorView({
    parent: editorBox,
    state: EditorState.create({
      doc: localStorage.getItem(storageKey) ?? data.starter,
      extensions: [
        basicSetup,
        javascript({ typescript: true }),
        theme,
        syntaxHighlighting(highlight),
        EditorState.tabSize.of(2),
        keymap.of([indentWithTab, { key: 'Mod-Enter', run: () => (execute(), true) }]),
        EditorView.updateListener.of((u) => {
          if (!u.docChanged) return;
          window.clearTimeout(saveTimer);
          saveTimer = window.setTimeout(() => localStorage.setItem(storageKey, view.state.doc.toString()), 400);
        }),
      ],
    }),
  });

  const saveNow = () => {
    window.clearTimeout(saveTimer);
    localStorage.setItem(storageKey, view.state.doc.toString());
  };
  window.addEventListener('pagehide', saveNow);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && saveNow());

  reset.addEventListener('click', () => {
    if (!window.confirm('恢复成初始代码？你写的内容会被清掉。')) return;
    localStorage.removeItem(storageKey);
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: data.starter } });
    output.hidden = true;
  });
  run.addEventListener('click', () => execute());
  answerBtn.addEventListener('click', () => {
    const current = view.state.doc.toString();
    const untouched = current === data.starter || current === data.answer;
    if (!untouched && !window.confirm('用参考答案替换编辑器里的代码？你写的内容会被覆盖。')) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: data.answer } });
    output.hidden = true;
  });

  function goToLine(line: number | null, column: number | null = 1) {
    if (!line || line < 1 || line > view.state.doc.lines) return;
    const l = view.state.doc.line(line);
    const pos = Math.min(l.from + Math.max((column ?? 1) - 1, 0), l.to);
    view.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
    view.focus();
  }

  function render(o: Outcome) {
    output.hidden = false;
    output.replaceChildren();
    const logs = 'logs' in o ? o.logs : [];
    if (o.type === 'syntax') {
      const box = el('div', 'pg-banner pg-fail');
      box.append(el('strong', '', '语法错误'), el('span', '', o.message));
      if (o.line) {
        const at = el('button', 'pg-link', `第 ${o.line} 行，第 ${o.column} 列`);
        at.type = 'button';
        at.addEventListener('click', () => goToLine(o.line, o.column));
        box.append(at);
      }
      output.append(box);
      goToLine(o.line, o.column);
    } else if (o.type === 'runtime') {
      const box = el('div', 'pg-banner pg-fail');
      box.append(el('strong', '', '代码加载时出错'), el('span', '', o.message));
      if (o.line) box.append(el('span', 'pg-muted', `第 ${o.line} 行附近`));
      output.append(box);
    } else if (o.type === 'missing') {
      const box = el('div', 'pg-banner pg-fail');
      box.append(el('strong', '', `没有找到 ${o.name}`), el('span', '', '请保留题目给出的函数名或类名。'));
      output.append(box);
    } else if (o.type === 'timeout') {
      const box = el('div', 'pg-banner pg-fail');
      box.append(
        el('strong', '', '超时'),
        el('span', '', `${TIME_LIMIT_MS / 1000} 秒内没有跑完，可能有死循环，或者复杂度太高。`),
      );
      output.append(box);
    } else {
      const groups = [
        { id: 'core', title: '核心用例', items: o.results.filter((r) => r.group === 'core') },
        { id: 'edge', title: '边界用例', items: o.results.filter((r) => r.group === 'edge') },
      ];
      const allOk = o.results.every((r) => r.ok);
      const banner = el('div', `pg-banner ${allOk ? 'pg-pass' : 'pg-fail'}`);
      banner.append(el('strong', '', allOk ? '全部通过' : '还有用例没通过'));
      for (const g of groups) {
        const passed = g.items.filter((r) => r.ok).length;
        banner.append(el('span', passed === g.items.length ? 'pg-count ok' : 'pg-count', `${g.title} ${passed}/${g.items.length}`));
      }
      output.append(banner);

      for (const g of groups) {
        if (!g.items.length) continue;
        const section = el('details', 'pg-group');
        section.open = g.items.some((r) => !r.ok) || g.id === 'core';
        const summary = el('summary');
        const passed = g.items.filter((r) => r.ok).length;
        summary.append(el('span', '', g.title), el('span', 'pg-muted', `${passed}/${g.items.length} 通过`));
        section.append(summary);
        const list = el('ul', 'pg-cases');
        let firstFailure = true;
        for (const r of g.items) {
          const li = el('li', r.ok ? 'ok' : 'bad');
          const head = el(r.ok ? 'div' : 'summary', 'pg-case-head');
          head.append(
            el('span', 'pg-mark', r.ok ? '✓' : '✗'),
            el('span', 'pg-case-name', r.name),
            el('span', 'pg-muted', `${r.ms < 1 ? '<1' : Math.round(r.ms)} ms`),
          );
          if (r.ok) {
            li.append(head);
          } else {
            // 失败的用例可以展开看细节；每组只默认展开第一条
            const box = el('details');
            box.open = firstFailure;
            firstFailure = false;
            const d = el('div', 'pg-detail');
            d.append(detailRow('输入', show(r.input)));
            d.append(detailRow('期望', show(r.expected)));
            if (r.error) d.append(detailRow('异常', r.error, 'bad'));
            else d.append(detailRow('你的输出', show(r.got), 'bad'));
            const why = r.error ? null : explain(r.reason);
            if (why) d.append(detailRow('差在', why));
            box.append(head, d);
            li.append(box);
          }
          list.append(li);
        }
        section.append(list);
        output.append(section);
      }
    }
    if (logs.length) {
      const box = el('details', 'pg-group pg-console');
      box.open = true;
      box.append(el('summary', '', '控制台输出'), el('pre', '', logs.join('\n')));
      output.append(box);
    }
  }

  let worker: Worker | undefined;
  function execute() {
    saveNow();
    worker?.terminate();
    run.disabled = true;
    run.textContent = '运行中…';
    const w = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' });
    worker = w;
    const finish = (o: Outcome) => {
      window.clearTimeout(timer);
      w.terminate();
      if (worker === w) worker = undefined;
      run.disabled = false;
      run.textContent = '运行测试';
      render(o);
    };
    const timer = window.setTimeout(() => finish({ type: 'timeout' }), TIME_LIMIT_MS);
    w.onmessage = (e: MessageEvent<Outcome>) => finish(e.data);
    w.onerror = (e) => finish({ type: 'runtime', message: e.message || '运行环境出错', line: null, logs: [] });
    w.postMessage({
      code: view.state.doc.toString(),
      spec: { kind: data.kind, typescript: data.typescript, methods: data.methods, tol: data.tol, cases: data.cases },
    });
  }
}
