class TagFilter:
    def __init__(self, start: str, end: str, keep_inside: bool) -> None:
        if not start or not end:
            raise ValueError("标签不能为空")
        self.start = start
        self.end = end
        self.keep_inside = keep_inside  # True：只输出标签里面的内容
        self.inside = False
        self.buf = ""

    def _emitting(self) -> bool:
        # 当前状态下的文本要不要输出
        return self.inside == self.keep_inside

    def feed(self, chunk: str) -> str:
        buf = self.buf + chunk
        out: list[str] = []
        pos = 0
        while True:
            tag = self.end if self.inside else self.start
            i = buf.find(tag, pos)
            if i < 0:
                break
            if self._emitting():
                out.append(buf[pos:i])
            pos = i + len(tag)
            self.inside = not self.inside
        keep = 0
        for size in range(min(len(tag) - 1, len(buf) - pos), 0, -1):
            if buf.endswith(tag[:size]):
                keep = size
                break
        cut = len(buf) - keep
        if self._emitting():
            out.append(buf[pos:cut])
        self.buf = buf[cut:]
        return "".join(out)

    def close(self) -> str:
        rest = self.buf if self._emitting() else ""
        self.buf = ""
        return rest


def think_filter() -> TagFilter:
    return TagFilter("<think>", "</think>", keep_inside=False)


def tool_call_filter() -> TagFilter:
    return TagFilter("<tool_call>", "</tool_call>", keep_inside=True)
