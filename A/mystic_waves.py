import sys

def solve() -> None:
    data = sys.stdin.read().strip().split()
    if not data:
        return
    t = int(data[0])
    out_lines = []
    idx = 1
    for _ in range(t):
        x = int(data[idx]); n = int(data[idx + 1])
        idx += 2
        # If n is odd, the sum is x; if even, 0
        total = x if n % 2 == 1 else 0
        out_lines.append(str(total))
    sys.stdout.write("\n".join(out_lines))

if __name__ == "__main__":
    solve()