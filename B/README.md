# CargoCraft Fleet – Solution

## Problem Summary
Given `n` total propulsion units, where Type A crafts have 4 units and Type B have 6 units, find the **minimum** and **maximum** possible number of crafts that could sum to exactly `n`. If impossible, output `-1`.

## How to Run the Code

### Prerequisites
- Python 3.6 or higher

### Steps

1. **Prepare input**  
   The program reads from standard input. Format:
   - First line: integer `t` (1 ≤ t ≤ 1000)
   - Next `t` lines: each contains one integer `n` (1 ≤ n ≤ 10¹⁸)

    Example `input.txt`:
    ```
    4
    4
    7
    24
    998244353998244352
    ```

2. **Run the program**  

- **Using a file as input (recommended)**:  
  ```bash
  python cargocraft.py < input.txt

- **Typing input manually (press Ctrl+D / Ctrl+Z to end; in windows, start a new line and press Ctrl+Z, then press enter to end)**:
  ```bash
  python cargocraft.py

- **Piping from echo(Linux/Mac/Git Bash)**:
  ```bash
  echo -e "4\n4\n7\n24\n998244353998244352" | python cargocraft.py

3. **Output**
For each test case, the program prints either:

- Two integers: min_crafts max_crafts
- Or -1 if no combination exists.

## Assumptions Made

- **Evenness is necessary** – Because both 4 and 6 are even, any odd n is impossible. Also n = 2 is even but too small to form (smallest positive combination is 4). The solution checks these first.

- **Mathematical reduction** – The equation 4a + 6b = n is divided by 2: 2a + 3b = n/2. Let m = n/2. We need non‑negative integers a, b such that 2a + 3b = m. This is a linear Diophantine problem.

- **Parity constraints** – Since 2a is always even, m and 3b must have the same parity. Because 3b ≡ b (mod 2), we require b ≡ m (mod 2). The solution enforces this when computing b_max.

- **Bounds** –  
  - Maximum crafts occurs when we use as many 2‑unit equivalents (i.e., Type A crafts) as possible. This means b is minimal (0 or 1 depending on parity), then a = (m - 3b)/2.  
  - Minimum crafts occurs when we use as many 3‑unit equivalents (i.e., Type B crafts) as possible, i.e., b is maximal subject to b ≤ m/3 and parity condition.

- **Large n handling** – The solution uses integer arithmetic only, no loops, so it works up to n = 10¹⁸ within the time limit (1 second).

- **Impossibility** – Apart from odd n and n = 2, the solution will always find a valid combination for n ≥ 4 even. This is because:
  - n = 4 → 1 craft
  - n = 6 → 1 craft
  - n = 8 → 2 crafts (2×4)
  - n = 10 → 2 crafts (4+6)
  - n = 12 → 2 or 3 crafts, etc.
  No other cases are impossible.

- **Output format** – Results are printed one per line, with two integers separated by a space, or -1 alone. No extra whitespace.