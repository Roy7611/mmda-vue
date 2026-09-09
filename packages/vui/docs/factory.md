# Factory 控件契约

vui [`ui/factory/`](../src/ui/factory/) 只定 **chrome 控件怎么叫、props 叫什么**。皮肤 `factory/` 生产厂商节点。拼整页仍走 [Builder 与皮肤](./builder.md)。

字段单元格单枚 `tag` / `statusLight` 在 `UiFieldFactory`。多枚 `chips` / `tags` 走 chrome `factory.chips`。

## 组件参数约定

chrome 控件（button、badge、link…）对外用下面这些名。皮肤内部再映射到厂商属性（Prime `severity`、Naive `type`、EJ2 CSS 类），**不要**把厂商名写进 vui 契约。

| 中文 | vui 属性 | 含义 | 不要写成 |
|---|---|---|---|
| 形状 | `shape` | 轮廓：圆、胶囊、方… | `variant`、`type`、`rounded` |
| 大小 | `size` | 尺寸档：`small` / `large`（控件按自己的联合类型收窄） | `scale`、厂商 `xlarge` 直接暴露 |
| 颜色 | `colorRole` | MD3 语义色 [`UiColorRole`](../src/app/material.ts)：`primary` / `secondary` / `success` / `info` / `warning` / `danger` | `severity`、`type`、`color`、`role` |
| 位置 | `position` | 相对锚点的摆放。单边（tooltip）用 [`UiPosition`](../src/app/material.ts)：`top` / `bottom` / `left` / `right`。四角（角标）用控件自己的联合类型，如 `UiBadgePosition` | 混用 `severity`；角标不要复用 `UiPosition` |
| HTML | 袋键 `htmlAttributes`（`UiProps` 索引签名，非具名） | 落到真实 input / 根节点的原生属性（`title`、`name`、`autocomplete`、`data-*`）。皮肤**各自透传**（`htmlAttributesOf`） | 拆成一堆 vui 专用 `title`/`maxLength`；改名成 `attrs` / `inputProps` |

`placeholder`、`disabled`、`class` 是控件具名 API，不要塞进 `htmlAttributes`。`MetaUiField` 上的同名项由 **field_factory** 翻译成 chrome props（`placeholder` 具名；`maxLength` / `fieldName` 进 `htmlAttributes`）。

有就写这些名；没有的能力不要硬造（例如 Badge 的「MD3 小点 / 大计数」用 `shape: 'dot'` 和 `overlay`，不另开 `size`）。控件还可以有自己的业务字段（`value`、`label`、`overlay`、`buttonType`）。

`toast` / 校验仍可用 `severity`（error / warn），那是结果轻重，不是控件填色。

## 皮肤 CSS

```text
厂商 class（e-avatar-* / p-avatar / n-avatar）→ 长什么样
mmda-* class（mmda-avatar--primary）→ 空钩子，应用/主题可定制
皮肤 style.css → 不写长相，也不补厂商缺口
```

袋键 `htmlAttributes` 透传：Syncfusion 接到组件的 `htmlAttributes`；Prime / Naive / 原生节点合并到 vnode，解构时不要丢掉。

`colorRole` 能映射到厂商属性就映射（Badge 的 `e-badge-primary` / Prime `severity`）；厂商没有的就只挂 `mmda-*` 钩子，**不要在皮肤里写 background / 量尺 / `left` 覆盖**。EJ2 Badge 只有上下角，`topLeft` / `bottomLeft` 可以没有视觉效果。应用侧怎么钩 class：见 [avatar_usage.md](./avatar_usage.md)、[badge_usage.md](./badge_usage.md)。AutoComplete 定制见 [autocomplete_usage.md](./autocomplete_usage.md)。

## 一控件一文件

