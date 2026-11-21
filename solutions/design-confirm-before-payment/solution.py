# 下单的状态机 + 幂等提交 + 结果未知时先查再重试。
# OrderApi 是假的下单服务，faults 依次决定每次 place 遇到什么。

# (当前状态, 事件) -> 下一个状态；表里没有的组合一律拒绝
TRANSITIONS = {
    ("draft", "preview"): "awaiting_confirm",
    ("awaiting_confirm", "edit"): "draft",
    ("awaiting_confirm", "confirm"): "confirmed",
    ("confirmed", "submit"): "submitting",
    ("confirmed", "give_up"): "failed",
    ("submitting", "ok"): "placed",
    ("submitting", "busy"): "confirmed",  # 服务端明确没执行
    ("submitting", "timeout"): "unknown",  # 不知道执行了没有
    ("submitting", "reject"): "rejected",
    ("unknown", "found"): "placed",
    ("unknown", "not_found"): "confirmed",
}


def advance(state: str, event: str) -> str:
    nxt = TRANSITIONS.get((state, event))
    if nxt is None:
        raise ValueError(f"illegal transition: {state} --{event}-->")
    return nxt


class Busy(Exception):
    """服务端返回 503：请求没有被执行，可以放心重试。"""


class Timeout(Exception):
    """等不到响应：服务端可能执行了，也可能没有。"""


class Rejected(Exception):
    """服务端明确拒绝（门店关了、金额变了），重试也没用。"""


class OrderApi:
    def __init__(self, faults: list[str]) -> None:
        self.faults = list(faults)
        # key -> (请求内容, 订单号)
        self.by_key: dict[str, tuple[dict, str]] = {}
        self.created = 0
        # 迟到、还没落地的请求
        self.late: tuple[str, dict] | None = None

    def land(self, key: str, payload: dict) -> str:
        if key in self.by_key:
            old_payload, order_id = self.by_key[key]
            if old_payload != payload:
                raise Rejected("key reused with another payload")
            return order_id  # 同一个 key 重复到达，返回原来的订单
        self.created += 1
        order_id = f"o{self.created}"
        self.by_key[key] = (payload, order_id)
        return order_id

    def place(self, key: str, payload: dict) -> str:
        if self.late:  # 上次超时的请求这时才到服务端
            self.land(*self.late)
            self.late = None
        fault = self.faults.pop(0) if self.faults else "ok"
        if fault == "busy":
            raise Busy()
        if fault == "reject":
            raise Rejected("store closed")
        if fault == "timeout":  # 请求丢在路上，服务端没收到
            raise Timeout()
        if fault == "late":  # 请求堵在路上，晚些才到
            self.late = (key, payload)
            raise Timeout()
        order_id = self.land(key, payload)
        if fault == "lost":  # 订单建好了，响应丢了
            raise Timeout()
        return order_id

    def lookup(self, key: str) -> str | None:
        hit = self.by_key.get(key)
        return hit[1] if hit else None


Result = tuple[str, str | None, list[str]]


def submit_order(api: OrderApi, key: str, payload: dict,
                 max_attempts: int) -> Result:
    if max_attempts < 1:
        raise ValueError("max_attempts must be >= 1")
    state, trace = "confirmed", []
    for _ in range(max_attempts):
        if state == "unknown":
            # 上次结果未知：先按 key 查，查到就不再提交
            order_id = api.lookup(key)
            found = order_id is not None
            trace.append("lookup:found" if found else "lookup:none")
            state = advance(state, "found" if found else "not_found")
            if state == "placed":
                return state, order_id, trace
        state = advance(state, "submit")
        try:
            # 每次重试都用同一个 key
            order_id = api.place(key, payload)
        except Busy:
            trace.append("place:busy")
            state = advance(state, "busy")
        except Timeout:
            trace.append("place:timeout")
            state = advance(state, "timeout")
        except Rejected:
            trace.append("place:rejected")
            return advance(state, "reject"), None, trace
        else:
            trace.append("place:ok")
            return advance(state, "ok"), order_id, trace
    if state == "unknown":
        # 次数用完前最后查一次；仍查不到就保持 unknown，交给对账
        order_id = api.lookup(key)
        trace.append("lookup:found" if order_id else "lookup:none")
        if order_id:
            return advance(state, "found"), order_id, trace
        return state, None, trace
    return advance(state, "give_up"), None, trace


def submit_naively(api: OrderApi, key: str, payload: dict,
                   max_attempts: int) -> Result:
    """错误示范：超时就换新 key 重发，也不先查。"""
    trace: list[str] = []
    for attempt in range(max_attempts):
        try:
            order_id = api.place(f"{key}#{attempt}", payload)
        except (Busy, Timeout):
            trace.append("place:timeout")
            continue
        except Rejected:
            trace.append("place:rejected")
            return "rejected", None, trace
        trace.append("place:ok")
        return "placed", order_id, trace
    return "unknown", None, trace


def run_checkout(faults: list[str], max_attempts: int,
                 careful: bool) -> dict:
    api = OrderApi(faults)
    payload = {"cart_id": "c_7f3a", "amount_cents": 5700}
    submit = submit_order if careful else submit_naively
    state, order_id, trace = submit(api, "ck_9e2b", payload,
                                    max_attempts)
    if api.late:  # 测试结束时，迟到的请求最终也会落地
        api.land(*api.late)
    return {"state": state, "order_id": order_id,
            "orders_created": api.created, "trace": trace}
