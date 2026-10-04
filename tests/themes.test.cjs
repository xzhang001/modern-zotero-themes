const { test } = require('node:test');
const assert = require('node:assert/strict');
const themes = require('../plugin/themes.js');

function luminance(hex) {
  const values = hex.slice(1, 7).match(/../g).map(v => parseInt(v, 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function contrast(a, b) {
  const pair = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (pair[0] + 0.05) / (pair[1] + 0.05);
}
test('readable primary, secondary, selected, and accent text for every theme', () => {
  for (const { name, colors: c } of themes.themes) {
    for (const [fg, bg] of [['text', 'background'], ['muted', 'background'], ['muted', 'sidebar'],
      ['selectedText', 'selected'], ['text', 'inactiveSelected'], ['onAccent', 'accent'],
      ['error', 'errorBackground'], ['error', 'background']]) {
      assert.ok(contrast(c[fg], c[bg]) >= 4.5, `${name}: ${fg}/${bg}: ${contrast(c[fg], c[bg])}`);
    }
  }
});
// subtle becomes --fill-tertiary: Zotero uses it for placeholders, disabled controls and empty-pane messages.
test('subtle text stays legible on every surface', () => {
  for (const { name, colors: c } of themes.themes) {
    for (const bg of ['background', 'sidebar', 'toolbar', 'elevated']) {
      assert.ok(contrast(c.subtle, c[bg]) >= 3, `${name}: subtle/${bg}: ${contrast(c.subtle, c[bg])}`);
    }
  }
});
test('fixed theme is independent of system and system chooses configured pair', () => {
  const config = { mode: 'fixed', theme: 'catppuccin-latte', lightTheme: 'catppuccin-latte', darkTheme: 'modern-dark' };
  assert.equal(themes.resolve(config, true).id, 'catppuccin-latte');
  config.mode = 'system';
  assert.equal(themes.resolve(config, false).id, 'catppuccin-latte');
  assert.equal(themes.resolve(config, true).id, 'modern-dark');
});
test('missing and mismatched stored themes fall back to a matching mode', () => {
  assert.equal(themes.resolve({ mode: 'fixed', theme: 'removed-theme' }, true).id, 'modern-light');
  assert.equal(themes.resolve({ mode: 'system', darkTheme: 'catppuccin-latte' }, true).id, 'modern-dark');
});
test('theme definition rejects missing colors and CSS injection', () => {
  for (const color of [undefined, 'red; background: url(https://example.org)', '#ffffff80']) {
    const definition = { ...themes.themes[0], colors: { ...themes.themes[0].colors, background: color } };
    assert.throws(() => themes.css(definition));
  }
});
test('theme tokens do not replace semantic annotation colors or geometry', () => {
  for (const theme of themes.themes) {
    const css = themes.css(theme);
    assert.match(css, /forced-colors: none/);
    assert.doesNotMatch(css, /--tag-|--accent-(yellow|red|green)|height:|width:|padding:/);
    assert.match(css, /--material-sidepane:/);
  }
});
test('modern layout canvas steps further below the sidebar on dark themes', () => {
  for (const theme of themes.themes) {
    const amount = theme.mode === 'dark' ? 70 : 95;
    assert.ok(themes.css(theme).includes(`--mzt-canvas: color-mix(in srgb, ${theme.colors.sidebar} ${amount}%, #000);`), theme.name);
  }
});
test('every theme has a readable reading page and exposes it as a Zotero reader theme', () => {
  for (const theme of themes.themes) {
    const { background, foreground } = theme.page;
    assert.ok(contrast(foreground, background) >= 7, `${theme.name}: page ${contrast(foreground, background)}`);
    assert.deepEqual(themes.readerTheme(theme), { id: 'mzt-' + theme.id, label: theme.name, background, foreground });
  }
  assert.throws(() => themes.validate({ ...themes.themes[0], page: { background: '#fff', foreground: '#000000' } }));
});
