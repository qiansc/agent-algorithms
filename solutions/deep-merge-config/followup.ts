import type { Json, JsonObject } from './solution.ts';

function isPlainObject(v: unknown): v is JsonObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// 整体换进来的子树里也可能写了 null，同样当作删除
function stripNull(value: Json): Json {
  if (!isPlainObject(value)) return structuredClone(value);
  const kept = Object.entries(value).filter(([, v]) => v !== null);
  return Object.fromEntries(kept.map(([k, v]) => [k, stripNull(v)]));
}

// override 里写 null 表示删除这个键
export function deepMergeWithDelete(
  base: JsonObject,
  override: JsonObject,
): JsonObject {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    throw new TypeError('base 和 override 都必须是普通对象');
  }
  const result = new Map<string, Json>();
  for (const [key, old] of Object.entries(base)) {
    if (!Object.hasOwn(override, key)) {
      result.set(key, structuredClone(old));
    } else if (override[key] === null) {
      continue; // 删除：不放进结果
    } else if (isPlainObject(old) && isPlainObject(override[key])) {
      result.set(key, deepMergeWithDelete(old, override[key]));
    } else {
      result.set(key, stripNull(override[key]));
    }
  }
  for (const [key, value] of Object.entries(override)) {
    // base 里本来没有的键写 null，删除等于什么都不做
    if (!Object.hasOwn(base, key) && value !== null) {
      result.set(key, stripNull(value));
    }
  }
  return Object.fromEntries(result);
}
