// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkSections from './src/plugins/remark-sections.mjs';
import { readFileSync } from 'node:fs';

const doneHeadScript = readFileSync(new URL('./src/scripts/done-head.js', import.meta.url), 'utf8');

const group = (label, directory) => ({ label, items: [{ autogenerate: { directory } }] });

export default defineConfig({
  site: 'https://qiansc.github.io',
  base: '/agent-algorithms',
  integrations: [
    starlight({
      title: 'Agent 算法手写练习',
      description: '面向 Agent 开发的算法练习：每页一个具体问题、一份完整解法，配图解和 Python / TypeScript 双版本代码。',
      defaultLocale: 'root',
      locales: { root: { label: '简体中文', lang: 'zh-CN' } },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/qiansc/agent-algorithms' }],
      customCss: ['./src/styles/theme.css', './src/styles/viz.css', './src/styles/playground.css'],
      routeMiddleware: './src/routeData.ts',
      components: { PageTitle: './src/components/PageTitle.astro' },
      head: [{ tag: 'script', content: doneHeadScript }],
      lastUpdated: false,
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 2 },
      expressiveCode: {
        themes: ['github-light', 'github-dark-dimmed'],
        styleOverrides: {
          borderRadius: '8px',
          codeFontSize: '0.83rem',
          codeLineHeight: '1.65',
          codePaddingInline: '1rem',
        },
      },
      sidebar: [
        { label: '开始', items: [{ label: '三天练习安排', link: '/' }] },
        group('检索与排序', 'problems/retrieval'),
        group('上下文与记忆', 'problems/context'),
        group('工具调用与规划', 'problems/planning'),
        group('Agent 工程', 'problems/engineering'),
        group('模型推理', 'problems/model'),
        group('训练与评测', 'problems/training'),
        group('经典算法', 'problems/classic'),
        group('Agent 设计练习', 'design'),
      ],
    }),
  ],
  markdown: { remarkPlugins: [remarkSections] },
  vite: {
    server: { fs: { allow: ['..'] } },
    // 在线编辑器的依赖是按需加载的；提前预构建，避免开发服务器中途重新打包导致页面请求 504
    optimizeDeps: {
      include: [
        'codemirror',
        '@codemirror/view',
        '@codemirror/state',
        '@codemirror/commands',
        '@codemirror/language',
        '@codemirror/lang-javascript',
        '@lezer/highlight',
        'sucrase',
      ],
    },
  },
});
