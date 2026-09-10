"""Acquire only the pinned fonts and notices needed by the review exports."""
import argparse
import hashlib
import json
from pathlib import Path
from urllib.request import urlopen

HERE = Path(__file__).resolve().parent


def acquire(cache):
    cache.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((HERE / 'font-manifest.json').read_text())
    files = {}
    for f in manifest['files']:
        files[f['filename']] = (f['source_url'], f['sha256'])
        files[f['license_file']] = (f['license_source_url'], f['license_sha256'])
    for name, (url, sha) in files.items():
        path = cache / name
        data = path.read_bytes() if path.exists() else urlopen(url, timeout=30).read()
        if hashlib.sha256(data).hexdigest() != sha:
            raise ValueError(f'Digest mismatch: {name}')
        path.write_bytes(data)
    print(json.dumps({'verified_files': len(files), 'cache': str(cache.resolve())}))


if __name__ == '__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--cache', type=Path, required=True)
    acquire(p.parse_args().cache)
