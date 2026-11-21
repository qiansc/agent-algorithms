import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cheapestCheckoutStacked } from './followup.ts';
import { cheapestCheckout } from './solution.ts';

const PRICES = [3, 4, 6, 11];
const TIERS: [number, number][] = [[30, 8], [50, 20]];

test('cheapest-checkout · 延伸：叠加平台券', () => {
  // 样例 1 加上平台券后答案不变：店铺减完是 30 元，够不到 40
  assert.deepEqual(cheapestCheckoutStacked(40, PRICES, TIERS, [40, 5]), [30, [1, 2]]);
  // 必点 57：原题已过最高档，什么都不加付 37；有券时加 3 元凑到 60，付 35
  assert.deepEqual(cheapestCheckout(57, PRICES, TIERS), [37, []]);
  assert.deepEqual(cheapestCheckoutStacked(57, PRICES, TIERS, [40, 5]), [35, [0]]);
  // 没有店铺满减时，只剩平台券一个门槛
  assert.deepEqual(cheapestCheckoutStacked(36, [3, 5], [], [40, 5]), [36, []]);
  assert.deepEqual(cheapestCheckoutStacked(36, [4, 5], [], [40, 5]), [35, [0]]);
});
