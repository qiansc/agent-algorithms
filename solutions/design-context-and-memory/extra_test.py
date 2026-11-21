from solution import PreferenceStore


def test_ttl_must_be_positive():
    store = PreferenceStore()
    try:
        store.tell("地址", "酒店", 1, 0)
    except ValueError:
        return
    raise AssertionError("ttl_days = 0 should be rejected")
