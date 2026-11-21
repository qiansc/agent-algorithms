class TrieNode {
  children = new Map<string, TrieNode>(); // 下一个字符 -> 子节点
  end = false; // 走到这里是否已经拼出一个完整的名字
}

export class ToolNames {
  root = new TrieNode();

  constructor(names: string[]) {
    for (const name of names) {
      if (!/^[a-z]+$/.test(name)) {
        throw new Error(`工具名须为非空小写字母串：${name}`);
      }
      let node = this.root;
      for (const c of name) {
        let next = node.children.get(c);
        if (!next) {
          next = new TrieNode();
          node.children.set(c, next);
        }
        node = next;
      }
      node.end = true; // 盖章；这个节点可能还有孩子
    }
  }

  walk(prefix: string): TrieNode | null {
    let node = this.root;
    for (const c of prefix) {
      const next = node.children.get(c);
      if (!next) return null;
      node = next;
    }
    return node;
  }

  allowed(prefix: string): [string[], boolean] {
    const node = this.walk(prefix);
    if (!node) return [[], false];
    return [[...node.children.keys()].sort(), node.end];
  }
}
