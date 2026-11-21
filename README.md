# Agent Algorithms

[简体中文](./README.zh-CN.md)

Hands-on algorithm exercises for people building AI agents. Each page is one concrete problem with a complete solution: a worked example, diagrams and step-by-step animations, and code in both **Python** and **TypeScript**.

**Read it online:** https://qiansc.github.io/agent-algorithms/

The site is in Chinese for now. An English edition is planned.

## What's inside

- **57 problems** in seven groups: retrieval and ranking, context and memory, tool calling and planning, agent engineering, model inference, training and evaluation, and classic algorithms.
- **5 design exercises** built around a food-delivery ordering assistant: turning a request into a tool plan, confirmation and idempotent payment, fallbacks, memory, and evaluation.

Every problem page follows the same structure: problem statement, examples, a walkthrough using the example's own numbers, code with a Python/TypeScript switch, complexity, inputs that commonly break solutions, and a follow-up question with its answer.

## Run locally

Requires Node.js 22.18+ (runs `.ts` files directly) and Python 3.10+.

```sh
npm install
npm test         # run every Python and TypeScript solution against shared test cases
npm run dev      # preview the site at http://localhost:4321/agent-algorithms/
npm run build    # tests, then a static build in dist/
```

## Repository layout

```text
solutions/<problem>/      solution.py, solution.ts and cases.json shared by both test runners
src/content/docs/         the pages (MDX)
src/components/viz/       diagram and animation components
src/data/problems.ts      problem list, numbering and groups
tests/                    the Python and TypeScript test runners
```

The code shown on each page is read straight from `solutions/`, so what you see is exactly what the tests run.

## License

[MIT](./LICENSE)
