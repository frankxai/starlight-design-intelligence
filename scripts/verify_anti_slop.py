#!/usr/bin/env python3
"""
Starlight Anti-Slop Visual QA Scanner (2026)
Canonical location: starlight-design-intelligence/scripts/verify_anti_slop.py

Scans HTML, CSS, TSX, JSX files in a web project directory to detect visual anti-patterns
(AI slop) and calculate a 0-100 Anti-Slop Quality Score.
"""

import os
import re
import sys
import argparse
from pathlib import Path

# Fix UTF-8 encoding on Windows console
if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def scan_project(target_dir):
    target_path = Path(target_dir).resolve()
    if not target_path.exists():
        print(f"Error: Path '{target_path}' does not exist.")
        sys.exit(1)

    files_to_scan = []
    extensions = {'.html', '.css', '.tsx', '.jsx', '.vue', '.svelte'}
    ignored_dirs = {
        'node_modules', '.next', 'dist', 'build', '.git', 
        '.worktrees', '.codex-worktrees', '.hermes-worktrees', 
        '.claude', '.cursor', '.vscode', '.idea',
        '.turbo', '.cache', 'tmp', 'coverage', '.pnpm', '.vercel',
        'out', '.shadow', '.astro', '.nuxt', '.output', '.svelte-kit',
        '.yarn', 'public', 'vendor'
    }
    
    if target_path.is_file():
        try:
            if target_path.stat().st_size <= 500 * 1024:
                files_to_scan.append(target_path)
        except Exception:
            pass
    else:
        for root, dirs, files in os.walk(target_path, followlinks=False):
            dirs[:] = [
                d for d in dirs 
                if d.lower() not in ignored_dirs 
                and not d.startswith('.worktree') 
                and not d.startswith('.pnpm')
                and not d.startswith('.git')
            ]
            for file in files:
                if len(files_to_scan) >= 250:
                    break
                p = Path(root) / file
                if p.suffix.lower() in extensions:
                    try:
                        if p.stat().st_size <= 500 * 1024:
                            files_to_scan.append(p)
                    except Exception:
                        pass
            if len(files_to_scan) >= 250:
                break

    if not files_to_scan:
        print("No scannable HTML/CSS/TSX/JSX files found.")
        return 100, []

    # Fast file-by-file pattern matching
    has_font = False
    has_grain = False
    has_glass = False
    has_interaction = False
    has_slop_gradient = False
    has_unstyled_btn = False

    re_font = re.compile(r'fonts\.googleapis\.com|fontshare\.com|@font-face|next/font/google|next/font/local|font-sans|font-display', re.IGNORECASE)
    re_grain = re.compile(r'bg-grain|noiseFilter|fractalNoise|svg.*noise', re.IGNORECASE)
    re_glass = re.compile(r'backdrop-filter|backdrop-blur|glass-card|rgba\(.*0\.\d+\)', re.IGNORECASE)
    re_interaction = re.compile(r':hover|hover:|transition|cubic-bezier|transform', re.IGNORECASE)
    re_slop_gradient = re.compile(r'from-purple-\d+.*to-blue-\d+|from-indigo-\d+.*to-purple-\d+', re.IGNORECASE)
    re_unstyled_btn = re.compile(r'<button\s*>|<button\s+id="[^"]*"\s*>')

    slop_gradient_files = []
    unstyled_btn_files = []

    for f in files_to_scan:
        try:
            with open(f, 'r', encoding='utf-8', errors='ignore') as file_obj:
                content = file_obj.read()
                if not has_font and re_font.search(content):
                    has_font = True
                if not has_grain and re_grain.search(content):
                    has_grain = True
                if not has_glass and re_glass.search(content):
                    has_glass = True
                if not has_interaction and re_interaction.search(content):
                    has_interaction = True
                if re_slop_gradient.search(content):
                    has_slop_gradient = True
                    slop_gradient_files.append(str(f))
                if re_unstyled_btn.search(content):
                    has_unstyled_btn = True
                    unstyled_btn_files.append(str(f))
        except Exception:
            pass

    score = 50  # Base score
    checks = []

    # 1. Font Import Check (+15 points)
    if has_font:
        score += 15
        checks.append(("PASS", "+15", "Web fonts (Google Fonts/Fontshare/@font-face) detected."))
    else:
        checks.append(("FAIL", "-15", "No custom web font imports detected (Risk of browser default Arial/Times)."))

    # 2. Grain & Noise Texture Check (+15 points)
    if has_grain:
        score += 15
        checks.append(("PASS", "+15", "SVG noise/grain texture overlay detected."))
    else:
        checks.append(("WARN", "+0", "No SVG noise/grain overlay detected (Background may feel flat)."))

    # 3. Backdrop Blur / Glassmorphism Check (+10 points)
    if has_glass:
        score += 10
        checks.append(("PASS", "+10", "Glassmorphism / backdrop-filter blur detected."))
    else:
        checks.append(("WARN", "+0", "No glassmorphism or backdrop blur effects found."))

    # 4. Micro-Interactions / Hover Easing (+10 points)
    if has_interaction:
        score += 10
        checks.append(("PASS", "+10", "Micro-interactions and hover transitions detected."))
    else:
        checks.append(("FAIL", "-10", "No hover transitions or micro-interactions found."))

    # 5. Anti-Pattern: Generic Purple-to-Blue Tailwind Gradient (-15 points)
    if has_slop_gradient:
        score -= 15
        culprits = ", ".join([str(Path(p).relative_to(target_path)) for p in slop_gradient_files[:5]])
        checks.append(("FAIL", "-15", f"Anti-pattern detected: Generic AI 'from-purple to-blue' gradient in [{culprits}]!"))

    # 6. Anti-Pattern: Unstyled Default Buttons (-10 points)
    if has_unstyled_btn:
        score -= 10
        culprits = ", ".join([str(Path(p).relative_to(target_path)) for p in unstyled_btn_files[:5]])
        checks.append(("FAIL", "-10", f"Anti-pattern detected: Unstyled raw HTML <button> tag in [{culprits}]!"))

    # Clamp score between 0 and 100
    final_score = max(0, min(100, score))
    return final_score, checks

def main():
    parser = argparse.ArgumentParser(description="Starlight Anti-Slop Visual QA Scanner")
    parser.add_argument("path", nargs="?", default=".", help="Path to project directory or file")
    args = parser.parse_args()

    print(f"\n[SCAN] Running Anti-Slop Visual QA Scan on: {Path(args.path).resolve()}\n" + "="*60)
    score, checks = scan_project(args.path)

    for status, points, msg in checks:
        icon = "[PASS]" if status == "PASS" else ("![WARN]" if status == "WARN" else "x[FAIL]")
        print(f"{icon} ({points}) {msg}")

    print("="*60)
    print(f"[SCORE] Anti-Slop Quality Score: {score}/100")

    if score >= 90:
        print("[VERDICT] PASSED - World-Class Visual Standards Cleared!")
        sys.exit(0)
    elif score >= 75:
        print("![VERDICT] WARNING - Needs Improvement (Clears basic bar, but has slop risks).")
        sys.exit(1)
    else:
        print("x[VERDICT] FAILED - High AI Slop Detected! Apply CSS_ANTI_SLOP_STARTER.css.")
        sys.exit(1)

if __name__ == "__main__":
    main()
