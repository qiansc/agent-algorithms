// 给侧边栏里的每道题挂上难度标签。难度只在 src/data/problems.ts 里维护一处。
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { problems, type Difficulty } from './data/problems';

const levelClass: Record<Difficulty, string> = {
  简单: 'difficulty difficulty-easy',
  中等: 'difficulty difficulty-medium',
  困难: 'difficulty difficulty-hard',
};
const bySlug = new Map(problems.map((p) => [p.slug, p]));

type Entry = { type: 'link' | 'group'; href?: string; entries?: Entry[]; badge?: unknown };

function tag(entries: Entry[]) {
  for (const entry of entries) {
    if (entry.type === 'group') {
      tag(entry.entries ?? []);
      continue;
    }
    const slug = entry.href?.match(/\/problems\/[^/]+\/([^/]+)\/?$/)?.[1];
    const p = slug ? bySlug.get(slug) : undefined;
    if (p) entry.badge = { text: p.difficulty, variant: 'default', class: levelClass[p.difficulty] };
  }
}

export const onRequest = defineRouteMiddleware((context) => {
  tag(context.locals.starlightRoute.sidebar as Entry[]);
});
