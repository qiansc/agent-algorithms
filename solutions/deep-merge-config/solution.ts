export type Json =
  | null | boolean | number | string | Json[] | JsonObject;
export type JsonObject = { [key: string]: Json };

// typeof null 和 typeof [] 都是 'object'，要单独排除
function isPlainObject(v: unknown): v is JsonObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function deepMerge(
  base: JsonObject,
  override: JsonObject,
): JsonObject {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    throw new TypeError('base 和 override 都必须是普通对象');
  }
  // 先用 Map 收集：直接写 result['__proto__'] = ... 会改掉原型
  const result = new Map<string, Json>();
  // 先按 base 的顺序处理 base 里的键
  for (const [key, old] of Object.entries(base)) {
    if (!Object.hasOwn(override, key)) {
      result.set(key, structuredClone(old)); // 只在 base 里：保留
    } else if (isPlainObject(old) && isPlainObject(override[key])) {
      // 两边都是对象：递归
      result.set(key, deepMerge(old, override[key]));
    } else {
      result.set(key, structuredClone(override[key])); // 其余：用新值
    }
  }
  // 再补上只在 override 里出现的键
  for (const [key, value] of Object.entries(override)) {
    if (!Object.hasOwn(base, key)) {
      result.set(key, structuredClone(value));
    }
  }
  return Object.fromEntries(result);
}
