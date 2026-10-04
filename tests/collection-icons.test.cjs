const { test } = require('node:test');
const assert = require('node:assert/strict');
const icons = require('../plugin/collection-icons.js');
const themes = require('../plugin/themes.js');

function luminance(hex) {
  const values = hex.slice(1, 7).match(/../g).map(v => parseInt(v, 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function contrast(a, b) {
  const pair = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (pair[0] + 0.05) / (pair[1] + 0.05);
}
// Matches the --mzt-canvas color-mix in themes.js.
function canvas(theme) {
  const amount = theme.mode === 'dark' ? 0.7 : 0.95;
  return '#' + theme.colors.sidebar.slice(1).match(/../g)
    .map(v => Math.round(parseInt(v, 16) * amount).toString(16).padStart(2, '0')).join('');
}
test('icon colors stay visible on every surface of their theme mode', () => {
  for (const theme of themes.themes) {
    for (const [name, value] of Object.entries(icons.colors)) {
      for (const surface of [theme.colors.background, theme.colors.sidebar, canvas(theme)]) {
        const ratio = contrast(value[theme.mode], surface);
        assert.ok(ratio >= 3, `${theme.name} ${name} on ${surface}: ${ratio.toFixed(2)}`);
      }
    }
  }
});
test('entries accept one icon (with optional color) or one emoji', () => {
  assert.deepEqual(icons.validate({ icon: 'brain', color: 'teal' }), { icon: 'brain', color: 'teal' });
  assert.deepEqual(icons.validate({ emoji: '🗂️' }), { emoji: '🗂️' });
  assert.deepEqual(icons.validate({ emoji: '📚 and more' }), { emoji: '📚' });
  assert.equal(icons.validate(null), null);
  assert.equal(icons.validate({}), null);
  for (const bad of [{ icon: 'nope' }, { icon: 'brain', emoji: '📚' }, { emoji: 'a' }, { emoji: '1' },
    { emoji: '"' }, { emoji: '📚', color: 'red' }, { icon: 'brain', color: 'black' }, [], 'brain']) {
    assert.throws(() => icons.validate(bad), JSON.stringify(bad));
  }
});
test('generated CSS defines a mask for every icon and the palette for the mode', () => {
  const light = icons.css('light');
  const dark = icons.css('dark');
  for (const name of icons.icons) assert.match(light, new RegExp(`\\[data-mzt-icon="${name}"\\] \\{ --mzt-icon-mask: url\\("data:image/svg\\+xml,`));
  assert.ok(light.includes(`--mzt-icon-teal: ${icons.colors.teal.light};`));
  assert.ok(dark.includes(`--mzt-icon-teal: ${icons.colors.teal.dark};`));
  // SVG markup is URL-encoded inside the data URI, so no raw tags reach the stylesheet.
  assert.doesNotMatch(light, /<svg/);
});
