(function (scope) {
  "use strict";
  scope.MZTCreateRuntime = function ({ Zotero, Services, Ci, Cu, rootURI, id, version, themes, collectionIcons, readingProgress }) {
    // Gecko caches stylesheets by URL, and an upgraded XPI keeps the same jar: URL, so without a
    // per-startup query the old CSS stays in effect until Zotero restarts.
    const assetQuery = `?v=${encodeURIComponent(version || "dev")}.${Date.now()}`;
    const prefix = "extensions.modernZoteroThemes.";
    const defaults = { mode: "system", theme: "modern-light", lightTheme: "modern-light", darkTheme: "modern-dark", layout: "modern", emptyFields: "hide", folderIcons: "color", pageTheme: "zotero",
      readingProgress: "show" };
    const layouts = ["modern", "classic"];
    const emptyFieldModes = ["hide", "show"];
    const folderIconModes = ["color", "mono"];
    // Reading page: the theme's own page, Zotero's unthemed page, Zotero's reader setting (Aa menu), or a theme ID.
    const pageModes = ["follow", "original", "zotero"];
    const readingProgressModes = ["show", "hide"];
    const stylesheets = { "mzt-components": "styles/modern.css", "mzt-layout": "styles/layout.css",
      "mzt-collection-icons-sheet": "styles/collection-icons.css" };
    // Custom collection icons: JSON map of Zotero libraryKey ("<libraryID>/<key>") to a validated entry.
    // Local to this profile by design; Zotero has no synced field for it.
    const iconsPref = prefix + "collectionIcons";
    const libraryKeyPattern = /^\d+\/[23456789ABCDEFGHIJKLMNPQRSTUVWXYZ]{8}$/;
    const menuItemID = "mzt-set-collection-icon";
    const rootAttributes = ["data-mzt-theme", "data-mzt-layout", "data-mzt-empty-fields", "data-mzt-folder-icons",
      "data-mzt-zotero-scheme"];
    // Zotero's General → Appearance setting (Zotero 7–10).
    const appearancePref = "browser.theme.toolbar-theme";
    const appearances = { dark: 0, light: 1, auto: 2 };
    // Built-in views that close each library in the collection tree. The modern layout opens a gap with a
    // divider above the first one by shifting that row and every row after it (rows are absolutely
    // positioned by Zotero, so no real space can be inserted). Computed from Zotero's row data because
    // the virtualized list appends rows in scroll order, so DOM neighbours are not reliable.
    const builtInRowTypes = new Set(["search", "publications", "duplicates", "unfiled", "retracted", "trash"]);
    const sectionStartAttribute = "data-mzt-section-start";
    const sectionShiftProperty = "--mzt-section-shift";
    const sectionTotalProperty = "--mzt-section-shift-total";
    const rowIDPrefix = "collection-tree-row-";
    // Reader tabs load reader.html in a <browser> inside the main window, and the PDF view loads viewer.html
    // in a frame inside that; note editors (item pane, reader side pane) load editor.html in an iframe inside
    // <note-editor>. Their stylesheets can't be linked from the plugin (these pages' principal can't load
    // jar:/file: URLs), so the text is read once at startup and injected.
    const frameKinds = {
      "resource://zotero/reader/reader.html": { kind: "reader", file: "styles/reader.css" },
      "resource://zotero/reader/pdf/web/viewer.html": { kind: "viewer", file: "styles/viewer.css" },
      "resource://zotero/note-editor/editor.html": { kind: "note", file: "styles/note.css" }
    };
    // data-mzt-zotero-scheme is Zotero's own light/dark appearance (the main window's prefers-color-scheme,
    // which the plugin's color-scheme doesn't change), not the plugin theme's mode.
    const frameAttributes = ["data-mzt-theme", "data-mzt-layout", "data-mzt-zotero-scheme"];
    const frameCSS = new Map();
    const windows = new Map();
    const subscribers = new Set();
    let paneID;
    let active = false;
    function settings() {
      return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) =>
        [key, Services.prefs.getStringPref(prefix + key, fallback)]));
    }
    function update() {
      for (const [win, state] of windows) {
        if (win.closed) { detach(win); continue; }
        const config = settings();
        const theme = themes.resolve(config, state.media.matches);
        const layout = layouts.includes(config.layout) ? config.layout : defaults.layout;
        state.tokens.textContent = themes.css(theme);
        state.iconStyles.textContent = collectionIcons.css(theme.mode);
        win.document.documentElement.setAttribute("data-mzt-theme", theme.id);
        win.document.documentElement.setAttribute("data-mzt-layout", layout);
        win.document.documentElement.setAttribute("data-mzt-zotero-scheme", state.media.matches ? "dark" : "light");
        win.document.documentElement.setAttribute("data-mzt-empty-fields",
          emptyFieldModes.includes(config.emptyFields) ? config.emptyFields : defaults.emptyFields);
        win.document.documentElement.setAttribute("data-mzt-folder-icons",
          folderIconModes.includes(config.folderIcons) ? config.folderIcons : defaults.folderIcons);
        markCollectionSections(win);
        state.page = pageFor(config, theme);
        state.readingProgress = config.readingProgress !== "hide";
        for (const frameDoc of Array.from(state.frames.keys())) paintFrame(win, frameDoc);
      }
      for (const callback of subscribers) {
        try { callback(); } catch (error) { Zotero.logError(error); }
      }
    }
    function collectionRows(win) {
      const tree = win.document.getElementById?.("zotero-collections-tree");
      return tree ? Array.from(tree.querySelectorAll(`.row[id^="${rowIDPrefix}"]`)) : [];
    }
    function storedIcons() {
      let parsed;
      try { parsed = JSON.parse(Services.prefs.getStringPref(iconsPref, "{}")); }
      catch (error) { return new Map(); }
      const entries = new Map();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return entries;
      for (const [key, value] of Object.entries(parsed)) {
        if (!libraryKeyPattern.test(key)) continue;
        try {
          const entry = collectionIcons.validate(value);
          if (entry) entries.set(key, entry);
        }
        catch (error) { /* Skip entries this version can't show. */ }
      }
      return entries;
    }
    function decorateIcon(row, treeRow, icons) {
      const icon = row.querySelector?.(".cell-icon");
      if (!icon) return;
      const entry = treeRow?.type === "collection" ? icons.get(treeRow.ref?.libraryKey) : null;
      if (entry?.icon) icon.setAttribute("data-mzt-icon", entry.icon);
      else icon.removeAttribute("data-mzt-icon");
      if (entry?.emoji) icon.setAttribute("data-mzt-emoji", entry.emoji);
      else icon.removeAttribute("data-mzt-emoji");
      if (entry?.color) icon.style.setProperty("--mzt-icon-color", `var(--mzt-icon-${entry.color})`);
      else icon.style.removeProperty("--mzt-icon-color");
    }
    function markCollectionSections(win) {
      const view = win.ZoteroPane?.collectionsView;
      const tree = win.document.getElementById?.("zotero-collections-tree");
      if (!view || !tree) return;
      const builtIn = index => builtInRowTypes.has(view.getRow(index)?.type);
      // shifts[i]: section starts at or before row i
      const shifts = [];
      for (let i = 0, shift = 0; i < view.rowCount; i++) {
        if (i > 0 && builtIn(i) && !builtIn(i - 1)) shift++;
        shifts.push(shift);
      }
      tree.style.setProperty(sectionTotalProperty, shifts.length ? shifts[shifts.length - 1] : 0);
      const icons = storedIcons();
      for (const row of collectionRows(win)) {
        const index = Number(row.id.slice(rowIDPrefix.length));
        decorateIcon(row, view.getRow(index), icons);
        const shift = shifts[index] ?? 0;
        row.toggleAttribute(sectionStartAttribute, index > 0 && shift > shifts[index - 1]);
        if (shift) row.style.setProperty(sectionShiftProperty, shift);
        else row.style.removeProperty(sectionShiftProperty);
      }
    }
    // "Set Icon…" in the collection context menu, shown only for collections.
    function addIconMenu(win) {
      const doc = win.document;
      const menu = doc.getElementById?.("zotero-collectionmenu");
      if (!menu || !doc.createXULElement) return null;
      const t = collectionIcons.strings[String(Zotero.locale || "").startsWith("zh") ? "zh" : "en"];
      const item = doc.createXULElement("menuitem");
      item.id = menuItemID;
      item.setAttribute("label", t.menu);
      const separator = doc.createXULElement("menuseparator");
      // Must stay after Zotero's own entries: buildCollectionContextMenu() maps its options to
      // menu.childNodes by index, so anything inserted in between shifts and breaks the whole menu.
      menu.append(separator, item);
      const selected = () => {
        const treeRow = win.ZoteroPane?.getCollectionTreeRow?.();
        return treeRow?.type === "collection" && libraryKeyPattern.test(treeRow.ref?.libraryKey) ? treeRow : null;
      };
      const showing = event => {
        if (event.target !== menu) return;
        item.hidden = separator.hidden = !selected();
      };
      const command = () => {
        const treeRow = selected();
        if (!treeRow) return;
        const key = treeRow.ref.libraryKey;
        const index = win.ZoteroPane.collectionsView.selection?.focused;
        const anchorRow = doc.getElementById(rowIDPrefix + index) || doc.getElementById("zotero-collections-tree");
        collectionIcons.openPicker({
          win, anchor: anchorRow, current: storedIcons().get(key) || null, locale: Zotero.locale,
          onChange: entry => api.setCollectionIcon(key, entry)
        });
      };
      menu.addEventListener("popupshowing", showing);
      item.addEventListener("command", command);
      return {
        remove() {
          menu.removeEventListener("popupshowing", showing);
          item.remove();
          separator.remove();
        }
      };
    }
    // Not Zotero.File.getContentsFromURLAsync: it goes through Zotero.HTTP, which fails to parse jar: URLs
    // containing "@", and an installed XPI is named after the add-on ID. A channel reads them fine.
    function readResource(url) {
      const channel = Services.io.newChannelFromURI(Services.io.newURI(url), null,
        Services.scriptSecurityManager.getSystemPrincipal(), null,
        Ci.nsILoadInfo.SEC_ALLOW_CROSS_ORIGIN_SEC_CONTEXT_IS_NULL, Ci.nsIContentPolicy.TYPE_OTHER);
      return Zotero.File.getContentsAsync(channel, "UTF-8");
    }
    // undefined leaves the page to Zotero's reader setting (the default, also for unknown stored values);
    // null is Zotero's unthemed page.
    function pageFor(config, theme) {
      if (config.pageTheme === "original") return null;
      if (config.pageTheme === "follow") return themes.readerTheme(theme);
      const fixed = themes.themes.find(t => t.id === config.pageTheme);
      return fixed ? themes.readerTheme(fixed) : undefined;
    }
    function paintFrame(win, frameDoc) {
      const state = windows.get(win);
      const frame = state?.frames.get(frameDoc);
      if (!frame) return;
      try {
        frame.tokens.textContent = state.tokens.textContent;
        const source = win.document.documentElement;
        const values = { "data-mzt-theme": source.getAttribute("data-mzt-theme"),
          "data-mzt-layout": source.getAttribute("data-mzt-layout"),
          "data-mzt-zotero-scheme": state.media.matches ? "dark" : "light" };
        for (const name of frameAttributes) frameDoc.documentElement.setAttribute(name, values[name]);
      }
      catch (error) {
        // The tab closed without an unload reaching us; the document is gone.
        state.frames.delete(frameDoc);
        return;
      }
      if (frame.kind === "reader") applyPage(win, frameDoc).catch(error => Zotero.logError(error));
      if (frame.kind === "viewer") syncProgress(state, frame, frameDoc);
    }
    // The page is drawn by Zotero's reader from its light/dark reading theme. Setting them on the reader's
    // state (not Zotero's prefs or its synced custom themes) keeps the user's own reader settings intact;
    // picking a theme in the reader's Aa menu still works until the plugin's page setting changes again.
    async function applyPage(win, frameDoc) {
      const frame = windows.get(win)?.frames.get(frameDoc);
      if (!frame) return;
      const page = windows.get(win).page;
      const key = page === undefined ? "zotero" : JSON.stringify(page);
      if (frame.pageKey === key) return;
      // Matched by browsing context ID: document wrappers seen from this sandbox and from Zotero differ.
      const contextID = frame.frameWin?.browsingContext?.id;
      frame.instance ||= contextID !== undefined
        && Zotero.Reader?._readers?.find(reader => reader._iframe?.browsingContext?.id === contextID);
      if (!frame.instance) return;
      frame.pageKey = key;
      try { await frame.instance._initPromise; }
      catch (error) { return; }
      if (windows.get(win)?.frames.get(frameDoc) !== frame || frame.pageKey !== key) return;
      const reader = frame.instance._internalReader;
      // Zotero versions without reading themes have neither.
      if (typeof reader?._updateState !== "function" || typeof reader.setLightTheme !== "function") return;
      if (page === undefined) {
        if (frame.pageApplied) restorePage(frame);
        return;
      }
      // The whole update object must live in the reader's scope, or its code sees an opaque wrapper.
      reader._updateState(Cu.cloneInto({ lightTheme: page, darkTheme: page }, frame.instance._iframeWindow));
      frame.pageApplied = true;
    }
    // The progress bar sits at the top of the reader's view container that holds this PDF frame.
    function syncProgress(state, frame, frameDoc) {
      if (state.readingProgress && !frame.progress) {
        try {
          const host = frame.frameWin?.frameElement?.parentElement;
          frame.progress = host && readingProgress.attach({ viewerDoc: frameDoc, host, locale: Zotero.locale }) || null;
        }
        catch (error) { Zotero.logError(error); }
      }
      else if (!state.readingProgress && frame.progress) {
        frame.progress.remove();
        frame.progress = null;
      }
    }
    function restorePage(frame) {
      frame.pageApplied = false;
      try {
        const reader = frame.instance._internalReader;
        reader.setLightTheme(Zotero.Prefs.get("reader.lightTheme"));
        reader.setDarkTheme(Zotero.Prefs.get("reader.darkTheme"));
      }
      catch (error) { /* Reader already closed. */ }
    }
    function attachFrame(win, frameDoc) {
      const state = windows.get(win);
      const spec = frameKinds[frameDoc?.documentURI];
      if (!state || !spec || !frameCSS.has(spec.kind) || state.frames.has(frameDoc)) return;
      const parent = frameDoc.head || frameDoc.documentElement;
      if (!parent) return;
      const tokens = frameDoc.createElement("style");
      tokens.id = "mzt-" + spec.kind + "-tokens";
      const sheet = frameDoc.createElement("style");
      sheet.id = "mzt-" + spec.kind;
      sheet.textContent = frameCSS.get(spec.kind);
      const frameWin = frameDoc.defaultView;
      const unload = () => detachFrame(win, frameDoc);
      // A reader tab with its sheet draws its own card edge (reader.css); the <browser>'s border steps aside.
      const host = spec.kind === "reader"
        ? Array.from(win.document.querySelectorAll?.("browser.reader") || []).find(browser => browser.contentDocument === frameDoc)
        : null;
      host?.setAttribute("data-mzt-framed", "true");
      state.frames.set(frameDoc, { kind: spec.kind, sheet, tokens, frameWin, unload, host });
      // After the page's own sheet, so equal-specificity rules resolve to the theme; the plugin sheet last
      // so its layout-specific overrides beat the shared tokens.
      parent.append(tokens, sheet);
      frameWin?.addEventListener("unload", unload, { once: true });
      paintFrame(win, frameDoc);
      // PDF views already open inside a reader that was open before the plugin started.
      for (const frame of frameDoc.querySelectorAll?.("iframe") || []) attachFrame(win, frame.contentDocument);
    }
    function detachFrame(win, frameDoc, { restore = false } = {}) {
      const state = windows.get(win);
      const frame = state?.frames.get(frameDoc);
      if (!frame) return;
      state.frames.delete(frameDoc);
      if (restore && frame.pageApplied) restorePage(frame);
      frame.progress?.remove();
      try {
        frame.host?.removeAttribute("data-mzt-framed");
        frame.frameWin?.removeEventListener("unload", frame.unload);
        frame.sheet.remove();
        frame.tokens.remove();
        for (const name of frameAttributes) frameDoc.documentElement.removeAttribute(name);
      }
      catch (error) { /* Already unloaded. */ }
    }
    function attach(win) {
      if (!active || windows.has(win) || win.closed) return;
      const doc = win.document;
      const root = doc.documentElement;
      const links = Object.entries(stylesheets).map(([linkID, path]) => {
        const link = doc.createElementNS("http://www.w3.org/1999/xhtml", "link");
        link.id = linkID;
        link.rel = "stylesheet";
        link.href = rootURI + path + assetQuery;
        return link;
      });
      const tokens = doc.createElementNS("http://www.w3.org/1999/xhtml", "style");
      tokens.id = "mzt-tokens";
      const iconStyles = doc.createElementNS("http://www.w3.org/1999/xhtml", "style");
      iconStyles.id = "mzt-collection-icons";
      const media = win.matchMedia("(prefers-color-scheme: dark)");
      const unload = () => detach(win);
      const previous = Object.fromEntries(rootAttributes.map(name => [name, root.getAttribute(name)]));
      const sections = new win.MutationObserver(() => markCollectionSections(win));
      const menu = addIconMenu(win);
      // DOMContentLoaded from reader tabs (and frames inside them) reaches the main window, as Zotero's own
      // reader listener relies on.
      const frameLoaded = event => attachFrame(win, event.target);
      windows.set(win, { links, tokens, iconStyles, media, unload, previous, sections, menu, frameLoaded, frames: new Map() });
      root.append(...links, tokens, iconStyles);
      const tree = doc.getElementById?.("zotero-collections-tree");
      if (tree) sections.observe(tree, { childList: true, subtree: true });
      markCollectionSections(win);
      media.addEventListener("change", update);
      win.addEventListener("unload", unload, { once: true });
      win.addEventListener("DOMContentLoaded", frameLoaded, true);
      update();
      // Reader tabs and note editors that were already open when the plugin started.
      for (const browser of doc.querySelectorAll?.("browser.reader") || []) attachFrame(win, browser.contentDocument);
      for (const frame of doc.querySelectorAll?.("note-editor #editor-view") || []) attachFrame(win, frame.contentDocument);
    }
    function detach(win) {
      const state = windows.get(win);
      if (!state) return;
      state.media.removeEventListener("change", update);
      win.removeEventListener("unload", state.unload);
      win.removeEventListener("DOMContentLoaded", state.frameLoaded, true);
      for (const frameDoc of Array.from(state.frames.keys())) detachFrame(win, frameDoc, { restore: true });
      state.sections.disconnect();
      for (const row of collectionRows(win)) {
        row.removeAttribute(sectionStartAttribute);
        row.style.removeProperty(sectionShiftProperty);
      }
      win.document.getElementById?.("zotero-collections-tree")?.style.removeProperty(sectionTotalProperty);
      for (const row of collectionRows(win)) decorateIcon(row, null, new Map());
      state.menu?.remove();
      win.document.getElementById?.("mzt-icon-picker")?.hidePopup?.();
      for (const link of state.links) link.remove();
      state.tokens.remove();
      state.iconStyles.remove();
      const root = win.document.documentElement;
      for (const [name, value] of Object.entries(state.previous)) {
        if (value === null) root.removeAttribute(name);
        else root.setAttribute(name, value);
      }
      windows.delete(win);
    }
    const observer = { observe: update };
    const api = {
      themes: themes.themes,
      settings,
      set(key, value) {
        if (!active) return;
        if (!Object.prototype.hasOwnProperty.call(defaults, key)) throw new Error("Unknown setting");
        if (key === "mode") {
          if (!["fixed", "system"].includes(value)) throw new Error("Invalid mode");
        }
        else if (key === "layout") {
          if (!layouts.includes(value)) throw new Error("Invalid layout");
        }
        else if (key === "emptyFields") {
          if (!emptyFieldModes.includes(value)) throw new Error("Invalid empty field mode");
        }
        else if (key === "folderIcons") {
          if (!folderIconModes.includes(value)) throw new Error("Invalid folder icon mode");
        }
        else if (key === "readingProgress") {
          if (!readingProgressModes.includes(value)) throw new Error("Invalid reading progress mode");
        }
        else if (key === "pageTheme") {
          if (!pageModes.includes(value) && !themes.themes.some(t => t.id === value)) throw new Error("Invalid page theme");
        }
        else {
          const theme = themes.themes.find(t => t.id === value);
          if (!theme || (key === "lightTheme" && theme.mode !== "light")
            || (key === "darkTheme" && theme.mode !== "dark")) throw new Error("Invalid theme");
        }
        Services.prefs.setStringPref(prefix + key, value);
      },
      collectionIcon(libraryKey) {
        return storedIcons().get(libraryKey) || null;
      },
      // entry: { icon, color } or { emoji }; null restores Zotero's folder icon.
      setCollectionIcon(libraryKey, entry) {
        if (!active) return;
        if (!libraryKeyPattern.test(libraryKey)) throw new Error("Invalid collection");
        const normalized = collectionIcons.validate(entry);
        const icons = storedIcons();
        if (normalized) icons.set(libraryKey, normalized);
        else icons.delete(libraryKey);
        Services.prefs.setStringPref(iconsPref, JSON.stringify(Object.fromEntries(icons)));
      },
      zoteroAppearance() {
        const value = Services.prefs.getIntPref(appearancePref, appearances.auto);
        return Object.keys(appearances).find(key => appearances[key] === value) || "auto";
      },
      // Only called from an explicit button in the settings pane; never changed on the user's behalf.
      setZoteroAppearance(value) {
        if (!active) return;
        if (!Object.prototype.hasOwnProperty.call(appearances, value)) throw new Error("Invalid appearance");
        Services.prefs.setIntPref(appearancePref, appearances[value]);
      },
      subscribe(callback) { subscribers.add(callback); return () => subscribers.delete(callback); }
    };
    return {
      attach, detach,
      async start() {
        if (active) return;
        active = true;
        Zotero.ModernZoteroThemes = api;
        Services.prefs.addObserver(prefix, observer);
        Services.prefs.addObserver(appearancePref, observer);
        // Without them reader tabs just keep Zotero's look; the rest of the plugin still starts.
        const loadingFrameCSS = Promise.all(Object.values(frameKinds).map(spec =>
          (async () => readResource(rootURI + spec.file))()
            .then(css => typeof css === "string" && frameCSS.set(spec.kind, css))
            .catch(error => Zotero.logError(error))));
        const registeredPane = await Zotero.PreferencePanes.register({
          pluginID: id, label: "Modern Themes", src: rootURI + "preferences.xhtml",
          scripts: [rootURI + "preferences.js"], stylesheets: [rootURI + "styles/preferences.css" + assetQuery]
        });
        if (!active) {
          Zotero.PreferencePanes.unregister(registeredPane);
          return;
        }
        paneID = registeredPane;
        await loadingFrameCSS;
        if (!active) return;
        for (const win of Zotero.getMainWindows()) attach(win);
      },
      stop() {
        if (!active) return;
        active = false;
        Services.prefs.removeObserver(prefix, observer);
        Services.prefs.removeObserver(appearancePref, observer);
        for (const win of Array.from(windows.keys())) detach(win);
        frameCSS.clear();
        if (Zotero.ModernZoteroThemes === api) delete Zotero.ModernZoteroThemes;
        // Let open settings panes release callbacks and disable their controls.
        for (const callback of subscribers) {
          try { callback(); } catch (error) { Zotero.logError(error); }
        }
        subscribers.clear();
        if (paneID && Zotero.PreferencePanes.unregister) Zotero.PreferencePanes.unregister(paneID);
        paneID = null;
      }
    };
  };
  if (typeof module !== "undefined") module.exports = scope.MZTCreateRuntime;
})(this);
