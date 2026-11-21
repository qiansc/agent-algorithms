def intersect_lists(lists: list[list[int]]) -> list[int]:
    if not lists:
        return []
    ordered = sorted(lists, key=len)  # 从最短的表起步
    result = list(ordered[0])
    for other in ordered[1:]:
        if not result:
            break  # 已经没有公共编号，后面的表不用再看
        i = j = 0
        common: list[int] = []
        while i < len(result) and j < len(other):
            if result[i] < other[j]:
                i += 1  # other 往后只会更大，result[i] 不会有搭档
            elif result[i] > other[j]:
                j += 1
            else:
                common.append(result[i])
                i += 1
                j += 1
        result = common
    return result
