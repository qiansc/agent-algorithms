// 下单的状态机 + 幂等提交 + 结果未知时先查再重试。
// OrderApi 是假的下单服务，faults 依次决定每次 place 遇到什么。

// "当前状态 事件" -> 下一个状态；表里没有的组合一律拒绝
const TRANSITIONS: Record<string, string> = {
  'draft preview': 'awaiting_confirm',
  'awaiting_confirm edit': 'draft',
  'awaiting_confirm confirm': 'confirmed',
  'confirmed submit': 'submitting',
  'confirmed give_up': 'failed',
  'submitting ok': 'placed',
  'submitting busy': 'confirmed', // 服务端明确没执行
  'submitting timeout': 'unknown', // 不知道执行了没有
  'submitting reject': 'rejected',
  'unknown found': 'placed',
  'unknown not_found': 'confirmed',
};

export function advance(state: string, event: string): string {
  const nxt = TRANSITIONS[`${state} ${event}`];
  if (nxt === undefined) {
    throw new Error(`illegal transition: ${state} --${event}-->`);
  }
  return nxt;
}

// 服务端返回 503：请求没有被执行，可以放心重试
export class Busy extends Error {}
// 等不到响应：服务端可能执行了，也可能没有
export class Timeout extends Error {}
// 服务端明确拒绝（门店关了、金额变了），重试也没用
export class Rejected extends Error {}

type Payload = Record<string, unknown>;
const samePayload = (a: Payload, b: Payload) =>
  JSON.stringify(a) === JSON.stringify(b);

export class OrderApi {
  faults: string[];
  // key -> [请求内容, 订单号]
  byKey = new Map<string, [Payload, string]>();
  created = 0;
  late: [string, Payload] | null = null; // 迟到、还没落地的请求

  constructor(faults: string[]) {
    this.faults = [...faults];
  }

  land(key: string, payload: Payload): string {
    const hit = this.byKey.get(key);
    if (hit) {
      if (!samePayload(hit[0], payload)) {
        throw new Rejected('key reused with another payload');
      }
      return hit[1]; // 同一个 key 重复到达，返回原来的订单
    }
    this.created += 1;
    const orderId = `o${this.created}`;
    this.byKey.set(key, [payload, orderId]);
    return orderId;
  }

  place(key: string, payload: Payload): string {
    if (this.late) { // 上次超时的请求这时才到服务端
      this.land(...this.late);
      this.late = null;
    }
    const fault = this.faults.shift() ?? 'ok';
    if (fault === 'busy') throw new Busy();
    if (fault === 'reject') throw new Rejected('store closed');
    if (fault === 'timeout') throw new Timeout(); // 请求丢在路上
    if (fault === 'late') { // 请求堵在路上，晚些才到
      this.late = [key, payload];
      throw new Timeout();
    }
    const orderId = this.land(key, payload);
    if (fault === 'lost') throw new Timeout(); // 订单建好了，响应丢了
    return orderId;
  }

  lookup(key: string): string | null {
    return this.byKey.get(key)?.[1] ?? null;
  }
}

type Result = [string, string | null, string[]];

export function submitOrder(
  api: OrderApi, key: string, payload: Payload, maxAttempts: number,
): Result {
  if (maxAttempts < 1) throw new Error('maxAttempts must be >= 1');
  let state = 'confirmed';
  const trace: string[] = [];
  for (let i = 0; i < maxAttempts; i++) {
    if (state === 'unknown') {
      // 上次结果未知：先按 key 查，查到就不再提交
      const found = api.lookup(key);
      trace.push(found ? 'lookup:found' : 'lookup:none');
      state = advance(state, found ? 'found' : 'not_found');
      if (state === 'placed') return [state, found, trace];
    }
    state = advance(state, 'submit');
    try {
      // 每次重试都用同一个 key
      const orderId = api.place(key, payload);
      trace.push('place:ok');
      return [advance(state, 'ok'), orderId, trace];
    } catch (e) {
      if (e instanceof Busy) {
        trace.push('place:busy');
        state = advance(state, 'busy');
      } else if (e instanceof Timeout) {
        trace.push('place:timeout');
        state = advance(state, 'timeout');
      } else if (e instanceof Rejected) {
        trace.push('place:rejected');
        return [advance(state, 'reject'), null, trace];
      } else {
        throw e;
      }
    }
  }
  if (state === 'unknown') {
    // 次数用完前最后查一次；仍查不到就保持 unknown，交给对账
    const found = api.lookup(key);
    trace.push(found ? 'lookup:found' : 'lookup:none');
    if (found) return [advance(state, 'found'), found, trace];
    return [state, null, trace];
  }
  return [advance(state, 'give_up'), null, trace];
}

// 错误示范：超时就换新 key 重发，也不先查
export function submitNaively(
  api: OrderApi, key: string, payload: Payload, maxAttempts: number,
): Result {
  const trace: string[] = [];
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const orderId = api.place(`${key}#${attempt}`, payload);
      trace.push('place:ok');
      return ['placed', orderId, trace];
    } catch (e) {
      if (e instanceof Rejected) {
        trace.push('place:rejected');
        return ['rejected', null, trace];
      }
      trace.push('place:timeout');
    }
  }
  return ['unknown', null, trace];
}

export function runCheckout(
  faults: string[], maxAttempts: number, careful: boolean,
) {
  const api = new OrderApi(faults);
  const payload = { cart_id: 'c_7f3a', amount_cents: 5700 };
  const submit = careful ? submitOrder : submitNaively;
  const [state, orderId, trace] =
    submit(api, 'ck_9e2b', payload, maxAttempts);
  if (api.late) api.land(...api.late); // 迟到的请求最终也会落地
  return {
    state, order_id: orderId, orders_created: api.created, trace,
  };
}
