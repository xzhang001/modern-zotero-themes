const { test } = require('node:test');
const assert = require('node:assert/strict');
const createRuntime = require('../plugin/runtime.js');
const themes = require('../plugin/themes.js');
const collectionIcons = require('../plugin/collection-icons.js');

class FakeMutationObserver {
  constructor(callback) { this.callback = callback; this.target = null; }
  observe(target) { this.target = target; target.observers.add(this); }
  disconnect() { this.target?.observers.delete(this); this.target = null; }
}
// Collection tree whose rendered rows (any DOM order, as after scrolling) map to Zotero row types.
function fakeElement() {
  const attributes = new Map();
  const style = new Map();
  return {
    attributes, styleMap: style,
    setAttribute: (k, v) => attributes.set(k, v), removeAttribute: k => attributes.delete(k),
    style: { setProperty: (k, v) => style.set(k, v), removeProperty: k => style.delete(k) }
  };
}
function fakeCollectionTree(types, rendered = types.map((_, index) => index), keys = {}) {
  const observers = new Set();
  const rows = rendered.map(index => {
    const attributes = new Set();
    const style = new Map();
    const icon = fakeElement();
    return {
      icon, querySelector: selector => (selector === '.cell-icon' ? icon : null),
      id: 'collection-tree-row-' + index, attributes,
      style: { setProperty: (k, v) => style.set(k, v), removeProperty: k => style.delete(k), get: k => style.get(k) },
      toggleAttribute(name, on) { if (on) attributes.add(name); else attributes.delete(name); },
      removeAttribute(name) { attributes.delete(name); }
    };
  });
  const treeStyle = new Map();
  return {
    observers, rows, treeStyle,
    view: { getRow: index => (index in types ? { type: types[index], ref: { libraryKey: keys[index] } } : undefined),
      get rowCount() { return types.length; } },
    icon: index => rows.find(row => row.id === 'collection-tree-row-' + index).icon,
    element: { observers, querySelectorAll: () => rows,
      style: { setProperty: (k, v) => treeStyle.set(k, v), removeProperty: k => treeStyle.delete(k) } },
    shift: index => rows.find(row => row.id === 'collection-tree-row-' + index).style.get('--mzt-section-shift'),
    marked: () => rows.filter(row => row.attributes.has('data-mzt-section-start')).map(row => row.id),
    mutate() { for (const observer of observers) observer.callback(); }
  };
}
function fakeWindow(dark = false, tree = null) {
  const children = [];
  const attributes = new Map();
  const events = new Map();
  const mediaEvents = new Set();
  const root = {
    append(...nodes) { children.push(...nodes); },
    getAttribute(key) { return attributes.get(key) ?? null; },
    setAttribute(key, value) { attributes.set(key, value); },
    removeAttribute(key) { attributes.delete(key); }
  };
  const media = {
    matches: dark,
    addEventListener(_, cb) { mediaEvents.add(cb); },
    removeEventListener(_, cb) { mediaEvents.delete(cb); },
    change(dark) { this.matches = dark; for (const cb of mediaEvents) cb(); }
  };
  return {
    children, attributes, mediaEvents, events, media,
    MutationObserver: FakeMutationObserver,
    ZoteroPane: tree && { collectionsView: tree.view },
    document: {
      getElementById: id => (id === 'zotero-collections-tree' && tree ? tree.element
        : id === 'zotero-collectionmenu' && tree?.menu ? tree.menu : null),
      createXULElement: tag => {
        const node = { localName: tag, attributes: new Map(), listeners: new Map(), hidden: false,
          setAttribute(k, v) { this.attributes.set(k, v); }, addEventListener(k, cb) { this.listeners.set(k, cb); },
          remove() { tree.menu.children.splice(tree.menu.children.indexOf(this), 1); } };
        return node;
      },
      documentElement: root,
      createElementNS() { return { remove() { children.splice(children.indexOf(this), 1); } }; }
    },
    matchMedia() { return media; },
    addEventListener(name, cb) { events.set(name, cb); },
    removeEventListener(name) { events.delete(name); }
  };
}
function setup(windows = [fakeWindow()]) {
  const prefs = new Map();
  const observers = new Map();
  const panes = new Map();
  const notify = key => { for (const [branch, o] of observers) if (key.startsWith(branch)) o.observe(); };
  const Services = { prefs: {
    getStringPref(key, fallback) { return prefs.get(key) ?? fallback; },
    setStringPref(key, value) { prefs.set(key, value); notify(key); },
    getIntPref(key, fallback) { return prefs.get(key) ?? fallback; },
    setIntPref(key, value) { prefs.set(key, value); notify(key); },
    addObserver(branch, o) { observers.set(branch, o); },
    removeObserver(branch, o) { if (observers.get(branch) === o) observers.delete(branch); }
  } };
  const Zotero = {
    getMainWindows: () => windows, logError: error => { throw error; },
    PreferencePanes: {
      async register(options) { panes.set('pane', options); return 'pane'; },
      unregister(id) { panes.delete(id); }
    }
  };
  return { windows, prefs, observers, panes, Zotero, runtime: createRuntime({
    Zotero, Services, rootURI: 'jar:file:///plugin.xpi!/', id: 'test', version: '1.2.3', themes, collectionIcons
  }) };
}
test('startup and repeated attach load exactly one set of styles per window', async () => {
  const s = setup(); await s.runtime.start();
  s.runtime.attach(s.windows[0]);
  // Three stylesheets, theme tokens, collection icon rules.
  assert.equal(s.windows[0].children.length, 5);
  const [modern, layout] = s.windows[0].children.slice(0, 2).map(link => link.href);
  // Per-startup query: an upgraded XPI keeps its jar: URL, and Gecko would reuse the cached sheet.
  assert.match(modern, /^jar:file:\/\/\/plugin\.xpi!\/styles\/modern\.css\?v=1\.2\.3\.\d+$/);
  assert.match(layout, /^jar:file:\/\/\/plugin\.xpi!\/styles\/layout\.css\?v=1\.2\.3\.\d+$/);
  assert.match(s.panes.get('pane').stylesheets[0], /styles\/preferences\.css\?v=1\.2\.3\.\d+$/);
  assert.equal(s.windows[0].attributes.get('data-mzt-theme'), 'modern-light');
  assert.equal(s.windows[0].attributes.get('data-mzt-layout'), 'modern');
  assert.equal(s.panes.size, 1);
  s.runtime.stop();
});
test('settings propagate to all windows; system transitions and new windows work', async () => {
  const s = setup([fakeWindow(), fakeWindow(true)]); await s.runtime.start();
  s.Zotero.ModernZoteroThemes.set('lightTheme', 'catppuccin-latte');
  assert.equal(s.windows[0].attributes.get('data-mzt-theme'), 'catppuccin-latte');
  assert.equal(s.windows[1].attributes.get('data-mzt-theme'), 'modern-dark');
  s.windows[0].media.change(true);
  assert.equal(s.windows[0].attributes.get('data-mzt-theme'), 'modern-dark');
  s.Zotero.ModernZoteroThemes.set('theme', 'catppuccin-latte');
  s.Zotero.ModernZoteroThemes.set('mode', 'fixed');
  const win = fakeWindow(true); s.runtime.attach(win);
  assert.equal(win.attributes.get('data-mzt-theme'), 'catppuccin-latte');
  assert.ok(s.windows.every(w => w.attributes.get('data-mzt-theme') === 'catppuccin-latte'));
  s.runtime.stop();
});
test('disable cleans up styles, attributes, observers, listeners, settings API', async () => {
  const s = setup(); const win = s.windows[0];
  win.attributes.set('data-mzt-theme', 'previous');
  await s.runtime.start();
  assert.equal(win.attributes.get('data-mzt-layout'), 'modern');
  let notified = false;
  s.Zotero.ModernZoteroThemes.subscribe(() => { notified = !s.Zotero.ModernZoteroThemes; });
  s.runtime.stop(); s.runtime.stop();
  assert.equal(win.children.length, 0);
  assert.equal(win.attributes.get('data-mzt-theme'), 'previous');
  assert.equal(win.attributes.has('data-mzt-layout'), false);
  assert.equal(win.mediaEvents.size, 0); assert.equal(win.events.size, 0);
  assert.equal(s.observers.size, 0); assert.equal(s.panes.size, 0);
  assert.equal(s.Zotero.ModernZoteroThemes, undefined); assert.equal(notified, true);
});
test('closed windows detach and re-enable preserves saved settings', async () => {
  const s = setup(); await s.runtime.start();
  s.Zotero.ModernZoteroThemes.set('theme', 'modern-dark');
  s.Zotero.ModernZoteroThemes.set('mode', 'fixed');
  s.windows[0].events.get('unload')();
  assert.equal(s.windows[0].children.length, 0);
  s.runtime.stop(); await s.runtime.start();
  assert.equal(s.windows[0].attributes.get('data-mzt-theme'), 'modern-dark');
  s.runtime.stop();
});
test('invalid settings cannot write arbitrary preferences', async () => {
  const s = setup(); await s.runtime.start(); const api = s.Zotero.ModernZoteroThemes;
  assert.throws(() => api.set('darkTheme', 'catppuccin-latte'));
  assert.throws(() => api.set('mode', 'invalid'));
  assert.throws(() => api.set('other', 'value'));
  assert.throws(() => api.set('__proto__', 'modern-light'));
  assert.equal(s.prefs.size, 0); s.runtime.stop();
});
test('disable while settings registration is pending does not leave a pane behind', async () => {
  const s = setup(); let resolveRegistration;
  s.Zotero.PreferencePanes.register = () => new Promise(resolve => { resolveRegistration = resolve; });
  const pending = s.runtime.start();
  s.runtime.stop();
  s.panes.set('late-pane', {}); resolveRegistration('late-pane'); await pending;
  assert.equal(s.panes.size, 0); assert.equal(s.observers.size, 0);
  assert.equal(s.windows[0].children.length, 0);
});
test('subscripts expose their API on an explicit Zotero-style target scope', () => {
  const fs = require('node:fs'); const vm = require('node:vm');
  const scope = vm.createContext({});
  for (const file of ['themes.js', 'runtime.js']) {
    vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../plugin', file), 'utf8'), scope);
  }
  assert.equal(scope.MZTThemes.themes.length, require('../plugin/themes.js').themes.length);
  assert.equal(typeof scope.MZTCreateRuntime, 'function');
});
test('Zotero appearance is read, written only with valid values, and notifies settings panes', async () => {
  const s = setup(); await s.runtime.start(); const api = s.Zotero.ModernZoteroThemes;
  assert.equal(api.zoteroAppearance(), 'auto');
  let notified = 0; api.subscribe(() => notified++);
  api.setZoteroAppearance('dark');
  assert.equal(s.prefs.get('browser.theme.toolbar-theme'), 0);
  assert.equal(api.zoteroAppearance(), 'dark');
  assert.equal(notified, 1);
  for (const value of ['system', 2, '__proto__']) assert.throws(() => api.setZoteroAppearance(value));
  s.runtime.stop();
  assert.equal(s.observers.size, 0);
  api.setZoteroAppearance('light');
  assert.equal(s.prefs.get('browser.theme.toolbar-theme'), 0);
});
test('layout switches between modern and classic; unknown stored layouts fall back to modern', async () => {
  const s = setup(); await s.runtime.start(); const api = s.Zotero.ModernZoteroThemes;
  api.set('layout', 'classic');
  assert.equal(s.windows[0].attributes.get('data-mzt-layout'), 'classic');
  assert.throws(() => api.set('layout', 'compact'));
  s.prefs.set('extensions.modernZoteroThemes.layout', 'removed-layout');
  api.set('theme', 'modern-dark');
  assert.equal(s.windows[0].attributes.get('data-mzt-layout'), 'modern');
  s.runtime.stop();
});
test('folder icons default to color, accept only color/mono, and are restored on disable', async () => {
  const s = setup(); const win = s.windows[0]; await s.runtime.start(); const api = s.Zotero.ModernZoteroThemes;
  assert.equal(win.attributes.get('data-mzt-folder-icons'), 'color');
  api.set('folderIcons', 'mono');
  assert.equal(win.attributes.get('data-mzt-folder-icons'), 'mono');
  assert.throws(() => api.set('folderIcons', 'grey'));
  s.runtime.stop();
  assert.equal(win.attributes.has('data-mzt-folder-icons'), false);
});
test('empty fields default to hidden, accept only hide/show, and are restored on disable', async () => {
  const s = setup(); const win = s.windows[0]; await s.runtime.start(); const api = s.Zotero.ModernZoteroThemes;
  assert.equal(win.attributes.get('data-mzt-empty-fields'), 'hide');
  api.set('emptyFields', 'show');
  assert.equal(win.attributes.get('data-mzt-empty-fields'), 'show');
  assert.throws(() => api.set('emptyFields', 'collapse'));
  s.runtime.stop();
  assert.equal(win.attributes.has('data-mzt-empty-fields'), false);
});
test('first built-in view of each library is marked as a section start, in any DOM order', async () => {
  const types = ['library', 'recentlyRead', 'collection', 'collection', 'search', 'publications', 'duplicates',
    'trash', 'separator', 'header', 'group', 'collection', 'duplicates', 'unfiled', 'trash'];
  // Rows appended out of index order, as the virtualized list does after scrolling up.
  const tree = fakeCollectionTree(types, [6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 1, 2, 3, 4, 5]);
  const s = setup([fakeWindow(false, tree)]); await s.runtime.start();
  assert.deepEqual(tree.marked().sort(), ['collection-tree-row-12', 'collection-tree-row-4']);
  // Rows move down by one gap per section start at or before them; the scroll area grows by the total.
  assert.deepEqual([3, 4, 11, 12, 14].map(tree.shift), [undefined, 1, 1, 2, 2]);
  assert.equal(tree.treeStyle.get('--mzt-section-shift-total'), 2);
  types.splice(4, 1, 'collection');
  tree.mutate();
  assert.deepEqual(tree.marked().sort(), ['collection-tree-row-12', 'collection-tree-row-5']);
  s.runtime.stop();
  assert.deepEqual(tree.marked(), []);
  assert.deepEqual([4, 12].map(tree.shift), [undefined, undefined]);
  assert.equal(tree.treeStyle.has('--mzt-section-shift-total'), false);
  assert.equal(tree.observers.size, 0);
});
test('collection icons persist per libraryKey, decorate rows, and clear on reset and disable', async () => {
  const types = ['library', 'collection', 'collection', 'trash'];
  const tree = fakeCollectionTree(types, undefined, { 1: '1/ABCD2345', 2: '1/WXYZ6789' });
  const s = setup([fakeWindow(false, tree)]); await s.runtime.start(); const api = s.Zotero.ModernZoteroThemes;
  api.setCollectionIcon('1/ABCD2345', { icon: 'brain', color: 'teal' });
  api.setCollectionIcon('1/WXYZ6789', { emoji: '📚' });
  assert.deepEqual(JSON.parse(s.prefs.get('extensions.modernZoteroThemes.collectionIcons')),
    { '1/ABCD2345': { icon: 'brain', color: 'teal' }, '1/WXYZ6789': { emoji: '📚' } });
  assert.equal(tree.icon(1).attributes.get('data-mzt-icon'), 'brain');
  assert.equal(tree.icon(1).styleMap.get('--mzt-icon-color'), 'var(--mzt-icon-teal)');
  assert.equal(tree.icon(2).attributes.get('data-mzt-emoji'), '📚');
  assert.equal(tree.icon(3).attributes.size, 0);
  assert.deepEqual(api.collectionIcon('1/ABCD2345'), { icon: 'brain', color: 'teal' });
  for (const [key, entry] of [['../x', { icon: 'brain' }], ['1/ABCD2345', { icon: 'nope' }],
    ['1/ABCD2345', { emoji: 'ab' }], ['1/ABCD2345', { emoji: '📚', color: 'red' }]]) {
    assert.throws(() => api.setCollectionIcon(key, entry));
  }
  api.setCollectionIcon('1/ABCD2345', null);
  assert.equal(tree.icon(1).attributes.has('data-mzt-icon'), false);
  assert.equal(tree.icon(1).styleMap.size, 0);
  s.runtime.stop();
  assert.equal(tree.icon(2).attributes.size, 0);
});
test('corrupt or foreign collection icon prefs are ignored', async () => {
  const tree = fakeCollectionTree(['library', 'collection'], undefined, { 1: '1/ABCD2345' });
  const s = setup([fakeWindow(false, tree)]);
  s.prefs.set('extensions.modernZoteroThemes.collectionIcons', '{"1/ABCD2345":{"icon":"gone"},"bad key":{"icon":"brain"}');
  await s.runtime.start();
  assert.equal(tree.icon(1).attributes.size, 0);
  s.prefs.set('extensions.modernZoteroThemes.collectionIcons', '{"1/ABCD2345":{"icon":"gone"},"bad":{"icon":"brain"},"1/WXYZ6789":{"icon":"star"}}');
  assert.equal(s.Zotero.ModernZoteroThemes.collectionIcon('1/ABCD2345'), null);
  assert.deepEqual(s.Zotero.ModernZoteroThemes.collectionIcon('1/WXYZ6789'), { icon: 'star' });
  s.runtime.stop();
});
test('"Set Icon…" goes after all of Zotero\'s collection menu entries and is removed on disable', async () => {
  // Zotero's buildCollectionContextMenu() maps its options to menu children by index.
  const tree = fakeCollectionTree(['library', 'collection']);
  const native = ['sync', 'newCollection', 'editSelectedCollection', 'moveCollection'].map(id => ({ id }));
  const listeners = new Map();
  tree.menu = { children: [...native], append(...nodes) { this.children.push(...nodes); },
    addEventListener: (k, cb) => listeners.set(k, cb), removeEventListener: k => listeners.delete(k) };
  const s = setup([fakeWindow(false, tree)]); await s.runtime.start();
  assert.deepEqual(tree.menu.children.slice(0, native.length), native);
  assert.deepEqual(tree.menu.children.slice(native.length).map(node => node.localName), ['menuseparator', 'menuitem']);
  assert.equal(tree.menu.children.at(-1).id, 'mzt-set-collection-icon');
  s.runtime.stop();
  assert.deepEqual(tree.menu.children, native);
  assert.equal(listeners.size, 0);
});
