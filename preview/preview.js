const icons = {
  folder: '<path d="M2 5h5l2 2h13v12H2z"/>',
  document: '<path d="M5 2h9l5 5v15H5zM14 2v6h5M8 12h8M8 16h8"/>',
  library: '<path d="M3 4h4v17H3zM10 4h4v17h-4zM17 4l4-1 3 17-4 1z"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  archive: '<path d="M3 3h18v5H3zM5 8v13h14V8M9 12h6"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  clip: '<path d="m9 15 7-7a3 3 0 0 0-4-4L4 12a5 5 0 0 0 7 7l8-8M7 13l7-7"/>',
  wand: '<path d="m4 20 13-13 3 3L7 23zM5 2v6M2 5h6M17 1v3M21 4h3"/>'
};
function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.document}</svg>`; }
for (const node of document.querySelectorAll('[data-icon]')) node.insertAdjacentHTML('afterbegin', icon(node.dataset.icon));
const papers = [
  ['Attention Is All You Need', 'Vaswani et al.', '2017'],
  ['BERT: Pre-training of Deep Bidirectional Transformers', 'Devlin et al.', '2019'],
  ['Language Models are Few-Shot Learners', 'Brown et al.', '2020'],
  ['Deep Residual Learning for Image Recognition', 'He et al.', '2016'],
  ['An Image is Worth 16x16 Words', 'Dosovitskiy et al.', '2021'],
  ['Denoising Diffusion Probabilistic Models', 'Ho et al.', '2020'],
  ['Learning Transferable Visual Models', 'Radford et al.', '2021'],
  ['The Illustrated Transformer', 'Alammar', '2018'],
  ['Scaling Laws for Neural Language Models', 'Kaplan et al.', '2020'],
  ['LoRA: Low-Rank Adaptation of Large Language Models', 'Hu et al.', '2022'],
  ['Training language models to follow instructions', 'Ouyang et al.', '2022'],
  ['A Survey of Large Language Models', 'Zhao et al.', '2023']
];
function renderPapers(query = '') {
  const body = document.getElementById('paper-rows'); body.replaceChildren();
  papers.filter(p => p.join(' ').toLowerCase().includes(query.toLowerCase())).forEach((p, i) => {
    const row = document.createElement('div'); row.className = 'row' + (i === 0 ? ' selected' : '');
    const title = document.createElement('span'); title.className = 'cell title-cell'; title.innerHTML = icon('document');
    const name = document.createElement('span'); name.className = 'paper-name'; name.textContent = p[0]; title.append(name); row.append(title);
    for (const [index, cls] of [[1, 'author-cell'], [2, 'year-cell']]) { const cell = document.createElement('span'); cell.className = 'cell ' + cls; cell.textContent = p[index]; row.append(cell); }
    row.addEventListener('click', () => {
      body.querySelectorAll('.selected').forEach(n => n.classList.remove('selected')); row.classList.add('selected');
      document.getElementById('paper-title').textContent = p[0];
      document.getElementById('detail-title').textContent = p[0];
      document.getElementById('detail-author').textContent = p[1];
      document.getElementById('detail-year').textContent = p[2];
      document.getElementById('zotero-items-tree').focus();
    });
    body.append(row);
  });
  document.getElementById('item-count').textContent = `${body.children.length} 个条目`;
}
renderPapers();
document.getElementById('library-search').addEventListener('input', event => renderPapers(event.target.value));
const saved = (() => { try { return JSON.parse(localStorage.getItem('mzt-preview-settings')) || {}; } catch { return {}; } })();
const config = { mode: 'fixed', theme: 'catppuccin-latte', lightTheme: 'catppuccin-latte', darkTheme: 'modern-dark', layout: 'modern', emptyFields: 'hide', folderIcons: 'color', ...saved };
const callbacks = new Set();
const media = matchMedia('(prefers-color-scheme: dark)');
const picker = document.getElementById('theme-picker');
for (const theme of MZTThemes.themes) { const option = document.createElement('option'); option.value = theme.id; option.textContent = theme.name; picker.append(option); }
function updateTheme() {
  const theme = MZTThemes.resolve(config, media.matches);
  document.documentElement.dataset.mztTheme = theme.id;
  document.documentElement.dataset.mztLayout = config.layout;
  document.documentElement.dataset.mztEmptyFields = config.emptyFields;
  document.documentElement.dataset.mztFolderIcons = config.folderIcons;
  document.getElementById('theme-tokens').textContent = MZTThemes.css(theme);
  picker.value = theme.id;
  localStorage.setItem('mzt-preview-settings', JSON.stringify(config));
  callbacks.forEach(cb => cb());
}
window.Zotero = { locale: 'zh-CN', ModernZoteroThemes: {
  themes: MZTThemes.themes, settings: () => ({ ...config }),
  set: (key, value) => { config[key] = value; updateTheme(); },
  // A browser can't switch its own prefers-color-scheme, so this only records the choice.
  zoteroAppearance: () => config.zoteroAppearance || 'auto',
  setZoteroAppearance: value => { config.zoteroAppearance = value; updateTheme(); },
  subscribe: cb => { callbacks.add(cb); return () => callbacks.delete(cb); }
} };
picker.addEventListener('change', () => { config.theme = picker.value; config.mode = 'fixed'; updateTheme(); });
media.addEventListener('change', updateTheme);
updateTheme();
const dialog = document.getElementById('settings-dialog');
document.getElementById('open-settings').addEventListener('click', async () => {
  if (!document.getElementById('mzt-preferences')) {
    // Render the actual plugin settings fragment in HTML for browser interaction checks.
    const xml = new DOMParser().parseFromString(await (await fetch('../plugin/preferences.xhtml')).text(), 'application/xml');
    function convert(node) {
      if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
      if (node.nodeType !== Node.ELEMENT_NODE) return document.createTextNode('');
      const element = document.createElement(['vbox', 'groupbox'].includes(node.localName) ? 'div' : node.localName);
      for (const attr of node.attributes) if (!attr.name.startsWith('xmlns') && attr.name !== 'onload') element.setAttribute(attr.name, attr.value);
      for (const child of node.childNodes) element.append(convert(child));
      return element;
    }
    document.getElementById('settings-content').append(convert(xml.documentElement));
    window.MZTPreferences.init();
  }
  dialog.showModal();
});
document.getElementById('close-settings').addEventListener('click', () => dialog.close());
