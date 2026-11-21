"""用 solutions/<slug>/cases.json 检查每道题的 Python 解法。

用法：python3 tests/run_python.py [slug ...]
"""
import importlib.util
import json
import math
import sys
import traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "solutions"


def decode(value):
    if value == "__inf__":
        return math.inf
    if value == "__-inf__":
        return -math.inf
    if isinstance(value, list):
        return [decode(v) for v in value]
    if isinstance(value, dict):
        return {k: decode(v) for k, v in value.items()}
    return value


def normalize(value):
    if isinstance(value, float) and math.isinf(value):
        return "__inf__" if value > 0 else "__-inf__"
    if isinstance(value, (list, tuple)):
        return [normalize(v) for v in value]
    if isinstance(value, (set, frozenset)):
        return sorted(normalize(v) for v in value)
    if isinstance(value, dict):
        return {str(k): normalize(v) for k, v in value.items()}
    return value


def same(got, want, tol, path="$"):
    if isinstance(want, bool) or isinstance(got, bool):
        if got is not want:
            return f"{path}: got {got!r}, want {want!r}"
        return None
    if isinstance(want, (int, float)) and isinstance(got, (int, float)):
        if abs(got - want) <= tol * max(1.0, abs(want)):
            return None
        return f"{path}: got {got!r}, want {want!r}"
    if isinstance(want, list) and isinstance(got, list):
        if len(got) != len(want):
            return f"{path}: length {len(got)} != {len(want)} (got {got!r})"
        for i, (g, w) in enumerate(zip(got, want)):
            err = same(g, w, tol, f"{path}[{i}]")
            if err:
                return err
        return None
    if isinstance(want, dict) and isinstance(got, dict):
        if set(got) != set(want):
            return f"{path}: keys {sorted(got)} != {sorted(want)}"
        for k in want:
            err = same(got[k], want[k], tol, f"{path}.{k}")
            if err:
                return err
        return None
    if got != want:
        return f"{path}: got {got!r}, want {want!r}"
    return None


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def run_case(module, spec, case):
    tol = case.get("tol", spec.get("tol", 1e-9))
    if spec.get("kind", "function") == "class":
        cls = getattr(module, spec["python"])
        obj = cls(*decode(case.get("init", [])))
        got = []
        for method, args in case["calls"]:
            got.append(normalize(getattr(obj, method)(*decode(args))))
    else:
        fn = getattr(module, spec["python"])
        args = decode(case["args"])
        if case.get("raises"):
            try:
                fn(*args)
            except Exception:  # noqa: BLE001 — 任何异常都算抛出
                return None
            return "expected an exception"
        got = normalize(fn(*args))
    return same(got, case["expected"], tol)


def main(selected):
    dirs = sorted(d for d in ROOT.iterdir() if d.is_dir())
    if selected:
        dirs = [d for d in dirs if d.name in selected]
    failures = 0
    total = 0
    for d in dirs:
        cases_file = d / "cases.json"
        if not cases_file.exists():
            continue
        spec = json.loads(cases_file.read_text(encoding="utf-8"))
        sys.path.insert(0, str(d))
        # 每题目录里的 solution / followup 等模块名相同，换题前清掉上一题的缓存
        for local in [p.stem for p in d.glob("*.py")]:
            sys.modules.pop(local, None)
        try:
            module = load(d / "solution.py", "solution")
            for i, case in enumerate(spec["cases"]):
                total += 1
                label = case.get("name", f"case {i}")
                try:
                    err = run_case(module, spec, case)
                except Exception:  # noqa: BLE001
                    err = traceback.format_exc(limit=3)
                if err:
                    failures += 1
                    print(f"FAIL {d.name} · {label}: {err}")
            extra = d / "extra_test.py"
            if extra.exists():
                extra_mod = load(extra, f"extra_{d.name.replace('-', '_')}")
                for name in sorted(n for n in dir(extra_mod) if n.startswith("test_")):
                    total += 1
                    try:
                        getattr(extra_mod, name)()
                    except Exception:  # noqa: BLE001
                        failures += 1
                        print(f"FAIL {d.name} · {name}: {traceback.format_exc(limit=3)}")
        finally:
            sys.path.remove(str(d))
    print(f"python: {total - failures}/{total} passed in {len(dirs)} problem(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main(set(sys.argv[1:])))
