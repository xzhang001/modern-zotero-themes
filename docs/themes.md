# 主题与视觉设计约定

## 两个独立层次

`plugin/styles/modern.css` 负责控件轮廓、圆角、层次、表头字重、焦点、悬停和少量过渡。`plugin/themes.js` 负责配色，映射成 Zotero 的 CSS 变量和本插件的 `--mzt-*` 变量。各主题共用相同几何结构。

`plugin/styles/layout.css` 是可切换的“现代”界面层，以 `:root[data-mzt-layout="modern"]` 为作用域：框架（标题栏、标签栏、左侧栏）统一为 `--mzt-canvas`，文献列表和详情面板各为一张卡片，卡片边框按底色加深（`--mzt-card-border`）以保证在低对比显示器上可见；另含标签页、搜索框、表头和详情面板的排版。经典模式不加载这一层的效果。它只调整非虚拟列表区域的外边距和对齐；聚焦选中行保留实色底，因为 Zotero 在那里把原生图标换成白色版本。

主题不是单纯 Light/Dark 开关：Latte 是浅色主题，Frappé 是深色主题，未来的 Mocha、Dracula 也可以作为独立主题加入。自动模式分别保存 `lightTheme` 和 `darkTheme`，固定模式保存 `theme`。

## 新增主题

在 `themes` 数组中加入一个完整定义，使用唯一小写连字符 ID，以及 `light` 或 `dark` 的 mode。颜色必须为六位十六进制，shadow 可为八位。所有必需字段会在加载时验证；缺失或非法定义会阻止启动，而不是应用一半样式。未知或已删除的用户主题 ID 会回退到相应模式的默认主题。

| 字段 | 用途 |
| --- | --- |
| background / sidebar / toolbar / elevated | 内容、侧栏、工具栏、浮层与输入控件 |
| text / muted / subtle | 正文、辅助说明、弱装饰与禁用层级 |
| border / hover | 分隔与悬停 |
| selected / selectedText / inactiveSelected | 焦点内选中背景与文字、失焦选中背景 |
| accent / onAccent | 强调色及其上方文字 |
| error / errorBackground | 验证失败状态 |
| shadow | 微弱投影 |

普通正文、辅助说明、选中态和强调色文字对比度至少 4.5:1，由测试检查。subtle 仅用于弱装饰/禁用信息，不作为重要正文颜色。

Zotero 的部分选中图标直接使用白色 SVG，因此首版使用足够深的聚焦选中底色；不能仅把它换成浅粉紫而忽略图标。颜色标签和批注变量保持原值。

## 兼容原则

- 样式必须以 `:root[data-mzt-theme]` 为作用域；现代布局规则以 `:root[data-mzt-layout="modern"]` 为作用域。
- 不修改虚拟列表位置、行高、单元格内边距、首列宽度、滚动和拖动规则。
- 不重新排列或替换原生 DOM，不复制虚拟列表渲染器。
- 新版特有组件只用存在时才匹配的选择器；例如 Zotero 10 的固定分组表头只修改背景。
- 不自动修改 Zotero 外观（`browser.theme.toolbar-theme`）；只在设置面板提示不一致，由用户点击按钮修改。不修改 PDF 页面或批注语义颜色。
- 自定义主题导入尚未实现；未来应使用版本化 JSON，并通过同一校验和回退流程。
