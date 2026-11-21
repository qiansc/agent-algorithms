# 计划执行器：按依赖关系并发执行一份工具调用计划。
# 用模拟时钟写，方便测试；接真实工具时把 ms 换成 await 工具调用。

# 不可逆的工具不许出现在自动执行的计划里
IRREVERSIBLE = {"place_order", "pay"}


def validate_plan(steps: list[dict]) -> None:
    ids = [s["id"] for s in steps]
    if len(set(ids)) != len(ids):
        raise ValueError("duplicate step id")
    known = set(ids)
    for s in steps:
        if s["tool"] in IRREVERSIBLE:
            raise ValueError(
                f"{s['id']}: {s['tool']} needs confirmation")
        for dep in s["after"]:
            if dep not in known:
                raise ValueError(
                    f"{s['id']}: unknown dependency {dep}")
    # 用 Kahn 算法查环：能排完说明没有环
    indeg = {s["id"]: len(s["after"]) for s in steps}
    children: dict[str, list[str]] = {i: [] for i in ids}
    for s in steps:
        for dep in s["after"]:
            children[dep].append(s["id"])
    queue = [i for i in ids if indeg[i] == 0]
    seen = 0
    while queue:
        cur = queue.pop()
        seen += 1
        for nxt in children[cur]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                queue.append(nxt)
    if seen != len(ids):
        raise ValueError("plan has a cycle")


def execute_plan(steps: list[dict], max_parallel: int) -> dict:
    """steps 按计划顺序排列，每步有 id、tool、after、ms、ok。"""
    if max_parallel < 1:
        raise ValueError("max_parallel must be >= 1")
    validate_plan(steps)
    by_id = {s["id"]: s for s in steps}
    status = {s["id"]: "pending" for s in steps}
    start: dict[str, int] = {}
    end: dict[str, int] = {}
    running: list[tuple[int, str]] = []  # (结束时间, id)
    now = 0

    while True:
        # 上游失败或被跳过的步骤直接跳过，不再调用
        changed = True
        while changed:
            changed = False
            for s in steps:
                bad = any(status[d] in ("failed", "skipped")
                          for d in s["after"])
                if status[s["id"]] == "pending" and bad:
                    status[s["id"]] = "skipped"
                    changed = True
        # 空出来的并发位按计划顺序分给已就绪的步骤
        for s in steps:
            if len(running) >= max_parallel:
                break
            ready = all(status[d] == "done" for d in s["after"])
            if status[s["id"]] == "pending" and ready:
                status[s["id"]] = "running"
                start[s["id"]] = now
                running.append((now + s["ms"], s["id"]))
        if not running:
            break
        # 时钟拨到最早结束的时刻，同一时刻结束的步骤一起收尾
        now = min(t for t, _ in running)
        for t, sid in running:
            if t == now:
                end[sid] = t
                status[sid] = "done" if by_id[sid]["ok"] else "failed"
        running = [r for r in running if r[0] != now]

    total = max(end.values(), default=0)
    return {"status": status, "start": start, "end": end,
            "total": total}
