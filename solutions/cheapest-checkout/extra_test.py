import sys

sys.modules.pop("followup", None)  # 多道题在同一进程里测试时，别拿到上一题的 followup
from followup import cheapest_checkout_stacked
from solution import cheapest_checkout

PRICES = [3, 4, 6, 11]
TIERS = [(30, 8), (50, 20)]


def test_followup_stacked_coupon():
    # 样例 1 加上平台券后答案不变：店铺减完是 30 元，够不到 40
    assert cheapest_checkout_stacked(40, PRICES, TIERS, (40, 5)) == (30, [1, 2])
    # 必点 57：原题已过最高档，什么都不加付 37；有券时加 3 元凑到 60，付 35
    assert cheapest_checkout(57, PRICES, TIERS) == (37, [])
    assert cheapest_checkout_stacked(57, PRICES, TIERS, (40, 5)) == (35, [0])
    # 没有店铺满减时，只剩平台券一个门槛
    assert cheapest_checkout_stacked(36, [3, 5], [], (40, 5)) == (36, [])
    assert cheapest_checkout_stacked(36, [4, 5], [], (40, 5)) == (35, [0])
