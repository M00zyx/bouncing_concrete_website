"""Refresh the repository inventory without traversing generated dependencies."""
from pathlib import Path
import csv, subprocess
root = Path(__file__).resolve().parents[1]
paths = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root).decode().split('\0')
def category(p):
    if p.startswith('studies/'): return 'Archived prototype'
    if p.startswith('docs/archive/'): return 'Historical evidence'
    if p.startswith('src/experience/'): return 'Current runtime and retained media'
    if p in ('src/main.js', 'src/signup-study.js', 'src/signup-study.css'): return 'Current entry and signup'
    if p.startswith('src/'): return 'Legacy source retained'
    if p.startswith('public/assets/'): return 'Shared or historical media'
    if p.startswith('docs/') or p.endswith('.md'): return 'Documentation'
    return 'Build, hosting or configuration'
with (root/'docs/FILE-INVENTORY.csv').open('w', newline='') as out:
    writer = csv.writer(out); writer.writerow(['category', 'path', 'bytes'])
    for p in sorted(set(paths)):
        f = root/p
        if p and f.is_file() and p != 'docs/FILE-INVENTORY.csv': writer.writerow([category(p), p, f.stat().st_size])
