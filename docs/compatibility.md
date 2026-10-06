# Compatibility and acceptance record

## Current evidence

Development baseline: Zotero 10.0.5. Target platforms: Windows, macOS.

| Item | Status |
| --- | --- |
| Source review of colors, main window, lists and plugin APIs for 7.0 / 8.0 / 9.0 / 10.0.5 | Done |
| Theme resolution, color contrast, fallback for invalid settings | Automated (Node) |
| Startup/disable, new windows, listener cleanup, theme persistence | Checked against mocked Zotero APIs |
| Three themes and real settings page interaction in the browser | Checked in the browser preview |
| Windows, Zotero 10 | Native acceptance passed (2026-10-06) |
| macOS, Zotero 10.0.5 | Native acceptance pending |
| Linux, Zotero 7.0.32 / 8.0.4 / 9.0.6 / 10.0.5, light and dark | Automated runtime checks pass (headless, packed XPI); see below |
| Zotero 7 / 8 / 9 on Windows and macOS | Native acceptance pending |

The manifest's 7.0–10.0.* range is the installable range of the development preview, not a certification of compatibility with every version. Before a stable release, record the exact minor version, platform and result for the items below.

## Known differences between versions

Found with the automated runtime checks on Linux (2026-10-06). 8.0.5 has no Linux build, so 8.0.4 was used.

- Zotero 7 (Gecko 115) has no `:has()`, so the rules for hiding empty fields, collection tree section headings, bold group names and dimmed built-in rows are dropped. Everything else is themed.
- Zotero 7's reader has no light/dark reading themes, so the Reading page setting has no effect there.
- Collection tree indent guides (`.cell-indent`) and sticky section headers in the item list exist only in Zotero 10.

## Native acceptance

On each platform, start with a separate 10.0.5 profile, then repeat for the target minor versions of 7/8/9.

1. Install / disable / enable / restart: styles are applied once, disabling restores the original look, and no settings entry is left behind.
2. The settings page switches between themes instantly; the choice survives closing and reopening and does not change when the system or Zotero switches between light and dark. The "Theme / Reading page" switch shows one set of cards at a time without moving the Interface section, and works with the arrow keys. Opening the page does not show "Saved". A notice appears when the theme's light/dark mode differs from Zotero's appearance; clicking its button changes Zotero's appearance and the notice disappears. Upgrading from 0.14 or earlier keeps the theme that was showing (for "Match system", the light or dark one for Zotero's appearance at that moment).
3. With empty fields hidden, clicking any field shows all fields and editing works; fields that have a value after saving stay visible. Compared with the plugin disabled, list row heights, column widths, scroll position and column header alignment are unchanged; in the modern layout the content cards are inset by only 8px, and in the classic layout pane sizes match native. Cards and splitters look right in the stacked layout and in narrow windows.
4. Single selection, multiple selection, unfocused selection, keyboard focus, drag and drop, match highlighting, unread and disabled states are all distinguishable.
5. Scrolling a large library works without misplaced rows, skipped rows or noticeable slowdowns.
6. Collapsing the left and right panes, dragging splitters, the stacked layout and dragging tabs all work.
7. In Zotero 10, multi-library selection and the sticky group headers are opaque and correctly placed.
8. Item field editing, search, native icons, Chinese/English, RTL, and 125%/150%/200% scaling.
9. Colored tags and PDF annotations keep their meaning; other plugins' buttons and item pane sections are not broken.
10. The system's high contrast and reduced-motion settings take effect.
11. In the collection context menu, Zotero's own items keep the same names, submenus and behavior as without the plugin; "Set Icon…" comes last and only appears on regular collections. Choosing an icon, color or emoji updates the collection tree instantly, and the icon turns white on a focused selection; "Restore default" brings back Zotero's icon; disabling the plugin restores the original icons.
12. Open a PDF and an EPUB: the reader toolbar (including the annotation tool segmented control and the current tool), the three sidebar views (segmented switch, outline current section and expand/collapse, selected thumbnail), annotation cards (including the selected state), and the find / appearance / selection / annotation popups use theme colors; annotation colors are the same as without the plugin. In the modern layout the reader and the item pane are two cards, and dragging the splitter between them, collapsing the item pane and the stacked layout all work. Reader tabs opened before enabling the plugin pick up the theme, and disabling the plugin restores them.
13. Reading page: the default is "Zotero setting", and switching themes leaves page colors unchanged. With "Follow theme", page colors change when switching themes and when the system switches between light and dark. Selecting each theme's reading page, "Original" and "Zotero setting" in the settings updates open PDFs and EPUBs instantly. Choosing "Zotero setting" or disabling the plugin restores the choice from the Aa menu, and the reading theme in Zotero's settings and the synced custom themes are untouched. The background around pages, the page edge/shadow and the PDF scrollbar follow the theme; fit-width/fit-page zoom and jump positions match the behavior without the plugin; images in PDFs display correctly.
14. Reading progress bar: opening a PDF shows the progress line along the top of the PDF view, updating live on scroll, zoom, outline and annotation jumps and scrollbar drags. Hovering shows the page and percentage; clicking or dragging jumps to that position and the page number field follows. Each view in split view has its own line; it stays aligned with the PDF view when the sidebar opens or closes; horizontal scrolling mode measures the horizontal position; EPUB does not get a second bar. Hiding it in the settings removes it instantly, and disabling the plugin removes it.
15. Note editor: when a note is selected in the main window or opened in the reader's side pane, the editing area background, body text, links, the quote bar, table lines, the toolbar, format menus and the find and replace bar use theme colors and update instantly when switching themes. Notes with formulas, tables, images, citations, and notes created with "Add Note from Annotations" display correctly; text colors and background colors set in a note, and highlight colors after "Show Annotation Colors", are the same as without the plugin. Editing, undo and dragging annotations in are unaffected. Notes opened before enabling the plugin pick up the theme, and disabling the plugin restores them.

## Upstream references checked

- https://www.zotero.org/support/dev/zotero_7_for_developers
- https://www.zotero.org/support/dev/zotero_8_for_developers
- https://www.zotero.org/support/dev/zotero_9_for_developers
- https://www.zotero.org/support/dev/zotero_10_for_developers
- https://github.com/zotero/zotero/blob/10.0.5/chrome/content/zotero/xpcom/plugins.js
- https://github.com/zotero/zotero/blob/10.0.5/chrome/content/zotero/xpcom/preferencePanes.js
- https://github.com/zotero/zotero/blob/10.0.5/scss/components/_virtualized-table.scss

The 7→8 module system change is mitigated by not importing version-specific modules; no item or collection data APIs are called. DOM and style differences remain between 8, 9 and 10 on the same platform, so compatibility cannot be inferred from the Firefox version alone.
