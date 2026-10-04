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
