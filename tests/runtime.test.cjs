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
      readerBrowsers: [],
      querySelectorAll(selector) { return selector === 'browser.reader' ? this.readerBrowsers : []; },
      createElementNS() { return { remove() { children.splice(children.indexOf(this), 1); } }; }
    },
    matchMedia() { return media; },
    addEventListener(name, cb) { events.set(name, cb); },
    removeEventListener(name) { events.delete(name); }
  };
}
// A reader tab's document (resource://zotero/reader/reader.html) as seen from the main window.
let nextContextID = 1;
function fakeReaderDocument(uri = 'resource://zotero/reader/reader.html', frames = []) {
  const head = [];
  const attributes = new Map();
  const events = new Map();
  return {
    head: { append(...nodes) { head.push(...nodes); }, children: head },
    attributes, events, documentURI: uri,
    querySelectorAll: selector => (selector === 'iframe' ? frames.map(contentDocument => ({ contentDocument })) : []),
    documentElement: {
      setAttribute: (k, v) => attributes.set(k, v), removeAttribute: k => attributes.delete(k),
      getAttribute: k => attributes.get(k) ?? null
    },
    defaultView: {
      browsingContext: { id: nextContextID++ },
      addEventListener: (name, cb) => events.set(name, cb),
      removeEventListener: (name, cb) => { if (events.get(name) === cb) events.delete(name); }
    },
    createElement(tag) {
      return { localName: tag, textContent: '', remove() { head.splice(head.indexOf(this), 1); } };
    }
  };
}
// Zotero's ReaderTab for a reader document, with the internal reader's theme state.
function fakeReaderInstance(doc) {
  const calls = [];
  const internal = {
    _state: { lightTheme: null, darkTheme: { id: 'dark' } },
    _updateState(update) { calls.push(['update', update]); Object.assign(this._state, update); },
    setLightTheme(id) { calls.push(['light', id]); this._state.lightTheme = id ? { id } : null; },
    setDarkTheme(id) { calls.push(['dark', id]); this._state.darkTheme = id ? { id } : null; }
  };
  return { calls, internal, _iframe: { browsingContext: { id: doc.defaultView.browsingContext.id } },
    _iframeWindow: {}, _initPromise: Promise.resolve(), _internalReader: internal };
}
const settle = () => new Promise(resolve => setImmediate(resolve));
function setup(windows = [fakeWindow()], { readingProgress } = {}) {
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
  },
  io: { newURI: spec => ({ spec }), newChannelFromURI: uri => ({ uri: uri.spec }) },
  scriptSecurityManager: { getSystemPrincipal: () => ({}) } };
  const Ci = { nsILoadInfo: { SEC_ALLOW_CROSS_ORIGIN_SEC_CONTEXT_IS_NULL: 32 }, nsIContentPolicy: { TYPE_OTHER: 1 } };
  const Zotero = {
    getMainWindows: () => windows, logError: error => { throw error; },
    File: { async getContentsAsync(channel, charset) {
      assert.equal(charset, 'UTF-8');
      const file = channel.uri.match(/^jar:file:\/\/\/plugin\.xpi!\/styles\/(reader|viewer)\.css$/)?.[1];
      if (!file) throw new Error('Unexpected URL ' + channel.uri);
      return `/* ${file} */`;
    } },
    Reader: { _readers: [] },
    // Zotero's own reading theme prefs, which the plugin only reads.
    Prefs: { get: key => ({ 'reader.lightTheme': false, 'reader.darkTheme': 'dark' })[key] },
    PreferencePanes: {
      async register(options) { panes.set('pane', options); return 'pane'; },
      unregister(id) { panes.delete(id); }
    }
  };
  return { windows, prefs, observers, panes, Zotero, runtime: createRuntime({
    Zotero, Services, Ci, Cu: { cloneInto: value => structuredClone(value) }, rootURI: 'jar:file:///plugin.xpi!/', id: 'test', version: '1.2.3', themes, collectionIcons,
    readingProgress
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
test('reader tabs get the reader sheet and theme tokens, follow settings, and are cleaned up', async () => {
  const win = fakeWindow();
  const early = fakeReaderDocument();
  // A reader tab already open before the plugin starts; one still on about:blank is picked up on load.
  win.document.readerBrowsers.push({ contentDocument: early }, { contentDocument: fakeReaderDocument('about:blank') });
  const s = setup([win]); await s.runtime.start(); const api = s.Zotero.ModernZoteroThemes;
  assert.deepEqual(early.head.children.map(node => node.id), ['mzt-reader-tokens', 'mzt-reader']);
  assert.equal(early.head.children[1].textContent, '/* reader */');
  assert.match(early.head.children[0].textContent, /--mzt-accent: #6554c0/);
  assert.equal(early.attributes.get('data-mzt-theme'), 'modern-light');
  assert.equal(early.attributes.get('data-mzt-layout'), 'modern');
  // Zotero's own appearance, which reader page views are pinned to, not the plugin theme's mode.
  assert.equal(early.attributes.get('data-mzt-zotero-scheme'), 'light');
  assert.equal(win.attributes.get('data-mzt-zotero-scheme'), 'light');

  const opened = fakeReaderDocument();
  win.events.get('DOMContentLoaded')({ target: opened });
  win.events.get('DOMContentLoaded')({ target: opened });
  assert.equal(opened.head.children.length, 2);
  // The PDF view inside a reader gets its own sheet; other documents are left alone.
  const view = fakeReaderDocument('resource://zotero/reader/pdf/web/viewer.html');
  win.events.get('DOMContentLoaded')({ target: view });
  assert.deepEqual(view.head.children.map(node => [node.id, node.textContent.slice(0, 12)]),
    [['mzt-viewer-tokens', '@media (forc'], ['mzt-viewer', '/* viewer */']]);
  const other = fakeReaderDocument('resource://zotero/note-editor/note-editor.html');
  win.events.get('DOMContentLoaded')({ target: other });
  assert.equal(other.head.children.length, 0);

  api.set('theme', 'modern-dark'); api.set('mode', 'fixed'); api.set('layout', 'classic');
  for (const doc of [early, opened]) {
    assert.equal(doc.attributes.get('data-mzt-theme'), 'modern-dark');
    assert.equal(doc.attributes.get('data-mzt-zotero-scheme'), 'light');
    assert.equal(doc.attributes.get('data-mzt-layout'), 'classic');
    assert.match(doc.head.children[0].textContent, /color-scheme: dark/);
  }

  // Closing a tab drops its document; settings changes afterwards don't touch it.
  opened.events.get('unload')();
  assert.equal(opened.head.children.length, 0);
  api.set('layout', 'modern');
  assert.equal(opened.attributes.has('data-mzt-layout'), false);
  assert.equal(early.attributes.get('data-mzt-layout'), 'modern');

  s.runtime.stop();
  assert.equal(early.head.children.length, 0);
  assert.equal(early.attributes.size, 0);
  assert.equal(early.events.size, 0);
  assert.equal(win.events.size, 0);
});
test('a reader sheet that fails to load leaves reader tabs alone but the plugin still starts', async () => {
  const win = fakeWindow();
  const s = setup([win]);
  const errors = [];
  s.Zotero.logError = error => errors.push(error);
  s.Zotero.File.getContentsAsync = () => { throw new Error('missing'); };
  await s.runtime.start();
  const reader = fakeReaderDocument();
  win.events.get('DOMContentLoaded')({ target: reader });
  assert.equal(reader.head.children.length, 0);
  assert.equal(win.attributes.get('data-mzt-theme'), 'modern-light');
  assert.equal(errors.length, 2);
  s.runtime.stop();
});
test('reading page is Zotero\'s by default and can follow the theme, be fixed or original', async () => {
  const win = fakeWindow();
  const s = setup([win]); await s.runtime.start(); const api = s.Zotero.ModernZoteroThemes;
  const doc = fakeReaderDocument();
  const reader = fakeReaderInstance(doc);
  s.Zotero.Reader._readers.push(reader);
  win.events.get('DOMContentLoaded')({ target: doc });
  await settle();
  // By default theme changes leave the page alone.
  assert.equal(api.settings().pageTheme, 'zotero');
  api.set('theme', 'catppuccin-frappe'); api.set('mode', 'fixed'); await settle();
  assert.deepEqual(reader.calls, []);
  api.set('theme', 'modern-light');
  api.set('pageTheme', 'follow'); await settle();
  const page = { id: 'mzt-modern-light', label: 'Modern Light', background: '#ffffff', foreground: '#24252b' };
  assert.deepEqual(reader.internal._state.lightTheme, page);
  assert.deepEqual(reader.internal._state.darkTheme, page);

  // Unrelated setting changes don't redraw the page.
  const updates = () => reader.calls.filter(([kind]) => kind === 'update').length;
  api.set('layout', 'classic'); await settle();
  assert.equal(updates(), 1);

  api.set('theme', 'catppuccin-latte'); await settle();
  assert.equal(reader.internal._state.lightTheme.id, 'mzt-catppuccin-latte');
  api.set('pageTheme', 'catppuccin-frappe'); await settle();
  assert.deepEqual(reader.internal._state.darkTheme,
    { id: 'mzt-catppuccin-frappe', label: 'Catppuccin Frappé', background: '#303446', foreground: '#c6d0f5' });
  api.set('pageTheme', 'original'); await settle();
  assert.equal(reader.internal._state.lightTheme, null);
  assert.equal(reader.internal._state.darkTheme, null);

  // Zotero's reading theme prefs come back; they were never written.
  api.set('pageTheme', 'zotero'); await settle();
  assert.deepEqual(reader.calls.slice(-2), [['light', false], ['dark', 'dark']]);
  assert.equal(reader.internal._state.darkTheme.id, 'dark');

  for (const value of ['sepia', '', '__proto__']) assert.throws(() => api.set('pageTheme', value));
  // A stored value this version doesn't know (e.g. a removed theme) also leaves the page to Zotero.
  api.set('pageTheme', 'original'); await settle();
  s.prefs.set('extensions.modernZoteroThemes.pageTheme', 'removed-theme');
  api.set('layout', 'modern'); await settle();
  assert.deepEqual(reader.calls.slice(-2), [['light', false], ['dark', 'dark']]);
  s.runtime.stop();
});
test('disabling restores Zotero\'s reading page; closed tabs and readers without themes are skipped', async () => {
  const win = fakeWindow();
  const s = setup([win]); await s.runtime.start();
  s.Zotero.ModernZoteroThemes.set('pageTheme', 'follow');
  const open = fakeReaderDocument(), closed = fakeReaderDocument(), legacy = fakeReaderDocument();
  const openReader = fakeReaderInstance(open), closedReader = fakeReaderInstance(closed), legacyReader = fakeReaderInstance(legacy);
  // Zotero 7.0 has no reading themes.
  delete legacyReader.internal.setLightTheme;
  s.Zotero.Reader._readers.push(openReader, closedReader, legacyReader);
  for (const doc of [open, closed, legacy]) win.events.get('DOMContentLoaded')({ target: doc });
  await settle();
  assert.equal(legacyReader.calls.length, 0);
  closed.events.get('unload')();
  const closedCalls = closedReader.calls.length;
  s.runtime.stop();
  assert.deepEqual(openReader.calls.slice(-2), [['light', false], ['dark', 'dark']]);
  assert.equal(closedReader.calls.length, closedCalls);
  assert.equal(legacyReader.calls.length, 0);
});
test('a reader opened before the plugin starts gets its PDF view styled too', async () => {
  const win = fakeWindow();
  const view = fakeReaderDocument('resource://zotero/reader/pdf/web/viewer.html');
  win.document.readerBrowsers.push({ contentDocument: fakeReaderDocument(undefined, [view]) });
  const s = setup([win]); await s.runtime.start();
  assert.equal(view.head.children.at(-1).id, 'mzt-viewer');
  assert.equal(view.attributes.get('data-mzt-layout'), 'modern');
  s.runtime.stop();
  assert.equal(view.head.children.length, 0);
});
test('PDF views get a reading progress bar that follows the setting and is removed with the view', async () => {
  const bars = [];
  const readingProgress = { attach: ({ viewerDoc, host, locale }) => {
    const bar = { viewerDoc, host, locale, removed: false, remove() { this.removed = true; } };
    bars.push(bar);
    return bar;
  } };
  const win = fakeWindow();
  const s = setup([win], { readingProgress }); s.Zotero.locale = 'zh-CN';
  await s.runtime.start(); const api = s.Zotero.ModernZoteroThemes;
  const host = { id: 'primary-view' };
  const view = fakeReaderDocument('resource://zotero/reader/pdf/web/viewer.html');
  view.defaultView.frameElement = { parentElement: host };
  win.events.get('DOMContentLoaded')({ target: view });
  assert.equal(api.settings().readingProgress, 'show');
  assert.equal(bars.length, 1);
  assert.equal(bars[0].host, host);
  assert.equal(bars[0].locale, 'zh-CN');
  // Readers themselves don't get one; only their PDF views do.
  win.events.get('DOMContentLoaded')({ target: fakeReaderDocument() });
  assert.equal(bars.length, 1);

  api.set('layout', 'classic');
  assert.equal(bars.length, 1);
  api.set('readingProgress', 'hide');
  assert.equal(bars[0].removed, true);
  api.set('readingProgress', 'show');
  assert.equal(bars.length, 2);
  assert.throws(() => api.set('readingProgress', 'auto'));

  view.events.get('unload')();
  assert.equal(bars[1].removed, true);
  const second = fakeReaderDocument('resource://zotero/reader/pdf/web/viewer.html');
  second.defaultView.frameElement = { parentElement: host };
  win.events.get('DOMContentLoaded')({ target: second });
  s.runtime.stop();
  assert.equal(bars[2].removed, true);
});
