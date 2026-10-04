"""Build a reproducible XPI without third-party dependencies."""
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'plugin'
manifest = json.loads((SOURCE / 'manifest.json').read_text())
target = ROOT / 'dist' / f'modern-zotero-themes-{manifest["version"]}.xpi'
target.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(SOURCE.rglob('*')):
        if file.is_file():
            info = zipfile.ZipInfo(file.relative_to(SOURCE).as_posix(), (2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, file.read_bytes())
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None
    assert {'manifest.json', 'bootstrap.js', 'themes.js', 'runtime.js', 'preferences.xhtml'} <= set(archive.namelist())
print(f'Built {target.relative_to(ROOT)} ({target.stat().st_size:,} bytes)')