| 文件 | 契约 |
|---|---|
| [`button.ts`](../src/ui/factory/button.ts) | `shape`、`size`、`colorRole`、`buttonType`；容器 [ButtonGroup](./button_group.md)；分段 [SelectButtonGroup](./select_button_group.md)；怎么写 [button_usage.md](./button_usage.md) |
| core [`button.ts`](../../core/src/ui/button.ts) `UiDropDownButtonProps` | 整钮菜单 `factory.dropDownButton`；更多 `factory.moreMenuButton`（只委托）。见 [DropDownButton](./drop_down_button.md)、[怎么写](./drop_down_button_usage.md) |
| [`split_button.ts`](../src/ui/factory/split_button.ts) | 主段点击 + 箭头菜单 `factory.splitButton`。对照 EJ2 Getting Started，vui 名见 [SplitButton](./split_button.md)、[怎么写](./split_button_usage.md) |
| [`floating_action_button.ts`](../src/ui/factory/floating_action_button.ts) | 浮钮 `factory.floatingActionButton`。见 [FAB](./floating_action_button.md)、[怎么写](./floating_action_button_usage.md) |
| core [`chrome.ts`](../../core/src/ui/chrome.ts) `UiBadgeProps` | `shape`、`colorRole`、`position`；角标见 [Badge 设计](./badge.md)、[怎么写](./badge_usage.md) |
| core [`chrome.ts`](../../core/src/ui/chrome.ts) `UiAvatarProps` | `shape`、`size`、`colorRole`；见 [Avatar 设计](./avatar.md)、[怎么写](./avatar_usage.md) |
| [`autocomplete.ts`](../src/ui/factory/autocomplete.ts) | 皮肤辅助；契约 `UiAutoCompleteProps` 在 core。见 [AutoComplete 设计](./autocomplete.md)、[怎么写](./autocomplete_usage.md)。多 tag 走 [tagAutoComplete](./tag_auto_complete.md) |
| [`barcode.ts`](../src/ui/factory/barcode.ts) | 一维码 `factory.barcode`；见 [条码](./barcode.md)、[怎么写](./barcode_usage.md) |
| [`qrcode.ts`](../src/ui/factory/qrcode.ts) | 二维码 `factory.qrCode`；见 [二维码](./qrcode.md)、[怎么写](./qrcode_usage.md) |
| [`breadcrumb.ts`](../src/ui/factory/breadcrumb.ts) | 面包屑 `factory.breadcrumb`；见 [面包屑](./breadcrumb.md)、[怎么写](./breadcrumb_usage.md) |
| [`calendar.ts`](../src/ui/factory/calendar.ts) | 月视日历 `factory.calendar`；见 [日历](./calendar.md)、[怎么写](./calendar_usage.md) |
| [`date_picker.ts`](../src/ui/factory/date_picker.ts) | 带输入选日 `factory.datePicker`；选月捷径 `monthPicker`。见 [DatePicker](./date_picker.md)、[怎么写](./date_picker_usage.md) |
| [`date_time_picker.ts`](../src/ui/factory/date_time_picker.ts) | 日期+时间 `factory.dateTimePicker`。见 [DateTimePicker](./date_time_picker.md) |
| [`time_picker.ts`](../src/ui/factory/time_picker.ts) | 时刻 `factory.timePicker`。见 [TimePicker](./time_picker.md) |
| [`date_range_picker.ts`](../src/ui/factory/date_range_picker.ts) | 区间 `factory.dateRangePicker`。见 [DateRangePicker](./date_range_picker.md) |
| [`carousel.ts`](../src/ui/factory/carousel.ts) | 轮播 `factory.carousel`；见 [轮播](./carousel.md)、[怎么写](./carousel_usage.md) |
| [`checkbox.ts`](../src/ui/factory/checkbox.ts) | 勾选 `factory.checkBox`；见 [勾选](./checkbox.md)、[怎么写](./checkbox_usage.md)。横排多选见 [CheckBoxList](./check_box_list.md) |
| [`switch.ts`](../src/ui/factory/switch.ts) | 滑动开关 `factory.switch`。**不是** `checkBox`。见 [Switch](./switch.md)、[怎么写](./switch_usage.md) |
| [`color_picker.ts`](../src/ui/factory/color_picker.ts) | 取色 `factory.colorPicker`；值 hex；**不是** `colorRole`。见 [ColorPicker 设计](./color_picker.md)、[怎么写](./color_picker_usage.md) |
| [`masked_text_box.ts`](../src/ui/factory/masked_text_box.ts) | 掩码输入 `factory.maskedTextBox`；mask 用 EJ2 元素。见 [MaskedTextBox](./masked_text_box.md)、[怎么写](./masked_text_box_usage.md) |
| [`one_time_password_input.ts`](../src/ui/factory/one_time_password_input.ts) | 一次性口令 `factory.oneTimePasswordInput`。见 [OTP Input](./one_time_password_input.md)、[怎么写](./one_time_password_input_usage.md) |
| [`query_builder.ts`](../src/ui/factory/query_builder.ts) | 查询构建器 `factory.queryBuilder`（chrome，不是插件）。见 [Query Builder](./query_builder.md)、[怎么写](./query_builder_usage.md) |
| [`slider.ts`](../src/ui/factory/slider.ts) | 滑块 `factory.slider`。type 用 EJ2 Default / MinRange / Range。见 [Slider](./slider.md)、[怎么写](./slider_usage.md) |
| [`rating.ts`](../src/ui/factory/rating.ts) | 评分 `factory.rating`。itemsCount / readOnly 用 EJ2 词。见 [Rating](./rating.md)、[怎么写](./rating_usage.md) |
| [`sidebar.ts`](../src/ui/factory/sidebar.ts) | 侧栏 `factory.sidebar`；`factory.drawer` 是 Over 特化。见 [Sidebar](./sidebar.md)、[怎么写](./sidebar_usage.md) |
| [`splitter.ts`](../src/ui/factory/splitter.ts) | 分隔栏 `factory.splitter(panes, props)`。pane 不是 panel。见 [Splitter](./splitter.md)、[怎么写](./splitter_usage.md) |
| [`tabs.ts`](../src/ui/factory/tabs.ts) | 页签 `factory.tabs`。value 是下标；headerPlacement / scrollable。见 [Tabs](./tabs.md)、[怎么写](./tabs_usage.md) |
| [`toolbar.ts`](../src/ui/factory/toolbar.ts) | 三栏壳 `factory.toolbar`（Prime `start`/`center`/`end`）。**不是** EJ2 items。见 [Toolbar](./toolbar.md)、[怎么写](./toolbar_usage.md) |
| [`number_input.ts`](../src/ui/factory/number_input.ts) | 数值输入 `factory.numberInput`；format 用 EJ2 语法。见 [NumberInput](./number_input.md)、[怎么写](./number_input_usage.md) |
| [`text_input.ts`](../src/ui/factory/text_input.ts) | 单行文本 `factory.textInput`。见 [TextInput](./text_input.md)、[怎么写](./text_input_usage.md) |
| [`text_area.ts`](../src/ui/factory/text_area.ts) | 多行文本 `factory.textArea`。resizeMode 用 EJ2。见 [TextArea](./text_area.md)、[怎么写](./text_area_usage.md) |
| [`progress_bar.ts`](../src/ui/factory/progress_bar.ts) | 进度条 `factory.progressBar`；值 0–100。**不是** `factory.loading`。见 [ProgressBar](./progress_bar.md)、[怎么写](./progress_bar_usage.md) |
| [`signature_pad.ts`](../src/ui/factory/signature_pad.ts) | 签名面板 `factory.signaturePad`；值 PNG data URL。**不是** `imageEditor`。见 [SignaturePad](./signature_pad.md)、[怎么写](./signature_pad_usage.md) |
| [`stepper.ts`](../src/ui/factory/stepper.ts) | 步骤条 `factory.stepper`；值当前步索引。见 [Stepper](./stepper.md)、[怎么写](./stepper_usage.md) |
| [`timeline.ts`](../src/ui/factory/timeline.ts) | 时间轴 `factory.timeline`；默认事件列表。`setTimelinePlugin` 可换成 Tempis。见 [Timeline](./timeline.md)、[怎么写](./timeline_usage.md) |
| core [`chrome.ts`](../../core/src/ui/chrome.ts) `UiSkeletonProps` | 内容占位 `factory.skeleton`。**不是** `factory.loading`，没有 fldFactory。见 [Skeleton](./skeleton.md)、[怎么写](./skeleton_usage.md) |
| [`loading.ts`](../src/ui/factory/loading.ts) | 忙碌指示 `factory.loading`。EJ2 是 Spinner API，不是 Vue 控件。见 [Loading](./loading.md)、[怎么写](./loading_usage.md) |
| [`speech_to_text.ts`](../src/ui/factory/speech_to_text.ts) | 麦克风转写 `factory.speechToText`。没有 fldFactory。见 [SpeechToText](./speech_to_text.md)、[怎么写](./speech_to_text_usage.md) |
| [`drop_down_list.ts`](../src/ui/factory/drop_down_list.ts) | 封闭下拉 `factory.dropDownList`；不要叫 `dropdown`。见 [DropDownList 设计](./drop_down_list.md)、[怎么写](./drop_down_list_usage.md) |
| [`radio_button_group.ts`](../src/ui/factory/radio_button_group.ts) | 少选项单选组 `factory.radioButtonGroup`；绑定对齐 DropDownList。见 [RadioButtonGroup](./radio_button_group.md)、[怎么写](./radio_button_group_usage.md) |
| [`multi_select.ts`](../src/ui/factory/multi_select.ts) | 封闭多选 `factory.multiSelect`；四档 `bindMode`。见 [MultiSelect](./multi_select.md)、[怎么写](./multi_select_usage.md) |
| [`check_box_list.ts`](../src/ui/factory/check_box_list.ts) | 横排 `checkBoxList` / `bitCheckBoxList`。见 [CheckBoxList](./check_box_list.md) |
| [`tag_auto_complete.ts`](../src/ui/factory/tag_auto_complete.ts) | 可输入 tags `factory.tagAutoComplete`。见 [tagAutoComplete](./tag_auto_complete.md) |
| [`tree_select.ts`](../src/ui/factory/tree_select.ts) | 树下拉 `factory.treeSelect`（`dropDownTree` 别名）。见 [TreeSelect 设计](./tree_select.md)、[怎么写](./tree_select_usage.md) |
| [`combo_box.ts`](../src/ui/factory/combo_box.ts) | 可编下拉 `factory.comboBox`。见 [ComboBox 设计](./combo_box.md)、[怎么写](./combo_box_usage.md) |
| [`card.ts`](../src/ui/factory/card.ts) | 内容面板 `factory.card`；封面 / `headerImage` / `divider`。**不是** GroupCard。见 [Card 设计](./card.md)、[怎么写](./card_usage.md) |
| core [`chrome.ts`](../../core/src/ui/chrome.ts) `UiDividerProps` | 分隔线 `factory.divider`；**不是**菜单 `action.divider`。见 [Divider 设计](./divider.md)、[怎么写](./divider_usage.md) |
| [`tooltip.ts`](../src/ui/factory/tooltip.ts) | 提示气泡 `factory.tooltip` 包一层；**不是**按钮 `tooltip` 原生 title。见 [Tooltip](./tooltip.md)、[怎么写](./tooltip_usage.md) |
| [`inplace_editor.ts`](../src/ui/factory/inplace_editor.ts) | 就地编辑壳 `factory.inplaceEditor`；字段 `inplaceFieldEditor`。**不是**表格 `editable`。见 [InplaceEditor](./inplace_editor.md)、[怎么写](./inplace_editor_usage.md) |
| [`file_link.ts`](../src/ui/factory/file_link.ts) | 文件 URL `factory.fileLink`；`Url` / `FileLink` 别名。见 [FileLink](./file_link.md)、[怎么写](./file_link_usage.md) |
| [`file_uploader.ts`](../src/ui/factory/file_uploader.ts) | 单文件 `fileUploader`（SearchBox 形，框内可拖；无 `layout`/`dropArea`）/ 多文件 `filesUploader`。见 [FileUploader](./file_uploader.md)、[怎么写](./file_uploader_usage.md) |
| [`image_uploader.ts`](../src/ui/factory/image_uploader.ts) | 单图 `imageUploader` / 多图 `imagesUploader`。`imageGallery` 详情只读。见 [ImageUploader](./image_uploader.md)、[怎么写](./image_uploader_usage.md) |
| [`chips.ts`](../src/ui/factory/chips.ts) | 芯片列表 `factory.chips`；字段 `tags` / `enumChipSet` / `bitChipSet`。见 [Chips](./chips.md)、[怎么写](./chips_usage.md) |
| [`context_menu.ts`](../src/ui/factory/context_menu.ts) | 右键菜单 `factory.contextMenu`；见 [ContextMenu](./context_menu.md)、[怎么写](./context_menu_usage.md) |
| [`list.ts`](../src/ui/factory/list.ts) | re-export core `UiListProps` / `UiTableProps` / `UiGridProps` + Vue slots；管道最宽类型 `UiListPropsType`（= Grid）。`factory.list` / `table` / `grid` / `treeGrid` 捷径。程序员 API 分家，见 [列表与过滤](./list.md)。整页 props 在 [`builder/list_view.ts`](../src/ui/builder/list_view.ts)。树字段在 [`tree_grid.ts`](../src/ui/factory/tree_grid.ts)。列来自 MetaUi，不要 `GridColumn` |
| [`tree.ts`](../src/ui/factory/tree.ts) | 导航树 `factory.tree`。vui 名是 tree，不是 TreeView。见 [树](./tree.md)、[怎么写](./tree_usage.md) |
| [`chart.ts`](../src/ui/factory/chart.ts) | **不是** chrome。`UiChartFactory` 插件，见 [图表](./chart.md)、[怎么写](./chart_usage.md) |
| [`diagram.ts`](../src/ui/factory/diagram.ts) | **不是** chrome。`UiDiagramPlugin` 插件，见 [图](./diagram.md)、[怎么写](./diagram_usage.md) |
| [`markdown_editor.ts`](../src/ui/factory/markdown_editor.ts) | **不是** chrome。`UiMarkdownEditorPlugin` 插件，见 [Markdown 编辑器](./markdown_editor.md)、[怎么写](./markdown_editor_usage.md) |
| [`image_editor.ts`](../src/ui/factory/image_editor.ts) | **不是** chrome。`UiImageEditorPlugin` 插件，见 [图片编辑器](./image_editor.md)、[怎么写](./image_editor_usage.md) |
| [`kanban.ts`](../src/ui/factory/kanban.ts) | **不是** chrome。`UiKanbanPlugin` 插件，见 [看板](./kanban.md)、[怎么写](./kanban_usage.md) |
| [`gantt.ts`](../src/ui/factory/gantt.ts) | **不是** chrome。`UiGanttPlugin` 插件，见 [甘特](./gantt.md)、[怎么写](./gantt_usage.md) |
| [`ribbon.ts`](../src/ui/factory/ribbon.ts) | **不是** chrome。`UiRibbonPlugin` 插件，见 [Ribbon](./ribbon.md)、[怎么写](./ribbon_usage.md)。**不是** [`toolbar`](./toolbar.md) |
| [`scheduler.ts`](../src/ui/factory/scheduler.ts) | **不是** chrome。`UiSchedulerPlugin` 插件，见 [排程](./scheduler.md)、[怎么写](./scheduler_usage.md) |
| [`pivot_table.ts`](../src/ui/factory/pivot_table.ts) | **不是** chrome。`UiPivotPlugin` 插件，见 [透视表](./pivot_table.md)、[怎么写](./pivot_table_usage.md) |
| [`ai_assistant.ts`](../src/ui/factory/ai_assistant.ts) | **不是** chrome。`UiAiAssistantPlugin` 插件，见 [AI 助手](./ai_assistant.md)、[怎么写](./ai_assistant_usage.md) |
| [`factory.ts`](../src/ui/factory/factory.ts) | `UiFactory` 方法表 |

