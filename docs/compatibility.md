# 兼容性与验收记录

## 当前证据

开发基线：Zotero 10.0.5。目标平台：Windows、macOS。

| 项目 | 状态 |
| --- | --- |
| 7.0 / 8.0 / 9.0 / 10.0.5 配色、主窗口、列表及插件源码检查 | 已完成 |
| 主题解析、配色对比度、无效配置回退 | Node 自动检查 |
| 启动/停用、新窗口、监听器清理、主题持久化 | 模拟 Zotero 接口检查 |
| 浏览器三主题与实际设置面板交互 | 浏览器预览检查 |
| Windows Zotero 10.0.5 | 待原生验收 |
| macOS Zotero 10.0.5 | 待原生验收 |
| Zotero 7 / 8 / 9 实际运行 | 待原生验收 |

manifest 的 7.0–10.0.* 表示开发预览版可安装范围，并非全版本兼容认证。发布稳定版前按下表记录具体小版本、平台和结果。

## 原生验收

每个平台先使用 10.0.5 的独立配置，再对 7/8/9 的目标小版本重复检查。

1. 安装/禁用/启用/重启：样式应用一次，停用恢复原样，无残留设置入口。
2. 设置面板三个主题即时切换；关闭重开后保留；自动模式在 Zotero 自身设为自动时跟随系统。打开面板不显示“已保存”；固定主题与 Zotero 外观深浅不同、或跟随系统但 Zotero 外观非自动时出现提示，点击按钮后 Zotero 外观改变、提示消失。
3. 空字段隐藏时可通过点击任意字段显示全部字段并完成编辑，保存后有值的字段保留显示。对比主题启用前后列表行高、列宽、滚动位置和列头对齐不变；现代布局下内容卡片只缩进 8px，经典布局下面板尺寸与原生一致。堆叠布局、窄窗口下卡片和分隔线正常。
4. 单选、多选、失焦选中、键盘焦点、拖放、匹配高亮、未读、禁用状态可辨认。
5. 大型文献库滚动正常，无错位、跳行或明显性能下降。
6. 左右侧栏折叠、拖动分隔条、堆叠布局、标签页拖动均正常。
7. Zotero 10 多文献库选择和固定分组表头不透底、不错位。
8. 详情字段编辑、搜索、原生图标、中文/英文、RTL、125%/150%/200% 缩放。
9. 颜色标签、PDF 批注保留含义；其他插件的按钮及详情面板没有被破坏。
10. 系统高对比模式和减少动态效果设置生效。

## 检查过的上游资料

- https://www.zotero.org/support/dev/zotero_7_for_developers
- https://www.zotero.org/support/dev/zotero_8_for_developers
- https://www.zotero.org/support/dev/zotero_9_for_developers
- https://www.zotero.org/support/dev/zotero_10_for_developers
- https://github.com/zotero/zotero/blob/10.0.5/chrome/content/zotero/xpcom/plugins.js
- https://github.com/zotero/zotero/blob/10.0.5/chrome/content/zotero/xpcom/preferencePanes.js
- https://github.com/zotero/zotero/blob/10.0.5/scss/components/_virtualized-table.scss

7→8 的模块系统变化通过避免导入版本相关模块来减少影响；不调用条目/集合数据 API。8/9/10 同平台仍存在 DOM 与样式差异，不能只根据 Firefox 版本推断兼容。
