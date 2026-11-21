from followup import NucleusSampler
from solution import nucleus_draw


def test_sampler_matches_single_draw():
    probs = [0.125, 0.5, 0.25, 0.125]
    for p in (0.3, 0.7, 0.75, 1.0):
        sampler = NucleusSampler(probs, p)
        for k in range(100):
            u = k / 100
            assert sampler.draw(u) == nucleus_draw(probs, p, u)


def test_sampler_sample_values():
    sampler = NucleusSampler([0.125, 0.5, 0.25, 0.125], 0.7)
    assert sampler.ids == [1, 2]
    assert sampler.ends == [0.5, 0.75]
    assert sampler.draw(0.8) == 2
    assert sampler.draw(0.5) == 1
    assert sampler.draw(2 / 3) == 2  # 0.5 恰好落在分界上，左闭右开归右边
