/* Custom collection icons: a vendored Lucide subset (lucide-static 1.52.0, ISC; see THIRD_PARTY_NOTICES.md),
   icon colors, entry validation, generated CSS, and the picker panel. Shared by Zotero and tests. */
(function (scope) {
  "use strict";
  // Inner SVG markup on Lucide's 24x24 stroke grid; drawn as CSS masks so the color follows the theme.
  const icons = Object.freeze({
    "folder": '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    "book-open": '<path d="M12 5v16"/> <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/>',
    "bookmark": '<path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>',
    "library": '<path d="m16 6 4 14"/> <path d="M12 6v14"/> <path d="M8 8v12"/> <path d="M4 4v16"/>',
    "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/> <path d="M22 10v6"/> <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    "file-text": '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/> <path d="M14 2v5a1 1 0 0 0 1 1h5"/> <path d="M10 9H8"/> <path d="M16 13H8"/> <path d="M16 17H8"/>',
    "pencil": '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/> <path d="m15 5 4 4"/>',
    "archive": '<rect width="20" height="5" x="2" y="3" rx="1"/> <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/> <path d="M10 12h4"/>',
    "inbox": '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/> <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    "flask-conical": '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/> <path d="M6.453 15h11.094"/> <path d="M8.5 2h7"/>',
    "microscope": '<path d="M6 18h8"/> <path d="M3 22h18"/> <path d="M14 22a7 7 0 1 0 0-14h-1"/> <path d="M9 14h2"/> <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/> <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
    "atom": '<circle cx="12" cy="12" r="1"/> <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/> <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>',
    "brain": '<path d="M12 18V5"/> <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/> <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/> <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/> <path d="M18 18a4 4 0 0 0 2-7.464"/> <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/> <path d="M6 18a4 4 0 0 1-2-7.464"/> <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/>',
    "cpu": '<path d="M12 20v2"/> <path d="M12 2v2"/> <path d="M17 20v2"/> <path d="M17 2v2"/> <path d="M2 12h2"/> <path d="M2 17h2"/> <path d="M2 7h2"/> <path d="M20 12h2"/> <path d="M20 17h2"/> <path d="M20 7h2"/> <path d="M7 20v2"/> <path d="M7 2v2"/> <rect x="4" y="4" width="16" height="16" rx="2"/> <rect x="8" y="8" width="8" height="8" rx="1"/>',
    "code": '<path d="m16 18 6-6-6-6"/> <path d="m8 6-6 6 6 6"/>',
    "database": '<ellipse cx="12" cy="5" rx="9" ry="3"/> <path d="M3 5V19A9 3 0 0 0 21 19V5"/> <path d="M3 12A9 3 0 0 0 21 12"/>',
    "chart-line": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/> <path d="m19 9-5 5-4-4-3 3"/>',
    "sigma": '<path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/>',
    "globe": '<circle cx="12" cy="12" r="10"/> <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/> <path d="M2 12h20"/>',
    "leaf": '<path d="M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20"/> <path d="M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/> <path d="M16 3.128a4 4 0 0 1 0 7.744"/> <path d="M22 21v-2a4 4 0 0 0-3-3.87"/> <circle cx="9" cy="7" r="4"/>',
    "briefcase": '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/> <rect width="20" height="14" x="2" y="6" rx="2"/>',
    "layers": '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/> <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/> <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    "puzzle": '<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>',
    "lightbulb": '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/> <path d="M9 18h6"/> <path d="M10 22h4"/>',
    "rocket": '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/> <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/> <path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/> <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/>',
    "star": '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    "heart": '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
    "flag": '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>',
    "tag": '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/> <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    "clock": '<circle cx="12" cy="12" r="10"/> <path d="M12 6v6l4 2"/>',
    "calendar": '<path d="M8 2v3"/> <path d="M16 2v3"/> <rect x="3" y="3" width="18" height="18" rx="2"/> <path d="M3 9h18"/>',
    "circle-check": '<circle cx="12" cy="12" r="10"/> <path d="m16 9-5.5 5.5L8 12"/>',
    "circle-alert": '<circle cx="12" cy="12" r="10"/> <line x1="12" x2="12" y1="8" y2="12"/> <line x1="12" x2="12.01" y1="16" y2="16"/>'
  });
  // Tuned per theme mode for at least 3:1 against card, canvas and sidebar surfaces (see tests).
  const colors = Object.freeze({
    red: { light: "#d33a3a", dark: "#ff8a8a" },
    orange: { light: "#c3591d", dark: "#ffa36b" },
    yellow: { light: "#a06f00", dark: "#f0c24e" },
    green: { light: "#2a894b", dark: "#62d48c" },
    teal: { light: "#16808e", dark: "#5ccbd8" },
    blue: { light: "#3866d6", dark: "#82a8ff" },
    purple: { light: "#7d47cc", dark: "#bc9cff" },
    pink: { light: "#c63c74", dark: "#ff93c2" }
  });
  const emoji = Object.freeze(["📚", "📖", "📝", "📌", "🔖", "🗂️", "🔬", "🧪", "🧠", "💻", "📊", "📈",
    "🧮", "🌍", "🎓", "💡", "🎯", "🚀", "⭐", "🔥", "❤️", "✅", "⏳", "🧩"]);
  const strings = {
    en: { menu: "Set Icon…", title: "Icon", emoji: "Emoji", emojiPlaceholder: "Type or paste an emoji",
      color: "Color", defaultColor: "Default", reset: "Restore default", note: "Saved on this computer only." },
    zh: { menu: "设置图标…", title: "图标", emoji: "Emoji", emojiPlaceholder: "输入或粘贴一个 emoji",
      color: "颜色", defaultColor: "默认", reset: "恢复默认图标", note: "图标设置只保存在这台电脑上。" }
  };
  const colorNames = { en: { red: "Red", orange: "Orange", yellow: "Yellow", green: "Green", teal: "Teal",
    blue: "Blue", purple: "Purple", pink: "Pink" },
  zh: { red: "红", orange: "橙", yellow: "黄", green: "绿", teal: "青", blue: "蓝", purple: "紫", pink: "粉" } };

  function firstGrapheme(text) {
    const value = String(text || "").trim();
    if (!value) return "";
    const segment = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value)[Symbol.iterator]().next();
    return segment.done ? "" : segment.value.segment;
  }
  // Returns a normalized entry, or null when nothing custom is left. Throws on invalid input.
  function validate(entry) {
    if (entry === null || entry === undefined) return null;
    if (typeof entry !== "object" || Array.isArray(entry)) throw new Error("Invalid icon entry");
    const result = {};
    if (entry.icon !== undefined && entry.icon !== null) {
      if (!Object.prototype.hasOwnProperty.call(icons, entry.icon)) throw new Error("Unknown icon");
      result.icon = entry.icon;
    }
    if (entry.emoji !== undefined && entry.emoji !== null && entry.emoji !== "") {
      const grapheme = firstGrapheme(entry.emoji);
      // A single emoji grapheme: no letters, digits, whitespace or ASCII punctuation.
      if (!grapheme || grapheme.length > 16 || /[\p{L}\p{N}\s\x00-\x7f]/u.test(grapheme)) throw new Error("Invalid emoji");
      result.emoji = grapheme;
    }
    if (result.icon && result.emoji) throw new Error("Choose either an icon or an emoji");
    if (entry.color !== undefined && entry.color !== null) {
      if (!Object.prototype.hasOwnProperty.call(colors, entry.color)) throw new Error("Unknown color");
      if (!result.icon) throw new Error("Colors apply to line icons only");
      result.color = entry.color;
    }
    return Object.keys(result).length ? result : null;
  }
  function maskURL(name) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" `
      + `stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }
  // Per-window rules: icon masks plus the color set for the active theme's light/dark mode.
  function css(mode) {
    const masks = Object.keys(icons).map(name =>
      `[data-mzt-icon="${name}"] { --mzt-icon-mask: ${maskURL(name)}; }`);
    const palette = Object.entries(colors).map(([name, value]) => `--mzt-icon-${name}: ${value[mode === "dark" ? "dark" : "light"]};`);
    return `:root[data-mzt-theme] { ${palette.join(" ")} }\n${masks.join("\n")}`;
  }

  // Picker panel anchored to a collection row; every click applies immediately through onChange.
  function openPicker({ win, anchor, current, locale, onChange }) {
    const doc = win.document;
    const t = strings[String(locale || "").startsWith("zh") ? "zh" : "en"];
    const names = colorNames[String(locale || "").startsWith("zh") ? "zh" : "en"];
    doc.getElementById("mzt-icon-picker")?.remove();
    const html = (tag, className, text) => {
      const node = doc.createElementNS("http://www.w3.org/1999/xhtml", tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };
    let state = current ? { ...current } : {};
    const panel = doc.createXULElement("panel");
    panel.id = "mzt-icon-picker";
    panel.setAttribute("type", "arrow");
    const root = html("div", "mzt-picker");
    const iconGrid = html("div", "mzt-picker-grid");
    const emojiGrid = html("div", "mzt-picker-grid");
    const colorRow = html("div", "mzt-picker-colors");
    const input = html("input", "mzt-picker-input");
    input.placeholder = t.emojiPlaceholder;
    const choose = next => {
      let entry;
      try { entry = validate(next); }
      catch (error) { input.setAttribute("aria-invalid", "true"); return; }
      input.removeAttribute("aria-invalid");
      state = entry || {};
      onChange(entry);
      render();
    };
    for (const name of Object.keys(icons)) {
      const button = html("button", "mzt-picker-option");
      button.type = "button";
      button.dataset.icon = name;
      button.title = name;
      const glyph = html("span", "mzt-picker-glyph");
      glyph.dataset.mztIcon = name;
      button.append(glyph);
      button.addEventListener("click", () => choose({ icon: name, color: state.icon ? state.color : undefined }));
      iconGrid.append(button);
    }
    for (const character of emoji) {
      const button = html("button", "mzt-picker-option mzt-picker-emoji", character);
      button.type = "button";
      button.dataset.emoji = character;
      button.addEventListener("click", () => choose({ emoji: character }));
      emojiGrid.append(button);
    }
    input.addEventListener("change", () => input.value.trim() && choose({ emoji: input.value }));
    for (const name of [null, ...Object.keys(colors)]) {
      const swatch = html("button", "mzt-picker-swatch");
      swatch.type = "button";
      swatch.dataset.color = name || "default";
      swatch.title = name ? names[name] : t.defaultColor;
      if (name) swatch.style.setProperty("--mzt-swatch", `var(--mzt-icon-${name})`);
      swatch.addEventListener("click", () => state.icon && choose({ icon: state.icon, color: name }));
      colorRow.append(swatch);
    }
    const reset = html("button", "mzt-picker-reset", t.reset);
    reset.type = "button";
    reset.addEventListener("click", () => choose(null));
    root.append(html("div", "mzt-picker-label", t.title), iconGrid, html("div", "mzt-picker-label", t.color), colorRow,
      html("div", "mzt-picker-label", t.emoji), emojiGrid, input, html("div", "mzt-picker-footer"));
    root.lastChild.append(html("span", "mzt-picker-note", t.note), reset);
    function render() {
      for (const button of iconGrid.children) button.setAttribute("aria-pressed", String(button.dataset.icon === state.icon));
      for (const button of emojiGrid.children) button.setAttribute("aria-pressed", String(button.dataset.emoji === state.emoji));
      for (const swatch of colorRow.children) {
        swatch.setAttribute("aria-pressed", String(!!state.icon && (swatch.dataset.color === (state.color || "default"))));
        swatch.disabled = !state.icon;
      }
      root.style.setProperty("--mzt-picker-color", state.color ? `var(--mzt-icon-${state.color})` : "");
    }
    render();
    panel.append(root);
    panel.addEventListener("popuphidden", () => panel.remove(), { once: true });
    (doc.querySelector("popupset") || doc.documentElement).append(panel);
    panel.openPopup(anchor, "after_start", 0, 0, false, false);
    return panel;
  }

  const api = Object.freeze({ icons: Object.keys(icons), colors, emoji, strings, validate, firstGrapheme, css, openPicker });
  scope.MZTCollectionIcons = api;
  if (typeof module !== "undefined") module.exports = api;
})(this);
