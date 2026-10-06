/* Shared by Zotero, the settings panel, tests, and the browser design preview. */
(function (scope) {
  "use strict";
  const themes = [
    {
      id: "modern-light", name: "Modern Light", mode: "light", author: "Modern Zotero Themes",
      colors: {
        background: "#ffffff", sidebar: "#f5f5f7", toolbar: "#fafafa", elevated: "#ffffff",
        text: "#24252b", muted: "#656771", subtle: "#858792", border: "#e4e4e9",
        hover: "#ededf1", selected: "#6554c0", selectedText: "#ffffff",
        inactiveSelected: "#e7e7ec", accent: "#6554c0", onAccent: "#ffffff",
        error: "#b42338", errorBackground: "#fff0f1", shadow: "#18182414"
      },
      // Reading page (Zotero reader theme): background and text the PDF/EPUB page is redrawn with.
      page: { background: "#ffffff", foreground: "#24252b" }
    },
    {
      id: "modern-dark", name: "Modern Dark", mode: "dark", author: "Modern Zotero Themes",
      colors: {
        background: "#1c1c20", sidebar: "#18181b", toolbar: "#202024", elevated: "#27272c",
        text: "#ededf1", muted: "#a6a6b2", subtle: "#81818f", border: "#34343b",
        hover: "#2c2c33", selected: "#6450a8", selectedText: "#ffffff",
        inactiveSelected: "#303037", accent: "#b3a0ff", onAccent: "#221a3b",
        error: "#ffa0ac", errorBackground: "#48252f", shadow: "#00000040"
      },
      // Softer than pure white on black, and a step above the dark canvas so the page still reads as paper.
      page: { background: "#232328", foreground: "#d9d9e0" }
    },
    {
      id: "catppuccin-latte", name: "Catppuccin Latte", mode: "light", author: "Catppuccin",
      colors: {
        background: "#eff1f5", sidebar: "#e6e9ef", toolbar: "#e6e9ef", elevated: "#eff1f5",
        text: "#4c4f69", muted: "#5c5f77", subtle: "#6c6f85", border: "#ccd0da",
        hover: "#dce0e8", selected: "#8839ef", selectedText: "#ffffff",
        inactiveSelected: "#dce0e8", accent: "#8839ef", onAccent: "#ffffff",
        error: "#d20f39", errorBackground: "#fbecef", shadow: "#4c4f6914"
      },
      page: { background: "#eff1f5", foreground: "#4c4f69" }
    },
    {
      // Focused selection is a deepened mauve: Zotero swaps in white icons there, which pale mauve can't carry.
      id: "catppuccin-frappe", name: "Catppuccin Frappé", mode: "dark", author: "Catppuccin",
      colors: {
        background: "#303446", sidebar: "#292c3c", toolbar: "#292c3c", elevated: "#414559",
        text: "#c6d0f5", muted: "#a5adce", subtle: "#949cbb", border: "#414559",
        hover: "#3a3e51", selected: "#7f5aa8", selectedText: "#ffffff",
        inactiveSelected: "#414559", accent: "#ca9ee6", onAccent: "#232634",
        error: "#e78284", errorBackground: "#3b3040", shadow: "#00000040"
      },
      page: { background: "#303446", foreground: "#c6d0f5" }
    },
    {
      // Warm paper for long reading sessions; the page is a shade deeper than the cards so it reads as a sheet.
      id: "paper", name: "Paper", mode: "light", author: "Modern Zotero Themes",
      colors: {
        background: "#fbf7ef", sidebar: "#f2ebdd", toolbar: "#f7f1e5", elevated: "#fffcf6",
        text: "#3b2f25", muted: "#6b5a49", subtle: "#857261", border: "#e5dac7",
        hover: "#eee5d4", selected: "#9a5b2e", selectedText: "#ffffff",
        inactiveSelected: "#e9dfcc", accent: "#9a5b2e", onAccent: "#ffffff",
        error: "#b3261e", errorBackground: "#fbe9e4", shadow: "#3b2f2514"
      },
      page: { background: "#f6efe1", foreground: "#3b2f25" }
    },
    {
      // Solarized's body tone (base00) is under 4.5:1 on base3, so text uses base02 and muted a darkened base01;
      // blue is deepened for white selected text and icons.
      id: "solarized-light", name: "Solarized Light", mode: "light", author: "Ethan Schoonover",
      colors: {
        background: "#fdf6e3", sidebar: "#eee8d5", toolbar: "#f5efdc", elevated: "#fdf6e3",
        text: "#073642", muted: "#4f6369", subtle: "#6c7f84", border: "#e0d9c3",
        hover: "#e9e2cc", selected: "#1f6fa8", selectedText: "#ffffff",
        inactiveSelected: "#e6dfc8", accent: "#1f6fa8", onAccent: "#ffffff",
        error: "#b8261f", errorBackground: "#f9e6d8", shadow: "#586e7514"
      },
      page: { background: "#fdf6e3", foreground: "#3b4f55" }
    },
    {
      // Polar Night surfaces with Frost accents; selection is a deepened nord10, error a lightened nord11.
      id: "nord", name: "Nord", mode: "dark", author: "Arctic Ice Studio",
      colors: {
        background: "#2e3440", sidebar: "#2a2f3a", toolbar: "#2a2f3a", elevated: "#3b4252",
        text: "#eceff4", muted: "#b9c1ce", subtle: "#949eb0", border: "#3b4252",
        hover: "#353b48", selected: "#4c6a92", selectedText: "#ffffff",
        inactiveSelected: "#3b4252", accent: "#88c0d0", onAccent: "#2e3440",
        error: "#e0868e", errorBackground: "#3e2d34", shadow: "#00000040"
      },
      page: { background: "#2e3440", foreground: "#d8dee9" }
    }
  ];
  const required = Object.keys(themes[0].colors);
  function validate(theme) {
    if (!theme || !/^[a-z][a-z0-9-]*$/.test(theme.id) || typeof theme.name !== "string"
      || !theme.name.trim() || !["light", "dark"].includes(theme.mode)) {
      throw new Error("Invalid theme metadata");
    }
    for (const key of required) {
      if (!/^#[0-9a-f]{6}$/i.test(theme.colors?.[key] || "")
        && !(key === "shadow" && /^#[0-9a-f]{8}$/i.test(theme.colors?.[key] || ""))) {
        throw new Error(`Invalid or missing color: ${key}`);
      }
    }
    for (const key of ["background", "foreground"]) {
      if (!/^#[0-9a-f]{6}$/i.test(theme.page?.[key] || "")) throw new Error(`Invalid or missing page color: ${key}`);
    }
    return theme;
  }
  themes.forEach(theme => {
    validate(theme);
    Object.freeze(theme.colors);
    Object.freeze(theme.page);
    Object.freeze(theme);
  });
  Object.freeze(themes);
  function get(id, mode) {
    return themes.find(t => t.id === id && (!mode || t.mode === mode))
      || themes.find(t => t.mode === (mode || "light"));
  }
  function css(theme, selector = ":root[data-mzt-theme]") {
    validate(theme);
    const c = theme.colors;
    const map = {
      "color-background": c.background, "color-background30": c.background + "4d",
      "color-background50": c.background + "80", "color-background70": c.background + "b3",
      "color-sidepane": c.sidebar, "color-toolbar": c.toolbar, "color-tabbar": c.sidebar,
      "color-button": c.elevated, "color-control": c.elevated, "color-menu": c.elevated,
      "color-menu-opaque": c.elevated, "color-border": c.border, "color-border50": c.border,
      "color-panedivider": c.border, "fill-primary": c.text, "fill-secondary": c.muted,
      "fill-tertiary": c.subtle, "fill-quarternary": c.text.slice(0, 7) + "1a",
      "fill-quinary": c.text.slice(0, 7) + "0d", "fill-senary": c.text.slice(0, 7) + "05",
      "color-accent": c.accent, "color-accent-text": c.onAccent,
      "color-quinary-on-background": c.hover, "color-quarternary-on-background": c.inactiveSelected,
      "color-quinary-on-sidepane": c.hover, "color-quarternary-on-sidepane": c.inactiveSelected,
      "color-stripe": c.background, "color-stripe-on-background": c.background,
      "color-invalid": c.error, "color-invalid-background": c.errorBackground,
      "color-scrollbar": c.border, "color-scrollbar-hover": c.subtle,
      "color-scrollbar-background": "transparent"
    };
    for (const [key, value] of Object.entries(c)) map[`mzt-${key}`] = value;
    for (const key of ["background", "background50", "background70", "button", "control", "menu", "sidepane", "tabbar", "toolbar"]) {
      map[`material-${key}`] = `var(--color-${key})`;
    }
    map["material-mix-quinary"] = c.hover;
    map["material-mix-quarternary"] = c.inactiveSelected;
    map["material-stripe"] = c.background;
    // Modern layout canvas: a step below the sidebar; dark surfaces need a bigger step to read.
    map["mzt-canvas"] = `color-mix(in srgb, ${c.sidebar} ${theme.mode === "dark" ? 70 : 95}%, #000)`;
    return `@media (forced-colors: none) { ${selector} {\ncolor-scheme: ${theme.mode};\n`
      + Object.entries(map).map(([k, v]) => `--${k}: ${v};`).join("\n") + "\n} }";
  }
  // The theme's reading page in the shape Zotero's reader expects for a reading theme.
  function readerTheme(theme) {
    validate(theme);
    return { id: "mzt-" + theme.id, label: theme.name, background: theme.page.background, foreground: theme.page.foreground };
  }
  const api = Object.freeze({ themes, get, validate, css, readerTheme });
  scope.MZTThemes = api;
  if (typeof module !== "undefined") module.exports = api;
})(this);