新 chrome 控件：先在 vui 定 props（沿用上表），再在三套皮肤实现 `factory.xxx()`。图表走 `setChartFactory`，图走 `setDiagramPlugin`，Markdown 走 `setMarkdownEditorPlugin`，图片编辑走 `setImageEditorPlugin`，看板走 `setKanbanPlugin`，甘特走 `setGanttPlugin`，Ribbon 走 `setRibbonPlugin`，排程走 `setSchedulerPlugin`，透视表走 `setPivotPlugin`，AI 助手走 `setAiAssistantPlugin`，时间轴默认是 chrome `factory.timeline`，`setTimelinePlugin` 可换成 Tempis，不要把 Tempis 写进皮肤。Query Builder 是 chrome `factory.queryBuilder`，不是插件。

## 皮肤 factory 怎么组装

`UiFactory` 是无状态函数表，**不要** class mixin。一控件一文件（或一组相关控件一个 partial），在 `createXxxUiFactory` 里组合：

```ts
const factory: any = {
  layout,
  ...navigationRenderers,
};
Object.assign(factory, buttonRenderers(factory), overlayRenderers());
```

需要闭包读 `factory.resolveIcon` 的（如 `actionButton`）用函数返回 partial：`buttonRenderers(factory)`。其余直接 `export const xxxRenderers = { ... }`。

列表族组装完后调用 `bindListDisplayRenderers(factory)`：按 `props.display` 分发；捷径 `factory.table` / `grid` / `treeGrid` 会写入缺省 display。本轮 table 与 grid 可指向同一 renderer。

Prime / Naive 已经是字面量挂函数，保持即可。不要 `attach*Renderers(factory)` 往对象上逐个赋值。
