export class TagFilter {
  start: string;
  end: string;
  keepInside: boolean; // true：只输出标签里面的内容
  inside = false;
  buf = '';

  constructor(start: string, end: string, keepInside: boolean) {
    if (!start || !end) throw new Error('标签不能为空');
    this.start = start;
    this.end = end;
    this.keepInside = keepInside;
  }

  // 当前状态下的文本要不要输出
  private emitting(): boolean {
    return this.inside === this.keepInside;
  }

  feed(chunk: string): string {
    const buf = this.buf + chunk;
    const out: string[] = [];
    let pos = 0;
    let tag: string;
    while (true) {
      tag = this.inside ? this.end : this.start;
      const i = buf.indexOf(tag, pos);
      if (i < 0) break;
      if (this.emitting()) out.push(buf.slice(pos, i));
      pos = i + tag.length;
      this.inside = !this.inside;
    }
    let keep = 0;
    const most = Math.min(tag.length - 1, buf.length - pos);
    for (let size = most; size > 0; size--) {
      if (buf.endsWith(tag.slice(0, size))) {
        keep = size;
        break;
      }
    }
    const cut = buf.length - keep;
    if (this.emitting()) out.push(buf.slice(pos, cut));
    this.buf = buf.slice(cut);
    return out.join('');
  }

  close(): string {
    const rest = this.emitting() ? this.buf : '';
    this.buf = '';
    return rest;
  }
}

export function thinkFilter(): TagFilter {
  return new TagFilter('<think>', '</think>', false);
}

export function toolCallFilter(): TagFilter {
  return new TagFilter('<tool_call>', '</tool_call>', true);
}
