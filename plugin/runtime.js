(function (scope) {
  "use strict";
  scope.MZTCreateRuntime = function ({ Zotero, Services, rootURI, id, themes }) {
    const prefix = "extensions.modernZoteroThemes.";
    const defaults = { mode: "system", theme: "modern-light", lightTheme: "modern-light", darkTheme: "modern-dark", layout: "modern", emptyFields: "hide", folderIcons: "color" };
    const layouts = ["modern", "classic"];
    const emptyFieldModes = ["hide", "show"];
    const folderIconModes = ["color", "mono"];
    const stylesheets = { "mzt-components": "styles/modern.css", "mzt-layout": "styles/layout.css" };
    const rootAttributes = ["data-mzt-theme", "data-mzt-layout", "data-mzt-empty-fields", "data-mzt-folder-icons"];
    // Zotero's General → Appearance setting (Zotero 7–10).
    const appearancePref = "browser.theme.toolbar-theme";
    const appearances = { dark: 0, light: 1, auto: 2 };
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
        win.document.documentElement.setAttribute("data-mzt-theme", theme.id);
        win.document.documentElement.setAttribute("data-mzt-layout",
          layouts.includes(config.layout) ? config.layout : defaults.layout);
        win.document.documentElement.setAttribute("data-mzt-empty-fields",
          emptyFieldModes.includes(config.emptyFields) ? config.emptyFields : defaults.emptyFields);
        win.document.documentElement.setAttribute("data-mzt-folder-icons",
          folderIconModes.includes(config.folderIcons) ? config.folderIcons : defaults.folderIcons);
      }
      for (const callback of subscribers) {
        try { callback(); } catch (error) { Zotero.logError(error); }
      }
    }
    function attach(win) {
      if (!active || windows.has(win) || win.closed) return;
      const doc = win.document;
      const root = doc.documentElement;
      const links = Object.entries(stylesheets).map(([linkID, path]) => {
        const link = doc.createElementNS("http://www.w3.org/1999/xhtml", "link");
        link.id = linkID;
        link.rel = "stylesheet";
        link.href = rootURI + path;
        return link;
      });
      const tokens = doc.createElementNS("http://www.w3.org/1999/xhtml", "style");
      tokens.id = "mzt-tokens";
      const media = win.matchMedia("(prefers-color-scheme: dark)");
      const unload = () => detach(win);
      const previous = Object.fromEntries(rootAttributes.map(name => [name, root.getAttribute(name)]));
      windows.set(win, { links, tokens, media, unload, previous });
      root.append(...links, tokens);
      media.addEventListener("change", update);
      win.addEventListener("unload", unload, { once: true });
      update();
    }
    function detach(win) {
      const state = windows.get(win);
      if (!state) return;
      state.media.removeEventListener("change", update);
      win.removeEventListener("unload", state.unload);
      for (const link of state.links) link.remove();
      state.tokens.remove();
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
          scripts: [rootURI + "preferences.js"], stylesheets: [rootURI + "styles/preferences.css"]
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
