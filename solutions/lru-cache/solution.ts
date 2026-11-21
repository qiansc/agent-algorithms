class Node {
  key: string;
  value: number;
  prev: Node | null = null;
  next: Node | null = null;

  constructor(key = '', value = 0) {
    this.key = key;
    this.value = value;
  }
}

export class LRUCache {
  private capacity: number;
  private nodes = new Map<string, Node>(); // 键 -> 链表里的节点
  // 两个哨兵：head 后面是最久没用的，tail 前面是刚用过的
  private head = new Node();
  private tail = new Node();

  constructor(capacity: number) {
    if (capacity < 0) throw new RangeError('capacity must be >= 0');
    this.capacity = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private unlink(node: Node): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private pushBack(node: Node): void {
    const last = this.tail.prev!;
    last.next = node;
    this.tail.prev = node;
    node.prev = last;
    node.next = this.tail;
  }

  get(key: string): number | null {
    const node = this.nodes.get(key);
    if (node === undefined) return null;
    this.unlink(node); // 读一次也算使用，挪到最新的一端
    this.pushBack(node);
    return node.value;
  }

  put(key: string, value: number): void {
    let node = this.nodes.get(key);
    if (node === undefined) {
      node = new Node(key, value);
      this.nodes.set(key, node);
    } else {
      this.unlink(node); // 覆盖旧键：键数不变，不会挤掉别人
      node.value = value;
    }
    this.pushBack(node);
    if (this.nodes.size > this.capacity) {
      const oldest = this.head.next!;
      this.unlink(oldest);
      this.nodes.delete(oldest.key);
    }
  }
}
