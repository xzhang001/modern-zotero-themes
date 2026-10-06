# Modern Zotero Themes

**English** | [简体中文](README.zh-CN.md)

A modern visual theme plugin for Zotero that keeps Zotero's three panes, toolbar positions and library workflow exactly where they are.

![Zotero with Modern Zotero Themes in Catppuccin Latte, Paper and Nord](docs/images/en/hero.webp)

**This is a 0.15.0 development preview.** Its interfaces have been checked against the Zotero 7.0, 8.0, 9.0 and 10.0.5 sources, with 10.0.5 as the main development target; native acceptance testing on Windows and macOS is not finished yet. The installable version range is an entry point for testing, not a claim of verified compatibility with every version.

## Features

### Themes

![The seven built-in themes](docs/images/en/themes.webp)

- Themes: Modern Light, Modern Dark, Catppuccin Latte (light), Catppuccin Frappé (dark), Paper (warm paper tones, light), Solarized Light (light) and Nord (dark).
- A consistent look for toolbar buttons, the search field, selection, list headers, item pane sections and tabs.

### Modern layout

- Modern layout (default): the title bar, tab bar and left pane share one slightly deeper canvas; the item list and the item pane float on it as two rounded cards, and the gap between them is the draggable splitter. Pill-shaped tabs, a filled search field, dimmed secondary columns such as Creator, and a roomier item pane with left-aligned field labels and monochrome section icons. Switch to "Classic" (colors only) in the settings.
- Empty fields (modern layout): fields without a value are hidden by default and all of them appear as soon as you click into any field of the Info section to edit; you can choose to always show them in the settings.

### Collection tree and custom icons

<img src="docs/images/en/icons.webp" alt="Choosing a custom collection icon" width="460">

- Collection tree (modern layout): library names and "Group Libraries" / "Feeds" become small uppercase section headings, and group library names are bold. Within each library, your own collections are set apart from saved searches, My Publications, Duplicate Items, Unfiled Items and Trash by a gap and a hairline. Top-level collections with subcollections are bold, every nesting level gets an indent guide, built-in rows such as Recently Read, Duplicate Items, Unfiled Items and Trash are dimmed, and the separators before groups and feeds are hairlines. Folder icons can be made monochrome in the settings.
- Custom collection icons: right-click a collection → "Set Icon…" (at the end of the menu) and pick from 105 line icons in groups (Reading & writing, Science, Data & tech, People & places, Status & marks; 16 colors) or any emoji. Changes apply instantly and can be reset to the default. Icons are stored only in this computer's Zotero settings: collection names and library data are not changed, and icons do not sync to other devices.

### Reader

<img src="docs/images/en/reader-annotations.webp" alt="Reader with annotations and a themed reading page" width="49%"> <img src="docs/images/en/reader-outline.webp" alt="Reader outline with the current section highlighted and the reading progress bar" width="49%">

