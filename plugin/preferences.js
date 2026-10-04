window.MZTPreferences = {
  init() {
    const root = document.getElementById("mzt-preferences");
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    const api = Zotero.ModernZoteroThemes;
    if (!api) return;
    const zh = (Zotero.locale || navigator.language).startsWith("zh");
    const copy = zh ? {
      heading: "让阅读更专注。", description: "更清爽的界面，熟悉的 Zotero。",
      appearance: "外观切换", layout: "界面风格", layoutModern: "现代", layoutClassic: "经典（仅换色）",
      emptyFields: "空字段", emptyHide: "隐藏，编辑时显示", emptyShow: "始终显示",
      fixed: "固定主题", system: "跟随系统", light: "浅色模式主题", dark: "深色模式主题",
      note: "即时生效，不会改动文献数据、标签颜色与批注。", saved: "主题设置已保存", inactive: "主题插件已停用",
      modes: { light: "浅色", dark: "深色" },
      mismatch: m => `Zotero 自身外观为${m.current}，部分图标、阅读器和其他窗口仍会显示为${m.current}。`,
      matchMode: m => `将 Zotero 外观改为${m.wanted}`,
      notAuto: m => `Zotero 自身外观固定为${m.current}，不会跟随系统切换。`,
      useAuto: "将 Zotero 外观改为自动"
    } : {
      saved: "Theme settings saved", inactive: "The theme plugin is disabled",
      modes: { light: "light", dark: "dark" },
      mismatch: m => `Zotero itself is set to ${m.current} appearance, so some icons, the reader and other windows will stay ${m.current}.`,
      matchMode: m => `Switch Zotero to ${m.wanted} appearance`,
      notAuto: m => `Zotero's own appearance is set to ${m.current}, so this won't follow your system.`,
      useAuto: "Set Zotero appearance to Automatic"
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
    // Confirm only after the user changes something, not when the pane opens.
    const save = (...changes) => {
      for (const [key, value] of changes) api.set(key, value);
      status.textContent = copy.saved;
    };
    const cards = root.querySelector("#mzt-theme-cards");
    for (const theme of api.themes) {
      const card = make("button", "mzt-theme-card");
      card.type = "button";
      card.dataset.theme = theme.id;
      card.setAttribute("aria-pressed", "false");
      const preview = make("span", "mzt-miniature");
      preview.setAttribute("aria-hidden", "true");
      for (const [key, color] of Object.entries(theme.colors)) preview.style.setProperty("--mzt-" + key, color);
      for (const name of ["sidebar", "list", "detail"]) {
        const column = make("span", "mzt-mini-" + name);
        for (let i = 0; i < 4; i++) column.append(make("i"));
        preview.append(column);
      }
      card.append(preview, make("span", "mzt-theme-name", theme.name));
      card.addEventListener("click", () => save(["theme", theme.id], ["mode", "fixed"]));
      cards.append(card);
    }
    for (const mode of ["light", "dark"]) {
      const select = root.querySelector("#mzt-" + mode + "Theme");
      for (const theme of api.themes.filter(t => t.mode === mode)) {
        const option = make("option", null, theme.name);
        option.value = theme.id;
        select.append(option);
      }
    }
    for (const key of ["mode", "layout", "emptyFields", "lightTheme", "darkTheme"]) {
      root.querySelector("#mzt-" + key).addEventListener("change", event => save([key, event.target.value]));
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
      for (const control of root.querySelectorAll("button, select")) control.disabled = !available;
      if (!available) status.textContent = copy.inactive;
      const settings = api.settings();
      const current = copy.modes[media.matches ? "dark" : "light"];
      const fixed = settings.mode === "fixed" && api.themes.find(t => t.id === settings.theme);
      wantedAppearance = null;
      if (fixed && fixed.mode !== (media.matches ? "dark" : "light")) {
        wantedAppearance = fixed.mode;
        noticeText.textContent = copy.mismatch({ current });
        noticeButton.textContent = copy.matchMode({ wanted: copy.modes[fixed.mode] });
      }
      else if (settings.mode === "system" && api.zoteroAppearance() !== "auto") {
        wantedAppearance = "auto";
        noticeText.textContent = copy.notAuto({ current });
        noticeButton.textContent = copy.useAuto;
      }
      notice.hidden = !wantedAppearance;
      for (const key of ["mode", "layout", "emptyFields", "lightTheme", "darkTheme"]) root.querySelector("#mzt-" + key).value = settings[key];
      // Hiding empty fields is part of the modern layout; classic only changes colors.
      root.querySelector("#mzt-emptyFields").disabled = !available || settings.layout !== "modern";
      root.querySelector("#mzt-system-settings").hidden = settings.mode !== "system";
      for (const card of cards.children) {
        card.setAttribute("aria-pressed", String(settings.mode === "fixed" && settings.theme === card.dataset.theme));
      }
    }
    const unsubscribe = api.subscribe(render);
    media.addEventListener("change", render);
    window.addEventListener("unload", () => {
      unsubscribe();
      media.removeEventListener("change", render);
    }, { once: true });
    render();
  }
};
