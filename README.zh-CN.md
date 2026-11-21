# Agent 算法手写练习

[English](./README.md)

写给 Agent 开发者的算法练习。每页一个具体问题，配一份完整解法：用样例里的数字一步步推导，关键过程配图或分步动画，代码同时提供 **Python** 和 **TypeScript** 两个版本。

**在线阅读：** https://qiansc.github.io/agent-algorithms/

## 内容

- **57 道题**，分七组：检索与排序、上下文与记忆、工具调用与规划、Agent 工程、模型推理、训练与评测、经典算法。
- **5 篇设计练习**，以外卖点餐助手为例：从一句话到工具调用计划、下单确认与幂等支付、异常降级、会话状态与长期偏好、评测方法。

每道题的页面结构相同：题目、样例、思路、代码（Python / TypeScript 切换）、复杂度、自测用的易错输入，以及一个带答案的延伸问题。

## 本地运行

需要 Node.js 22.18 以上（直接运行 `.ts` 文件）和 Python 3.10 以上。

```sh
npm install
npm test         # 用同一组样例测试全部 Python 和 TypeScript 解法
npm run dev      # 本地预览：http://localhost:4321/agent-algorithms/
npm run build    # 先跑测试，再生成静态站点到 dist/
```

## 目录

```text
solutions/<题目>/         solution.py、solution.ts，以及两种语言共用的 cases.json
src/content/docs/         页面（MDX）
src/components/viz/       图示与动画组件
src/data/problems.ts      题目清单、编号和分组
tests/                    Python 与 TypeScript 的测试脚本
```

页面上显示的代码直接读取 `solutions/` 里的文件，和测试运行的是同一份。

## 许可证

[MIT](./LICENSE)
