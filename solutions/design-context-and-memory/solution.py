# 长期偏好：用户明说的直接记；从行为里推断的要攒够证据，并且会过期。
# 时间用“第几天”的整数表示，方便测试。

INFER_AFTER = 3  # 同一个值连续出现 3 次才算偏好
WINDOW_DAYS = 30  # 只看最近 30 天的观察
INFERRED_TTL = 60  # 推断出的偏好，60 天没有新证据就失效


class PreferenceStore:
    def __init__(self) -> None:
        # key -> (值, 写入日, 有效天数；None 表示一直有效)
        self.explicit: dict[str, tuple[str, int, int | None]] = {}
        # key -> (值, 最近一次支持它的观察日)
        self.inferred: dict[str, tuple[str, int]] = {}
        self.history: dict[str, list[tuple[int, str]]] = {}

    def tell(self, key: str, value: str, day: int,
             ttl_days: int | None = None) -> None:
        """用户明确说的，例如“我乳糖不耐”“这周送到酒店”。"""
        if ttl_days is not None and ttl_days < 1:
            raise ValueError("ttl_days must be >= 1")
        self.explicit[key] = (value, day, ttl_days)

    def observe(self, key: str, value: str, day: int) -> bool:
        """从一笔订单里看到的选择。返回推断偏好现在是否就是这个值。"""
        seen = self.history.setdefault(key, [])
        seen.append((day, value))
        # 只留最近 30 天的观察
        seen[:] = [(d, v) for d, v in seen if day - d < WINDOW_DAYS]
        recent = [v for _, v in seen[-INFER_AFTER:]]
        if len(recent) == INFER_AFTER and len(set(recent)) == 1:
            self.inferred[key] = (value, day)
        elif key in self.inferred and self.inferred[key][0] != value:
            del self.inferred[key]  # 出现了相反的证据，推断作废
        return key in self.inferred and self.inferred[key][0] == value

    def _explicit_alive(self, key: str, day: int) -> str | None:
        if key not in self.explicit:
            return None
        value, since, ttl = self.explicit[key]
        if ttl is not None and day >= since + ttl:
            return None
        return value

    def _inferred_alive(self, key: str, day: int) -> str | None:
        if key not in self.inferred:
            return None
        value, last = self.inferred[key]
        return value if day - last <= INFERRED_TTL else None

    def get(self, key: str, day: int) -> str | None:
        # 明说的优先于推断的
        told = self._explicit_alive(key, day)
        if told is not None:
            return told
        return self._inferred_alive(key, day)

    def forget(self, key: str) -> bool:
        """用户说“忘掉”：明说的、推断的、观察记录一起删。"""
        removed = False
        for table in (self.explicit, self.inferred, self.history):
            if key in table:
                del table[key]
                removed = True
        return removed

    def visible(self, day: int) -> dict[str, list[str]]:
        """当前生效的偏好及来源，给“我的偏好”页面和提示词用。"""
        out: dict[str, list[str]] = {}
        for key in sorted(set(self.explicit) | set(self.inferred)):
            told = self._explicit_alive(key, day)
            if told is not None:
                out[key] = [told, "explicit"]
                continue
            guess = self._inferred_alive(key, day)
            if guess is not None:
                out[key] = [guess, "inferred"]
        return out
