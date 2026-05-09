import sys

def solve() -> None:
    data = sys.stdin.read().strip().split()
    if not data:
        return
    t = int(data[0])
    out_lines = []
    for i in range(1, t + 1):
        n = int(data[i])
        # Impossible cases: odd n, or n == 2 (even but too small)
        if n % 2 == 1 or n == 2:
            out_lines.append("-1")
            continue

        m = n // 2          # we need 2a + 3b = m, a,b >= 0
        # Maximum total crafts = (m - b_min) // 2
        if m % 2 == 0:
            max_crafts = m // 2          # b_min = 0
        else:
            max_crafts = (m - 1) // 2    # b_min = 1

        # Minimum total crafts = (m - b_max) // 2
        b_max = m // 3
        # Adjust parity: b_max must have same parity as m
        if (b_max & 1) != (m & 1):
            b_max -= 1
        # b_max is guaranteed >= 0 when m >= 2
        min_crafts = (m - b_max) // 2

        out_lines.append(f"{min_crafts} {max_crafts}")

    sys.stdout.write("\n".join(out_lines))

if __name__ == "__main__":
    solve()