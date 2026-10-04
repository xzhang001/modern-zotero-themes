"""Build a reproducible XPI without third-party dependencies, and record it in updates.json."""
import hashlib
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'plugin'
UPDATES = ROOT / 'updates.json'
# Each version's XPI is attached to the GitHub release tagged v<version>.
RELEASES = 'https://github.com/xzhang001/modern-zotero-themes/releases'
manifest = json.loads((SOURCE / 'manifest.json').read_text())
version = manifest['version']
zotero = manifest['applications']['zotero']
target = ROOT / 'dist' / f'modern-zotero-themes-{version}.xpi'
target.parent.mkdir(exist_ok=True)
files = {file.relative_to(SOURCE).as_posix(): file for file in sorted(SOURCE.rglob('*')) if file.is_file()}
files['LICENSE'] = ROOT / 'LICENSE'
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as archive:
    for name, file in sorted(files.items()):
        info = zipfile.ZipInfo(name, (2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        archive.writestr(info, file.read_bytes())
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None
    assert {'manifest.json', 'bootstrap.js', 'themes.js', 'runtime.js', 'preferences.xhtml', 'LICENSE'} <= set(archive.namelist())
print(f'Built {target.relative_to(ROOT)} ({target.stat().st_size:,} bytes)')

# The update manifest Zotero reads from update_url. The XPI is reproducible, so the hash recorded here
# matches the release asset as long as both are built from the same commit. Rebuilding replaces this
# version's entry; entries for other versions are kept.
updates = json.loads(UPDATES.read_text()) if UPDATES.exists() else {'addons': {}}
entries = updates['addons'].setdefault(zotero['id'], {'updates': []})['updates']
entries[:] = [entry for entry in entries if entry['version'] != version]
entries.append({
    'version': version,
    'update_link': f'{RELEASES}/download/v{version}/{target.name}',
    'update_hash': 'sha256:' + hashlib.sha256(target.read_bytes()).hexdigest(),
    'update_info_url': f'{RELEASES}/tag/v{version}',
    'applications': {'zotero': {key: zotero[key] for key in ('strict_min_version', 'strict_max_version')}}
})
entries.sort(key=lambda entry: [int(part) for part in entry['version'].split('.')])
UPDATES.write_text(json.dumps(updates, indent=2, ensure_ascii=False) + '\n')
print(f'Recorded {version} in {UPDATES.relative_to(ROOT)}')
