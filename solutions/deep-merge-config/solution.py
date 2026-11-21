import copy
from typing import Any


Config = dict[str, Any]


def deep_merge(base: Config, override: Config) -> Config:
    if not isinstance(base, dict) or not isinstance(override, dict):
        raise TypeError("base 和 override 都必须是 dict")
    result: Config = {}
    # 先按 base 的顺序处理 base 里的键
    for key, old in base.items():
        if key not in override:
            result[key] = copy.deepcopy(old)  # 只在 base 里：保留
        elif isinstance(old, dict) and isinstance(override[key], dict):
            # 两边都是 dict：递归
            result[key] = deep_merge(old, override[key])
        else:
            result[key] = copy.deepcopy(override[key])  # 其余：用新值
    # 再补上只在 override 里出现的键
    for key, value in override.items():
        if key not in base:
            result[key] = copy.deepcopy(value)
    return result
