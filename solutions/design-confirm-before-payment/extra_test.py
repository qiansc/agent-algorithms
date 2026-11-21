from solution import OrderApi, Rejected, advance


def test_illegal_transitions_raise():
    for state, event in [("draft", "submit"), ("awaiting_confirm", "submit"),
                         ("placed", "submit"), ("unknown", "submit")]:
        try:
            advance(state, event)
        except ValueError:
            continue
        raise AssertionError(f"{state} --{event}--> should be illegal")


def test_confirm_path():
    s = advance("draft", "preview")
    s = advance(s, "edit")
    s = advance(advance(s, "preview"), "confirm")
    assert s == "confirmed"


def test_same_key_other_payload_rejected():
    api = OrderApi([])
    assert api.place("k1", {"amount_cents": 5700}) == "o1"
    assert api.place("k1", {"amount_cents": 5700}) == "o1"
    try:
        api.place("k1", {"amount_cents": 6100})
    except Rejected:
        assert api.created == 1
        return
    raise AssertionError("reusing a key with another payload must fail")
