export class ThinkFilter {
  static readonly START = '<think>';
  static readonly END = '</think>';
  inside = false; // 当前是否在 <think> 里面
  buf = ''; // 上次留下、还没决定怎么处理的文本

  feed(chunk: string): string {
    const buf = this.buf + chunk;
    const out: string[] = [];
    let pos = 0; // buf.slice(0, pos) 已经处理完
    let tag: string;
    while (true) {
      // 外面找开始标签，里面找结束标签
      tag = this.inside ? ThinkFilter.END : ThinkFilter.START;
      const i = buf.indexOf(tag, pos);
      if (i < 0) break;
      if (!this.inside) out.push(buf.slice(pos, i));
      pos = i + tag.length;
      this.inside = !this.inside;
    }
    // 末尾可能是 tag 的前半截：留下与 tag 开头重合的最长部分
    let keep = 0;
    const most = Math.min(tag.length - 1, buf.length - pos);
    for (let size = most; size > 0; size--) {
      if (buf.endsWith(tag.slice(0, size))) {
        keep = size;
        break;
      }
    }
    const cut = buf.length - keep;
    if (!this.inside) out.push(buf.slice(pos, cut));
    this.buf = buf.slice(cut);
    return out.join('');
  }

  close(): string {
    // 外面留着的是普通文本（例如结尾的 "<t"），里面的直接丢掉
    const rest = this.inside ? '' : this.buf;
    this.buf = '';
    return rest;
  }
}
