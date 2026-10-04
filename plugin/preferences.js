window.MZTPreferences = {
  init() {
    const root = document.getElementById("mzt-preferences");
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    const api = Zotero.ModernZoteroThemes;
    if (!api) return;
    const zh = (Zotero.locale || navigator.language).startsWith("zh");
    const copy = zh ? {
      heading: "让阅读更专注。",
      themes: "主题", interface: "界面", fixed: "固定", system: "跟随系统",
      layout: "界面风格",
      layoutModern: "现代", layoutClassic: "经典",
      emptyFields: "空字段", emptyHide: "隐藏", emptyShow: "显示",
      folderIcons: "文件夹图标", iconsColor: "彩色", iconsMono: "单色",
      saved: "✓ 已保存", inactive: "主题插件已停用",
      modes: { light: "浅色", dark: "深色" },
      modeNames: { light: "浅色", dark: "深色" },
      usedFor: { light: "用于浅色模式", dark: "用于深色模式" },
      mismatch: m => `Zotero 自身外观为${m.current}，部分图标、PDF 页面和其他窗口仍会显示为${m.current}。`,
      matchMode: m => `改为${m.wanted}`,
      notAuto: m => `Zotero 自身外观固定为${m.current}，不会跟随系统切换。`,
      useAuto: "改为自动"
    } : {
      saved: "✓ Saved", inactive: "The theme plugin is disabled",
      modes: { light: "light", dark: "dark" },
      modeNames: { light: "Light", dark: "Dark" },
      usedFor: { light: "Used in light mode", dark: "Used in dark mode" },
      mismatch: m => `Zotero itself is set to ${m.current} appearance, so some icons, PDF pages and other windows will stay ${m.current}.`,
      matchMode: m => `Switch to ${m.wanted}`,
      notAuto: m => `Zotero's own appearance is set to ${m.current}, so this won't follow your system.`,
      useAuto: "Set to Automatic"
    };
    for (const node of root.querySelectorAll("[data-mzt-text]")) {
      if (copy[node.dataset.mztText]) node.textContent = copy[node.dataset.mztText];
    }
    const make = (tag, className, text) => {
      const node = document.createElementNS("http://www.w3.org/1999/xhtml", tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };
    const status = root.querySelector("#mzt-status");
    let statusTimer;
    // Confirm only after the user changes something, not when the pane opens.
    const save = (...changes) => {
      for (const [key, value] of changes) api.set(key, value);
      status.textContent = copy.saved;
      status.classList.add("mzt-visible");
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => status.classList.remove("mzt-visible"), 2000);
    };

    // Two-way choices are segmented controls: native <select> popups can't be styled.
    const segments = new Map();
    for (const group of root.querySelectorAll(".mzt-seg")) {
      const key = group.dataset.key;
      const buttons = Array.from(group.querySelectorAll("button"));
      segments.set(key, { group, buttons });
      group.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (button && !button.disabled && button.getAttribute("aria-checked") !== "true") save([key, button.dataset.value]);
      });
      // Radio-group keys: arrows move and select, Home/End jump.
      group.addEventListener("keydown", event => {
        const index = buttons.indexOf(event.target);
        if (index < 0) return;
        const rtl = getComputedStyle(group).direction === "rtl";
        const step = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[event.key];
        let next;
        if (step) next = buttons[(index + step + buttons.length) % buttons.length];
        else if (event.key === "Home") next = buttons[0];
        else if (event.key === "End") next = buttons[buttons.length - 1];
        if (!next) return;
        event.preventDefault();
        next.focus();
        next.click();
      });
    }

    const cards = root.querySelector("#mzt-theme-cards");
    for (const theme of api.themes) {
      const card = make("button", "mzt-theme-card");
      card.type = "button";
      card.dataset.theme = theme.id;
      card.dataset.mode = theme.mode;
      card.setAttribute("aria-pressed", "false");
      const preview = make("span", "mzt-miniature");
      preview.setAttribute("aria-hidden", "true");
      for (const [key, color] of Object.entries(theme.colors)) preview.style.setProperty("--mzt-" + key, color);
      for (const [name, lines] of [["sidebar", 5], ["list", 6], ["detail", 4]]) {
        const column = make("span", "mzt-mini-" + name);
        for (let i = 0; i < lines; i++) column.append(make("i"));
        preview.append(column);
      }
      const label = make("span", "mzt-theme-label");
      label.append(make("span", "mzt-theme-name", theme.name), make("span", "mzt-theme-meta"));
      const check = make("span", "mzt-check");
      check.setAttribute("aria-hidden", "true");
      card.append(preview, label, check);
      // Fixed mode picks the theme; system mode fills the light or dark slot the theme belongs to.
      card.addEventListener("click", () => save(api.settings().mode === "system"
        ? [theme.mode + "Theme", theme.id] : ["theme", theme.id]));
      cards.append(card);
    }

    const notice = root.querySelector("#mzt-appearance-notice");
    const noticeText = root.querySelector("#mzt-appearance-message");
    const noticeButton = root.querySelector("#mzt-appearance-fix");
    let wantedAppearance = null;
    noticeButton.addEventListener("click", () => wantedAppearance && api.setZoteroAppearance(wantedAppearance));
    // Zotero's own appearance drives prefers-color-scheme, which native icons and other windows follow.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function render() {
      const available = Zotero.ModernZoteroThemes === api;
      for (const control of root.querySelectorAll("button")) control.disabled = !available;
      if (!available) {
        clearTimeout(statusTimer);
        status.textContent = copy.inactive;
        status.classList.add("mzt-visible");
      }
      const settings = api.settings();
      const system = settings.mode === "system";
      const current = copy.modes[media.matches ? "dark" : "light"];
      const fixed = !system && api.themes.find(t => t.id === settings.theme);
      wantedAppearance = null;
      if (fixed && fixed.mode !== (media.matches ? "dark" : "light")) {
        wantedAppearance = fixed.mode;
        noticeText.textContent = copy.mismatch({ current });
        noticeButton.textContent = copy.matchMode({ wanted: copy.modes[fixed.mode] });
      }
      else if (system && api.zoteroAppearance() !== "auto") {
        wantedAppearance = "auto";
        noticeText.textContent = copy.notAuto({ current });
        noticeButton.textContent = copy.useAuto;
      }
      notice.hidden = !wantedAppearance;

      // Empty fields and folder icons belong to the modern layout; classic only changes colors.
      const modern = settings.layout === "modern";
      for (const row of root.querySelectorAll(".mzt-row[data-modern-only]")) row.toggleAttribute("data-disabled", !modern);
      for (const [key, { buttons }] of segments) {
        const value = settings[key];
        const checked = buttons.find(b => b.dataset.value === value) || buttons[0];
        for (const button of buttons) {
          button.setAttribute("aria-checked", String(button === checked));
          button.tabIndex = button === checked ? 0 : -1;
          if (key === "emptyFields" || key === "folderIcons") button.disabled = !available || !modern;
        }
      }

      for (const card of cards.children) {
        const { theme, mode } = card.dataset;
        const pressed = system ? settings[mode + "Theme"] === theme : settings.theme === theme;
        card.setAttribute("aria-pressed", String(pressed));
        card.querySelector(".mzt-theme-meta").textContent = system && pressed ? copy.usedFor[mode] : copy.modeNames[mode];
      }
    }
    const unsubscribe = api.subscribe(render);
    media.addEventListener("change", render);
    window.addEventListener("unload", () => {
      unsubscribe();
      clearTimeout(statusTimer);
      media.removeEventListener("change", render);
    }, { once: true });
    render();
  }
};
