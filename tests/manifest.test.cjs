const { test } = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../plugin/manifest.json');

// Zotero's patched XPIInstall rejects the XPI as incompatible if any of these is missing.
test('manifest has every field Zotero requires at install time', () => {
  const zotero = manifest.applications?.zotero;
  for (const key of ['id', 'update_url', 'strict_min_version', 'strict_max_version']) {
    assert.ok(typeof zotero?.[key] === 'string' && zotero[key].trim(), `applications.zotero.${key}`);
  }
  assert.match(zotero.update_url, /^https:\/\//);
});
// updates.json is what installed copies read from update_url; build.py writes this version's entry.
test('updates.json lists the current version for this add-on ID, pointing at its release', () => {
  const zotero = manifest.applications.zotero;
  const updates = require('../updates.json');
  assert.equal(zotero.update_url, 'https://raw.githubusercontent.com/xzhang001/modern-zotero-themes/main/updates.json');
  assert.deepEqual(Object.keys(updates.addons), [zotero.id]);
  const entries = updates.addons[zotero.id].updates;
  const current = entries.find(entry => entry.version === manifest.version);
  assert.ok(current, `no entry for ${manifest.version}; run npm run build`);
  for (const entry of entries) {
    const base = 'https://github.com/xzhang001/modern-zotero-themes/releases';
    assert.equal(entry.update_link, `${base}/download/v${entry.version}/modern-zotero-themes-${entry.version}.xpi`);
    assert.equal(entry.update_info_url, `${base}/tag/v${entry.version}`);
    assert.match(entry.update_hash, /^sha256:[0-9a-f]{64}$/);
    assert.ok(entry.applications.zotero.strict_min_version);
  }
  assert.deepEqual(current.applications.zotero,
    { strict_min_version: zotero.strict_min_version, strict_max_version: zotero.strict_max_version });
});
