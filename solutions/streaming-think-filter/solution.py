class ThinkFilter:
    START = "<think>"
    END = "</think>"

    def __init__(self) -> None:
        self.inside = False  # 当前是否在 <think> 里面
        self.buf = ""        # 上次留下、还没决定怎么处理的文本

    def feed(self, chunk: str) -> str:
        buf = self.buf + chunk
        out: list[str] = []
        pos = 0  # buf[:pos] 已经处理完
        while True:
            # 外面找开始标签，里面找结束标签
            tag = self.END if self.inside else self.START
            i = buf.find(tag, pos)
            if i < 0:
                break
            if not self.inside:
                out.append(buf[pos:i])
            pos = i + len(tag)
            self.inside = not self.inside
        # 末尾可能是 tag 的前半截：留下与 tag 开头重合的最长部分
        keep = 0
        for size in range(min(len(tag) - 1, len(buf) - pos), 0, -1):
            if buf.endswith(tag[:size]):
                keep = size
                break
        cut = len(buf) - keep
        if not self.inside:
            out.append(buf[pos:cut])
        self.buf = buf[cut:]
        return "".join(out)

    def close(self) -> str:
        # 外面留着的是普通文本（例如结尾的 "<t"），里面的直接丢掉
        rest = "" if self.inside else self.buf
        self.buf = ""
        return rest
