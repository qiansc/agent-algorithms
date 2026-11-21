import math
import random

from followup import implicit_reward, reward_model_loss
from solution import dpo_loss


def test_reward_model_loss_values():
    assert math.isclose(reward_model_loss(0.0, 0.0), math.log(2), rel_tol=1e-12)
    assert math.isclose(reward_model_loss(1.0, 0.0), 0.31326168751822286, rel_tol=1e-12)
    assert math.isclose(reward_model_loss(2.0, 3.0), 1.3132616875182228, rel_tol=1e-12)
    assert reward_model_loss(-800.0, 0.0) == 800.0


def test_dpo_equals_bt_on_implicit_rewards():
    # 样例 1：隐式奖励 1 和 0，代入 Bradley–Terry 得到同一个损失
    r_w = implicit_reward([-1, -1], [-1, -2], 1)
    r_l = implicit_reward([-2, -2], [-2, -2], 1)
    assert (r_w, r_l) == (1, 0)
    assert math.isclose(reward_model_loss(r_w, r_l), dpo_loss([-1, -1], [-2, -2], [-1, -2], [-2, -2], 1))
    rng = random.Random(7)
    for _ in range(200):
        pw = [rng.uniform(-5, 0) for _ in range(rng.randint(1, 6))]
        pl = [rng.uniform(-5, 0) for _ in range(rng.randint(1, 6))]
        rw = [rng.uniform(-5, 0) for _ in pw]
        rl = [rng.uniform(-5, 0) for _ in pl]
        beta = rng.uniform(0.05, 2)
        bt = reward_model_loss(implicit_reward(pw, rw, beta), implicit_reward(pl, rl, beta))
        assert math.isclose(bt, dpo_loss(pw, pl, rw, rl, beta), rel_tol=1e-9, abs_tol=1e-12)
