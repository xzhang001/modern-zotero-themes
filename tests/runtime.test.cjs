const { test } = require('node:test');
const assert = require('node:assert/strict');
const createRuntime = require('../plugin/runtime.js');
const themes = require('../plugin/themes.js');

function fakeWindow(dark = false) {
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
    document: {
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
    Zotero, Services, rootURI: 'jar:file:///plugin.xpi!/', id: 'test', themes
  }) };
}
test('startup and repeated attach load exactly one set of styles per window', async () => {
  const s = setup(); await s.runtime.start();
  s.runtime.attach(s.windows[0]);
  assert.equal(s.windows[0].children.length, 3);
  assert.deepEqual(s.windows[0].children.slice(0, 2).map(link => link.href),
    ['jar:file:///plugin.xpi!/styles/modern.css', 'jar:file:///plugin.xpi!/styles/layout.css']);
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
  assert.equal(scope.MZTThemes.themes.length, 3);
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
