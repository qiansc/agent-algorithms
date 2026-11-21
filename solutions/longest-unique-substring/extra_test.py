from followup import longest_unique_text


def test_followup_returns_leftmost():
    assert longest_unique_text("abba") == "ab"
    assert longest_unique_text("查票查价") == "票查价"
    assert longest_unique_text("") == ""
    assert longest_unique_text("dvdf") == "vdf"
    assert longest_unique_text("a😀a😀b") == "a😀b"