- Reader (PDF/EPUB tabs): the toolbar, the thumbnails / annotations / outline sidebar, annotation cards, and the find and appearance popups use the current theme, with selected and active states in the theme's accent color. In the modern layout the reader and the item pane beside it are two rounded cards, and that item pane is laid out like the main window's (left-aligned field labels, empty fields hidden). Toolbar icons are monochrome by default; the annotation tools sit in one segmented control with the current tool raised; the sidebar views switch with a segmented control; the outline gets larger text, full-row rounded hover, the current section highlighted in the accent color, and dimmed subsections with indent guides; thumbnails and annotation cards get a thin border and a soft shadow. Annotation colors are never changed.
- Reading page: every theme comes with a reading page (page background and text color; Latte, for example, uses `#eff1f5` with `#4c4f69` text). The default is "Zotero setting": page colors stay with the reader's Aa menu, and switching themes leaves pages alone. In the settings you can choose "Follow theme", any theme's reading page, or "Original" (the PDF's own colors). Pages are redrawn through Zotero's own reading theme mechanism, which handles images and annotation highlights its usual way. The plugin only changes the open readers: it never writes Zotero's reading theme settings or its synced custom themes. A theme picked in the Aa menu lasts until you reopen the item or change this setting, and disabling the plugin restores Zotero's own setting.
- Reading progress bar (PDF): a 2px accent line along the top of the PDF view shows how far you have read, following the scroll position live (zooming, outline jumps and scrollbar drags all update it), with one line per view in split view. Hover to thicken it and see "Page 12 of 22 · 54%"; click or drag to jump. EPUB uses Zotero's built-in progress bar. On by default; turn it off in Settings → Interface.
- Around the page: Zotero's hard-coded gray background becomes a theme color (the canvas in the modern layout, the sidebar color in the classic one), pages get a thin themed edge and shadow (plus small rounded corners and a lifted shadow in the modern layout), and PDF scrollbars use theme colors. Page size, page gaps and zoom calculations are unchanged.

### Note editor

- Note editor: the note editing area, its toolbar and its format menus in the item pane and in the reader's side pane use the current theme, with body text, links, the quote bar, table lines, formula source and scrollbars in theme colors. Colors only: font sizes and layout stay the same, the note content is never modified, and text colors, background colors and annotation highlight colors set in a note keep their original colors.

### Settings

<img src="docs/images/en/settings.webp" alt="The Modern Themes settings page" width="460">

- Settings page: theme cards with interface thumbnails; a "Theme / Reading page" switch under Colors, so only one set of cards shows at a time, with reading pages picked from small page swatches; interface options as a grouped list, all with segmented buttons instead of dropdowns.
- Settings save instantly and apply to open and newly opened main windows.
- Disabling removes the styles, listeners and the settings page; re-enabling keeps your theme choices.
- Respects reduced-motion and the system's forced-colors (high contrast) mode.

Item data, tags and annotation colors are never modified, and the virtualized lists keep their row heights, column widths and cell padding; list row spacing follows Zotero's own density setting (View → Density). The main window is covered, along with the reader tabs (including page colors) and the note editors in it. Separate reader windows (a PDF opened in a new window), separate note windows (a note edited in a separate window) and system dialogs are not.

The theme you pick stays the same day and night; it does not switch with the system's light or dark mode. Zotero's native icons and its settings window follow Zotero's own appearance setting (Settings → General → Appearance). When a dark theme meets a light appearance (or the other way round), the settings page tells you. The button in the notice changes Zotero's appearance in one click; the plugin never changes it on its own.

## Installation

1. Download the latest `modern-zotero-themes-<version>.xpi` from [Releases](https://github.com/xzhang001/modern-zotero-themes/releases).
2. In Zotero, open Tools → Plugins, click the gear icon, choose "Install Plugin From File…" and select the XPI.
3. Open Zotero Settings → **Modern Themes** and pick a theme card.
4. To go back to Zotero's original look, disable Modern Zotero Themes in the plugin manager.

Zotero updates the plugin automatically from then on (it checks about once a day); you can also use "Check for Updates" in the plugin manager's gear menu.

Trying it in a separate Zotero profile first is recommended. The native test items are listed in the [compatibility checklist](docs/compatibility.md).

## Development

No third-party npm dependencies; requires Node.js 18+ and Python 3.10+.

```sh
npm test
npm run build
npm run preview
```

The preview runs at `http://localhost:5173/preview/`. It uses the plugin's colors, component styles and settings page, but mocks Zotero's layout in HTML: it is for design review only and does not replace testing in Gecko/XUL.

The build output is a reproducible ZIP-format XPI. Only the contents of `plugin/` and `LICENSE` go into the package; the preview and the tests are not packaged.

`npm run build` also writes the current version into `updates.json` (the update manifest Zotero reads from `update_url`: download link, sha256 and compatible versions), keeping the entries for other versions. To release a version:

1. Bump the version in `plugin/manifest.json` and `package.json`, then run `npm test` and `npm run build`.
2. Commit the code and `updates.json`, tag it `v<version>`, and push only the tag (`git push origin v<version>`).
3. Create a GitHub release for the tag and upload `dist/modern-zotero-themes-<version>.xpi`. The XPI is reproducible, so a file built from the same commit matches the sha256 in `updates.json`.
4. Push `main`. `update_url` reads `updates.json` on `main`, so installed copies start updating once it is pushed; this comes last so the manifest never points at an XPI that has not been uploaded yet.

## Adding themes

Themes are defined in `plugin/themes.js`. Each one has an `id`, `name`, `author`, `mode` and semantic `colors`. A new definition shows up automatically as a theme card and a reading page option. See the [theme design conventions](docs/themes.md).

Themes are currently built into the plugin; importing VS Code themes or running external scripts is not supported. Importing theme files is a possible future extension.

## License

[MIT](LICENSE). Licenses for third-party palettes and icons are listed below.

## Credits

Folder icons come from [Lucide](https://lucide.dev) (ISC license). Catppuccin Latte and Frappé use the [official Catppuccin palette](https://catppuccin.com/palette/), Solarized Light uses the [Solarized](https://ethanschoonover.com/solarized/) palette, and Nord uses the [Nord](https://www.nordtheme.com/) palette. Interaction states such as selection and errors are mapped by this plugin, and Solarized's body text and Nord's selection and error colors are darkened or lightened to meet the contrast requirements. The licenses are included in [THIRD_PARTY_NOTICES.md](plugin/THIRD_PARTY_NOTICES.md). This plugin is not an official release of Zotero, Catppuccin, Solarized or Nord.
