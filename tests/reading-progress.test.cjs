const { test } = require('node:test');
const assert = require('node:assert/strict');
const progress = require('../plugin/reading-progress.js');

const container = (o) => ({ scrollHeight: 0, clientHeight: 0, scrollWidth: 0, clientWidth: 0, scrollTop: 0, scrollLeft: 0, ...o });

test('progress is the scroll fraction along the axis the PDF scrolls', () => {
  const vertical = progress.metrics(container({ scrollHeight: 5000, clientHeight: 1000, scrollTop: 2000, scrollWidth: 800, clientWidth: 800 }));
  assert.deepEqual(vertical, { sideways: false, max: 4000, position: 2000, viewport: 1000 });
  assert.equal(progress.fraction(vertical), 0.5);
  // Horizontal scrolling mode.
  const sideways = progress.metrics(container({ scrollHeight: 900, clientHeight: 900, scrollWidth: 6000, clientWidth: 1000, scrollLeft: 5000 }));
  assert.equal(sideways.sideways, true);
  assert.equal(progress.fraction(sideways), 1);
  // A document that fits the view has nothing to show.
  assert.equal(progress.fraction(progress.metrics(container({ scrollHeight: 800, clientHeight: 900 }))), 0);
  assert.equal(progress.fraction({ max: 100, position: 150 }), 1);
});
test('the page under a point is the one at the middle of the viewport there', () => {
  const pages = [0, 1100, 2200, 3300].map(offsetTop => ({ offsetTop, offsetLeft: 0 }));
  const state = { max: 3400, viewport: 1000, sideways: false };
  assert.equal(progress.pageAt(pages, state, 0), 1);
  assert.equal(progress.pageAt(pages, state, 0.4), 2);
  // Exactly at a page's top edge counts as that page.
  assert.equal(progress.pageAt(pages, state, 0.5), 3);
  assert.equal(progress.pageAt(pages, state, 1), 4);
  assert.equal(progress.pageAt([], state, 0.5), 1);
});
test('hover text reads naturally in Chinese and English', () => {
  assert.equal(progress.strings.zh.position(12, 22, 54), '第 12 / 22 页 · 54%');
  assert.equal(progress.strings.en.position(12, 22, 54), 'Page 12 of 22 · 54%');
});
