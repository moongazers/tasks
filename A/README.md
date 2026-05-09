# Mystic Waves - Solution

## Problem Summary
Given `t` test cases, each with two integers `x` and `n`, compute the total energy after `n` alternating waves starting with `x` and alternating sign (i.e., `x, -x, x, -x, ...`).

## How to Run the Code

### Prerequisites
- Python 3.6 or higher installed on your system.

### Steps

1. **Prepare input**  
   The program reads from standard input. The input format:
  - First line: integer `t` (1 ≤ t ≤ 100)
  - Next `t` lines: each contains two integers `x` and `n` (1 ≤ x, n ≤ 10)

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
  python mystic_waves.py < input.txt

- **Typing input manually (press Ctrl+D / Ctrl+Z to end; in windows, start a new line and press Ctrl+Z, then press enter to end)**:
  ```bash
  python mystic_waves.py

- **Piping from echo(Linux/Mac/Git Bash)**:
  ```bash
  echo -e "4\n1 4\n2 5\n3 6\n4 7" | python mystic_waves.py

3. **Output** 
  The program prints one integer per test case, each on a new line.

## Assumptions Made

- **Input correctness** – The input strictly follows the problem constraints:
  - `t` is between 1 and 100.
  - Each `x` and `n` are integers between 1 and 10 inclusive.
  - No extra whitespace or malformed lines.

- **Mathematical simplification** – The alternating sum `x - x + x - x + ...` for `n` terms simplifies to:
  - `x` if `n` is odd (because the first and last term are `+x` and all pairs cancel).
  - `0` if `n` is even.  
  This avoids explicitly generating the sequence.

- **Reading method** – The script reads all input at once using `sys.stdin.read()`, which assumes the entire input fits comfortably in memory (always true given limits).

- **Output format** – Each result is printed on its own line with no extra spaces.