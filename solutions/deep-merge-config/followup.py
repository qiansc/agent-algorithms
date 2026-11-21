import copy
from typing import Any

Config = dict[str, Any]


def deep_merge_with_delete(base: Config, override: Config) -> Config:
    """override 里写 None（JSON 的 null）表示删除这个键。"""
    if not isinstance(base, dict) or not isinstance(override, dict):
        raise TypeError("base 和 override 都必须是 dict")
    result: Config = {}
    for key, old in base.items():
        if key not in override:
            result[key] = copy.deepcopy(old)
        elif override[key] is None:
            continue  # 删除：不放进结果
        elif isinstance(old, dict) and isinstance(override[key], dict):
            result[key] = deep_merge_with_delete(old, override[key])
        else:
            result[key] = _strip_none(override[key])
    for key, value in override.items():
        # base 里本来没有的键写 None，删除等于什么都不做
        if key not in base and value is not None:
            result[key] = _strip_none(value)
    return result


def _strip_none(value: Any) -> Any:
    # 整体换进来的子树里也可能写了 None，同样当作删除
    if isinstance(value, dict):
        return {
            k: _strip_none(v) for k, v in value.items() if v is not None
        }
    return copy.deepcopy(value)
