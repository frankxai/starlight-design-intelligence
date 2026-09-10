"""Build a self-contained review artifact from exact, hash-verified OFL fonts.

Usage: python3 typography/brand-studio/build.py --cache ../brand-studio-cache --out ../deliverables/Brand-studio-2026-09-10.html
The source lives in Git. Compiled review exports and font binaries stay outside it.
"""
import argparse
import base64
import hashlib
import html
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent


def build(cache: Path, output: Path, *, fallback=False):
    manifest = json.loads((HERE / 'font-manifest.json').read_text())
    css = []
    notices = {}
    for font in manifest['files']:
        data = (cache / font['filename']).read_bytes()
        if hashlib.sha256(data).hexdigest() != font['sha256']:
            raise ValueError(f"Font digest mismatch: {font['filename']}")
        notice = (cache / font['license_file']).read_bytes()
        if hashlib.sha256(notice).hexdigest() != font['license_sha256']:
            raise ValueError(f"License digest mismatch: {font['license_file']}")
        notices[font['family']] = notice.decode('utf-8')
        weight = next((f"{a['min']:g} {a['max']:g}" for a in font['axes'] if a['tag'] == 'wght'), '400')
        if not fallback:
            css.append(dict(family=font['family'],style=font['style'],css=f"@font-face{{font-family:'{font['family']}';font-style:{font['style']};font-weight:{weight};font-display:swap;src:url(data:font/ttf;base64,{base64.b64encode(data).decode()}) format('truetype')}}"))
    payload = dict(fontFaces=css, sheetCSS=(HERE / 'sheet.css').read_text(), manifest=manifest, fallbackBuild=fallback)
    # JSON is embedded as data; escape markup delimiters before entering HTML.
    encoded = json.dumps(payload).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    licenses = ''.join(f'<details><summary>{html.escape(name)} — OFL 1.1</summary><pre>{html.escape(body)}</pre></details>' for name, body in notices.items())
    page = (HERE / 'shell.html').read_text().replace('<!-- FONT_DATA -->', f'<script id="font-data" type="application/json">{encoded}</script>')
    page = page.replace('<!-- LICENSES -->', licenses).replace('/* VIEWER_SCRIPT */', (HERE / 'viewer.js').read_text())
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page)
    print(json.dumps({'output': str(output.resolve()), 'bytes': output.stat().st_size, 'sha256': hashlib.sha256(page.encode()).hexdigest(), 'fontFiles': len(manifest['files']), 'licenseNotices': len(notices), 'fallbackBuild': fallback}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', required=True, type=Path)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--fallback', action='store_true', help='Omit every webfont declaration to test actual unavailable-font fallback.')
    args = parser.parse_args()
    build(args.cache, args.out, fallback=args.fallback)
