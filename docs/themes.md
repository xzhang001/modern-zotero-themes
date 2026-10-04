# Theme and visual design conventions

## Two independent layers

`plugin/styles/modern.css` handles control outlines, corner radii, layering, header font weights, focus, hover and a few transitions. `plugin/themes.js` handles colors, mapped onto Zotero's CSS variables and the plugin's own `--mzt-*` variables. All themes share the same geometry.

`plugin/styles/layout.css` is the switchable "Modern" layout layer, scoped to `:root[data-mzt-layout="modern"]`. The frame (title bar, tab bar, left pane) uses `--mzt-canvas`, and the item list and item pane are each a card whose border is a darkened step of the background (`--mzt-card-border`) so it stays visible on low-contrast displays. It also styles tabs, the search field, list headers and the item pane. None of this applies in the classic layout. It only adjusts margins and alignment outside the virtualized lists; focused selected rows keep a solid background because Zotero swaps native icons for white versions there.

Themes are not a plain light/dark switch: Latte, Paper and Solarized Light are light themes, Frappé and Nord are dark themes, and Mocha or Dracula could be added later as themes of their own. Automatic mode stores `lightTheme` and `darkTheme` separately; fixed mode stores `theme`.

## Adding a theme

Add a complete definition to the `themes` array, with a unique lowercase hyphenated ID and a `mode` of `light` or `dark`. Colors must be six-digit hex; `shadow` may have eight digits. Every required field is validated at load time: a missing or invalid definition stops startup instead of applying half a theme. Unknown or removed theme IDs stored by users fall back to the default theme for that mode.

| Field | Used for |
| --- | --- |
| background / sidebar / toolbar / elevated | Content, side panes, toolbars, popups and input controls |
| text / muted / subtle | Body text, secondary text, faint decoration and disabled states |
| border / hover | Dividers and hover |
| selected / selectedText / inactiveSelected | Focused selection background and text, unfocused selection background |
| accent / onAccent | Accent color and the text on it |
| error / errorBackground | Validation errors |
| shadow | Faint shadows |

Body text, secondary text, selected text and text on the accent color must reach a contrast ratio of at least 4.5:1, which the tests check. When porting an external palette, darken or lighten colors that miss this and note it next to the theme definition (for example, Solarized's body tone base00 is under 4.5:1 on base3, so text uses base02). `subtle` is only for faint decoration and disabled information, never for important text.

Some of Zotero's selected-state icons are white SVGs, so focused selection uses a background dark enough to carry them; it cannot simply be swapped for a pale tint while ignoring the icons. Colored tag and annotation variables keep their original values.

## Compatibility rules

- Styles must be scoped to `:root[data-mzt-theme]`; modern layout rules to `:root[data-mzt-layout="modern"]`.
- Do not change virtualized list positioning, row heights, cell padding, first column width, scrolling or drag rules.
- Do not rearrange or replace native DOM, and do not copy the virtualized list renderer.
- Components specific to newer versions are targeted only with selectors that match when they exist; for example, Zotero 10's sticky group headers only get a background.
- Never change Zotero's appearance (`browser.theme.toolbar-theme`) automatically; the settings page only points out a mismatch, and the user clicks a button to change it. Do not change PDF pages or the semantic colors of annotations.
- Custom theme import is not implemented yet; it should use versioned JSON and go through the same validation and fallback.
