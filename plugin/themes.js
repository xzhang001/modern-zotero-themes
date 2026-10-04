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
      }
    },
    {
      id: "modern-dark", name: "Modern Dark", mode: "dark", author: "Modern Zotero Themes",
      colors: {
        background: "#1c1c20", sidebar: "#18181b", toolbar: "#202024", elevated: "#27272c",
        text: "#ededf1", muted: "#a6a6b2", subtle: "#81818f", border: "#34343b",
        hover: "#2c2c33", selected: "#6450a8", selectedText: "#ffffff",
        inactiveSelected: "#303037", accent: "#b3a0ff", onAccent: "#221a3b",
        error: "#ffa0ac", errorBackground: "#48252f", shadow: "#00000040"
      }
    },
    {
      id: "catppuccin-latte", name: "Catppuccin Latte", mode: "light", author: "Catppuccin",
      colors: {
        background: "#eff1f5", sidebar: "#e6e9ef", toolbar: "#e6e9ef", elevated: "#eff1f5",
        text: "#4c4f69", muted: "#5c5f77", subtle: "#6c6f85", border: "#ccd0da",
        hover: "#dce0e8", selected: "#8839ef", selectedText: "#ffffff",
        inactiveSelected: "#dce0e8", accent: "#8839ef", onAccent: "#ffffff",
        error: "#d20f39", errorBackground: "#fbecef", shadow: "#4c4f6914"
      }
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
    return theme;
  }
  themes.forEach(theme => {
    validate(theme);
    Object.freeze(theme.colors);
    Object.freeze(theme);
  });
  Object.freeze(themes);
  function get(id, mode) {
    return themes.find(t => t.id === id && (!mode || t.mode === mode))
      || themes.find(t => t.mode === (mode || "light"));
  }
  function resolve(settings, dark) {
    return settings.mode === "fixed" ? get(settings.theme)
      : get(dark ? settings.darkTheme : settings.lightTheme, dark ? "dark" : "light");
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
  const api = Object.freeze({ themes, get, resolve, validate, css });
  scope.MZTThemes = api;
  if (typeof module !== "undefined") module.exports = api;
})(this);
