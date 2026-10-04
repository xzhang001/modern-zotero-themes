(function (scope) {
  "use strict";
  scope.MZTCreateRuntime = function ({ Zotero, Services, rootURI, id, version, themes, collectionIcons }) {
    // Gecko caches stylesheets by URL, and an upgraded XPI keeps the same jar: URL, so without a
    // per-startup query the old CSS stays in effect until Zotero restarts.
    const assetQuery = `?v=${encodeURIComponent(version || "dev")}.${Date.now()}`;
    const prefix = "extensions.modernZoteroThemes.";
    const defaults = { mode: "system", theme: "modern-light", lightTheme: "modern-light", darkTheme: "modern-dark", layout: "modern", emptyFields: "hide", folderIcons: "color" };
    const layouts = ["modern", "classic"];
    const emptyFieldModes = ["hide", "show"];
    const folderIconModes = ["color", "mono"];
    const stylesheets = { "mzt-components": "styles/modern.css", "mzt-layout": "styles/layout.css",
      "mzt-collection-icons-sheet": "styles/collection-icons.css" };
    // Custom collection icons: JSON map of Zotero libraryKey ("<libraryID>/<key>") to a validated entry.
    // Local to this profile by design; Zotero has no synced field for it.
    const iconsPref = prefix + "collectionIcons";
    const libraryKeyPattern = /^\d+\/[23456789ABCDEFGHIJKLMNPQRSTUVWXYZ]{8}$/;
    const menuItemID = "mzt-set-collection-icon";
    const rootAttributes = ["data-mzt-theme", "data-mzt-layout", "data-mzt-empty-fields", "data-mzt-folder-icons"];
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
        state.tokens.textContent = themes.css(theme);
        state.iconStyles.textContent = collectionIcons.css(theme.mode);
        win.document.documentElement.setAttribute("data-mzt-theme", theme.id);
        win.document.documentElement.setAttribute("data-mzt-layout",
          layouts.includes(config.layout) ? config.layout : defaults.layout);
        win.document.documentElement.setAttribute("data-mzt-empty-fields",
          emptyFieldModes.includes(config.emptyFields) ? config.emptyFields : defaults.emptyFields);
        win.document.documentElement.setAttribute("data-mzt-folder-icons",
          folderIconModes.includes(config.folderIcons) ? config.folderIcons : defaults.folderIcons);
        markCollectionSections(win);
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
      const anchor = menu.querySelector(".zotero-menuitem-edit-collection");
      if (anchor) anchor.after(item);
      else menu.append(item);
      const selected = () => {
        const treeRow = win.ZoteroPane?.getCollectionTreeRow?.();
        return treeRow?.type === "collection" && libraryKeyPattern.test(treeRow.ref?.libraryKey) ? treeRow : null;
      };
      const showing = event => { if (event.target === menu) item.hidden = !selected(); };
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
        }
      };
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
      windows.set(win, { links, tokens, iconStyles, media, unload, previous, sections, menu });
      root.append(...links, tokens, iconStyles);
      const tree = doc.getElementById?.("zotero-collections-tree");
      if (tree) sections.observe(tree, { childList: true, subtree: true });
      markCollectionSections(win);
      media.addEventListener("change", update);
      win.addEventListener("unload", unload, { once: true });
      update();
    }
    function detach(win) {
      const state = windows.get(win);
      if (!state) return;
      state.media.removeEventListener("change", update);
      win.removeEventListener("unload", state.unload);
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
        const registeredPane = await Zotero.PreferencePanes.register({
          pluginID: id, label: "Modern Themes", src: rootURI + "preferences.xhtml",
          scripts: [rootURI + "preferences.js"], stylesheets: [rootURI + "styles/preferences.css" + assetQuery]
        });
        if (!active) {
          Zotero.PreferencePanes.unregister(registeredPane);
          return;
        }
        paneID = registeredPane;
        for (const win of Zotero.getMainWindows()) attach(win);
      },
      stop() {
        if (!active) return;
        active = false;
        Services.prefs.removeObserver(prefix, observer);
        Services.prefs.removeObserver(appearancePref, observer);
        for (const win of Array.from(windows.keys())) detach(win);
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
