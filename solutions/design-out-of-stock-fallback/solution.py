# 缺货时挑替代品：先按硬约束过滤，再打分排序，
# 最后决定自动换还是问用户。

EXACT, SAME_CATEGORY, SAME_STORE = 5.0, 3.0, 2.0
PER_YUAN = 0.4  # 每多花 1 元扣的分


def choose_fallback(wanted: dict, candidates: list[dict],
                    avoid: list[str], max_extra_auto: float) -> dict:
    kept: list[tuple[float, float, str]] = []
    dropped: dict[str, str] = {}
    for c in candidates:
        # 硬约束：用户说出口的条件、忌口、送达时间，违反一条就淘汰
        if wanted.get("temp") and c["temp"] != wanted["temp"]:
            dropped[c["id"]] = "温度不符"
            continue
        bad = [t for t in c["tags"] if t in avoid]
        if bad:
            dropped[c["id"]] = "忌口：" + bad[0]
            continue
        if c["eta"] > wanted["max_eta"]:
            dropped[c["id"]] = f"送达 {c['eta']} 分钟"
            continue
        # 换另一家店要多付的配送费也算进差价；便宜了不加分
        extra = c["price"] + c["extra_fee"] - wanted["price"]
        if c["name"] == wanted["name"]:
            score = EXACT
        elif c["category"] == wanted["category"]:
            score = SAME_CATEGORY
        else:
            score = 0.0
        if c["store"] == wanted["store"]:
            score += SAME_STORE
        score -= PER_YUAN * max(0.0, extra)
        kept.append((round(score, 2), extra, c["id"]))

    # 分高的在前；同分时多花钱少的在前；再按 id 保证结果稳定
    kept.sort(key=lambda k: (-k[0], k[1], k[2]))
    ranked = [[cid, score] for score, _, cid in kept]
    if not kept:
        return {"action": "give_up", "options": [],
                "ranked": ranked, "dropped": dropped}
    best = next(c for c in candidates if c["id"] == kept[0][2])
    # 只有“同一家店的同一件商品，差价很小”才自动换，例如换杯型
    same_item = best["name"] == wanted["name"]
    same_store = best["store"] == wanted["store"]
    if same_item and same_store and kept[0][1] <= max_extra_auto:
        return {"action": "auto", "options": [best["id"]],
                "ranked": ranked, "dropped": dropped}
    return {"action": "ask", "options": [k[2] for k in kept[:2]],
            "ranked": ranked, "dropped": dropped}
