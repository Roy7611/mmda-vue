# Vue 运行时（索引）

本文档已拆到与 `@mmda/core` 相同的结构。请从 [README](../README.md) 进入：

| 文档 | 内容 |
|---|---|
| [应用壳](./application.md) | `MmdaVueApp`、`app.state`、鉴权、i18n |
| [实体交互逻辑](./logic.md) | vui 壳：`VueEntityLogic` / 路由；业务见 core EntityLogic 设计与用法 |
| [会话上下文](./context.md) | 程序员：`VueUiContext` / core `UiContext` |
| [会话设计](./vue_ui_context.md) | 一个类 + mixin 叠放；不是本地/远程两层 |
| [Builder 与皮肤](./builder.md) | `VueUiBuilder` 落地四职；皮肤 factory 对象组合。程序员用法见 [core 四职用法](../../core/docs/ui/ui_four_roles_usage.md) |
| [Factory 控件契约](./factory.md) | chrome 参数：`shape` / `size` / `colorRole` / `position` / `htmlAttributes` |
| [图表插件](./chart.md) | `chartFactory`；不进 chrome `factory` |
| [图表：怎么写](./chart_usage.md) | `setChartFactory`；皮肤 `./charts` 或独立引擎包 |
| [图插件](./diagram.md) | `diagramPlugin`；不进 chrome `factory` |
| [图：怎么写](./diagram_usage.md) | `setDiagramPlugin`；SF EJ2 / Vue Flow |
| [甘特插件](./gantt.md) | `ganttPlugin`；不进 chrome `factory` |
| [甘特：怎么写](./gantt_usage.md) | `setGanttPlugin`；SF EJ2 / DlhSoft Hyper |
| [Ribbon 插件](./ribbon.md) | `ribbonPlugin`；不进 chrome `factory`；不是 toolbar |
| [Ribbon：怎么写](./ribbon_usage.md) | `setRibbonPlugin`；目前仅 SF EJ2 |
| [排程插件](./scheduler.md) | `schedulerPlugin`；不进 chrome `factory` |
| [排程：怎么写](./scheduler_usage.md) | `setSchedulerPlugin`；Sf Schedule / Fc FullCalendar |
| [透视表插件](./pivot_table.md) | `pivotPlugin`；不进 chrome `factory`；契约跟 AG |
| [透视表：怎么写](./pivot_table_usage.md) | `setPivotPlugin`；SF 本地立方 / AG `pivotMode` |
| [AI 助手](./ai_assistant.md) | `aiAssistantPlugin`；不进 chrome `factory` |
| [AI 助手：怎么写](./ai_assistant_usage.md) | `setAiAssistantPlugin`；SF Inline AI Assist |
| [Markdown 编辑器](./markdown_editor.md) | `markdownEditorPlugin`；不进 chrome `factory` |
| [Markdown：怎么写](./markdown_editor_usage.md) | `setMarkdownEditorPlugin`；Vditor |
| [图片编辑器](./image_editor.md) | `imageEditorPlugin`；不进 chrome `factory` |
| [图片编辑：怎么写](./image_editor_usage.md) | `setImageEditorPlugin`；目前仅 SF EJ2 |
| [看板插件](./kanban.md) | `kanbanPlugin`；不进 chrome `factory` |
| [看板：怎么写](./kanban_usage.md) | `setKanbanPlugin`；SF EJ2 / SVAR |
| [Button 设计](./button.md) | `factory.button`；`colorRole` |
| [Button：怎么写](./button_usage.md) | 动作按钮、outlined + 色 |
| [ButtonGroup 设计](./button_group.md) | 容器壳 |
| [ButtonGroup：怎么写](./button_group_usage.md) | 嵌 `factory.button` |
| [SelectButtonGroup 设计](./select_button_group.md) | `selectionMode` |
| [SelectButtonGroup：怎么写](./select_button_group_usage.md) | 单选 / 多选 |
| [DropDownButton 设计](./drop_down_button.md) | 整钮菜单；`moreMenuButton` 只委托 |
| [DropDownButton：怎么写](./drop_down_button_usage.md) | `dropDownButton` / `moreMenuButton` |
| [SplitButton 设计](./split_button.md) | 主段点击 + 箭头菜单；EJ2 Getting Started 对照 vui 名 |
| [SplitButton：怎么写](./split_button_usage.md) | 单参数 props；Naive 降级为整钮下拉 |
| [FAB 设计](./floating_action_button.md) | `factory.floatingActionButton`；九宫格 `position` |
| [FAB：怎么写](./floating_action_button_usage.md) | 图标钮 / extended；Prime/Naive 降级 |
| [Badge 设计](./badge.md) | `factory.badge`；`overlay` 角标 |
| [Badge：怎么写](./badge_usage.md) | 行内标记、角标 overlay |
| [Avatar 设计](./avatar.md) | `factory.avatar` 图片 / 缩写 / 图标 |
| [Avatar：怎么写](./avatar_usage.md) | 页脚头像、缩写 |
| [AutoComplete 设计](./autocomplete.md) | `factory.autoComplete` 联想文本 |
| [AutoComplete：怎么写](./autocomplete_usage.md) | 自定义 / suggest / REF |
| [tagAutoComplete 设计](./tag_auto_complete.md) | 可输入多 tag；不要改 AutoComplete 为 multiple |
| [tagAutoComplete：怎么写](./tag_auto_complete_usage.md) | join 字符串 |
| [条码设计](./barcode.md) | `factory.barcode` 一维码 |
| [条码：怎么写](./barcode_usage.md) | `value` / `format` / `displayText` |
| [二维码设计](./qrcode.md) | `factory.qrCode`；Data Matrix 用 `format` |
| [二维码：怎么写](./qrcode_usage.md) | 省略 format 即 QR |
| [面包屑设计](./breadcrumb.md) | `factory.breadcrumb` |
| [面包屑：怎么写](./breadcrumb_usage.md) | `items` / `to` / 模块链 |
| [日历设计](./calendar.md) | `factory.calendar` 月视选日 |
| [日历：怎么写](./calendar_usage.md) | 多选、格子渲染、农历/生产日历 |
| [DatePicker 设计](./date_picker.md) | `factory.datePicker` / `monthPicker`；带输入选日 |
| [DatePicker：怎么写](./date_picker_usage.md) | allowInput / showShortcuts / 字段 |
| [DateTimePicker 设计](./date_time_picker.md) | `factory.dateTimePicker` |
| [DateTimePicker：怎么写](./date_time_picker_usage.md) | step 分钟 |
| [TimePicker 设计](./time_picker.md) | `factory.timePicker` |
| [TimePicker：怎么写](./time_picker_usage.md) | 时刻 Date |
| [DateRangePicker 设计](./date_range_picker.md) | `factory.dateRangePicker`；`[Date, Date]` |
| [DateRangePicker：怎么写](./date_range_picker_usage.md) | separator / shortcuts |
| [轮播设计](./carousel.md) | `factory.carousel` |
| [轮播：怎么写](./carousel_usage.md) | items / autoPlay / loop / fade |
| [勾选设计](./checkbox.md) | `factory.checkBox`；字段走 `fieldFactory.checkbox` |
| [勾选：怎么写](./checkbox_usage.md) | label / indeterminate / 字段翻译 |
| [Switch 设计](./switch.md) | `factory.switch`；滑动开关；**不是** `checkBox` |
| [Switch：怎么写](./switch_usage.md) | checked / onLabel；字段 `fieldFactory.switch` |
| [Toolbar 设计](./toolbar.md) | `factory.toolbar`；Prime 三槽；**不是** EJ2 items |
| [Toolbar：怎么写](./toolbar_usage.md) | start / center / end；layout full/medium/compact |
| [布局设计](./layout.md) | `UiLayout` / `AbstractUiLayout` / `VueUiLayout`；**不是** AppLayout 脚手架 |
| [布局：怎么写](./layout_usage.md) | `layout.layoutField` / `layoutPage` / `listTile` |
| [CheckBoxList 设计](./check_box_list.md) | 横排 `checkBoxList` / `bitCheckBoxList` |
| [CheckBoxList：怎么写](./check_box_list_usage.md) | value_array 与 or_bits |
| [ColorPicker 设计](./color_picker.md) | `factory.colorPicker`；hex；**不是** `colorRole` |
| [ColorPicker：怎么写](./color_picker_usage.md) | mode / showModeSwitcher；字段翻译 |
| [MaskedTextBox 设计](./masked_text_box.md) | `factory.maskedTextBox`；mask 用 EJ2 元素 |
| [MaskedTextBox：怎么写](./masked_text_box_usage.md) | `MOBILE_MASK` / `ZIP_MASK`；字段翻译 |
| [OTP Input 设计](./one_time_password_input.md) | `factory.oneTimePasswordInput`；length / type 用 EJ2 词 |
| [OTP Input：怎么写](./one_time_password_input_usage.md) | `length` / `type` / `separator`；字段翻译 |
| [Query Builder 设计](./query_builder.md) | `factory.queryBuilder`；AG Advanced Filter 树，不是列 FilterModel |
| [Query Builder：怎么写](./query_builder_usage.md) | `fields` / `value` / `onChange`；searchAll 本轮不传 |
| [Slider 设计](./slider.md) | `factory.slider`；EJ2 Range Slider 就是本控件 |
| [Slider：怎么写](./slider_usage.md) | `type` Default / MinRange / Range；字段翻译 |
| [Rating 设计](./rating.md) | `factory.rating`；itemsCount / readOnly；模板换形状 |
| [Rating：怎么写](./rating_usage.md) | `itemsCount` / `readOnly` / `emptyTemplate`；字段翻译 |
| [Sidebar 设计](./sidebar.md) | `factory.sidebar`；`drawer` 是 Over 特化 |
| [Sidebar：怎么写](./sidebar_usage.md) | `isOpen` / `type` / dock；drawer 覆盖弹层 |
| [Splitter 设计](./splitter.md) | `factory.splitter`；pane 不是 panel |
| [Splitter：怎么写](./splitter_usage.md) | orientation / resize；pane.content 嵌套 |
| [Tabs 设计](./tabs.md) | `factory.tabs`；value 下标；headerPlacement / scrollable |
| [Tabs：怎么写](./tabs_usage.md) | items / value / Fill |
| [NumberInput 设计](./number_input.md) | `factory.numberInput`；format 用 EJ2 语法 |
| [NumberInput：怎么写](./number_input_usage.md) | decimals / step / percent；字段翻译 |
| [TextInput 设计](./text_input.md) | `factory.textInput`；单行；不要 `input` 双参 |
| [TextInput：怎么写](./text_input_usage.md) | value / placeholder / type Password |
| [TextArea 设计](./text_area.md) | `factory.textArea`；resizeMode 用 EJ2 |
| [TextArea：怎么写](./text_area_usage.md) | value / rows；不要 textarea 双参 |
| [ProgressBar 设计](./progress_bar.md) | `factory.progressBar`；值 0–100；**不是** `loading` |
| [ProgressBar：怎么写](./progress_bar_usage.md) | kind / size / 字段翻译 |
| [SignaturePad 设计](./signature_pad.md) | `factory.signaturePad`；PNG data URL；**不是** `imageEditor` |
| [SignaturePad：怎么写](./signature_pad_usage.md) | onReady / 字段翻译；非 SF 部分 no-op |
| [Stepper 设计](./stepper.md) | `factory.stepper`；当前步索引 |
| [Stepper：怎么写](./stepper_usage.md) | `orientation` / 子表 `*Field` |
| [Timeline 设计](./timeline.md) | `factory.timeline`；默认列表，插件 Tempis |
| [Timeline：怎么写](./timeline_usage.md) | `setTimelinePlugin`；`timeField` / `relativeTime` |
| [Skeleton 设计](./skeleton.md) | `factory.skeleton`；内容占位；**不是** `loading` |
| [Skeleton：怎么写](./skeleton_usage.md) | 首次水合用 skeleton；后续忙碌仍用 loading |
| [Loading 设计](./loading.md) | `factory.loading`；整页/区域转圈；不要 spinner |
| [Loading：怎么写](./loading_usage.md) | label / size；buildLoading 转调 |
| [SpeechToText 设计](./speech_to_text.md) | `factory.speechToText`；麦克风转写；**不是** `input` / `aiAssistant` |
| [SpeechToText：怎么写](./speech_to_text_usage.md) | 麦 + 旁边 input；HTTPS / 麦克风权限 |
| [DropDownList 设计](./drop_down_list.md) | `factory.dropDownList` 封闭列表；不要叫 `dropdown` |
| [DropDownList：怎么写](./drop_down_list_usage.md) | options / group / icon / suggest |
| [RadioButtonGroup 设计](./radio_button_group.md) | `factory.radioButtonGroup`；少选项 enum / ref；**不是** `selectButtonGroup` |
| [RadioButtonGroup：怎么写](./radio_button_group_usage.md) | 字段 `editor: RadioButtonGroup`；optionLabel |
| [MultiSelect 设计](./multi_select.md) | 封闭多选；四档 bindMode |
| [MultiSelect：怎么写](./multi_select_usage.md) | multiItemSelect / multiValueSelect / join / bits |
| [TreeSelect 设计](./tree_select.md) | `factory.treeSelect` 树下拉；`dropDownTree` 别名 |
| [TreeSelect：怎么写](./tree_select_usage.md) | TREE `refFlds[2]` 父字段；lazy `getRoots` |
| [ComboBox 设计](./combo_box.md) | `factory.comboBox` 可编下拉 |
| [ComboBox：怎么写](./combo_box_usage.md) | allowCustom；字段翻译 |
| [Card 设计](./card.md) | `factory.card`；封面、headerImage；**不是** GroupCard |
| [Card：怎么写](./card_usage.md) | title / image / divider |
| [Divider 设计](./divider.md) | `factory.divider`；**不是**菜单 `action.divider` |
| [Divider：怎么写](./divider_usage.md) | orientation / label |
| [Tooltip 设计](./tooltip.md) | `factory.tooltip` 包一层；**不是**按钮原生 title |
| [Tooltip：怎么写](./tooltip_usage.md) | position / opensOn / onReady |
| [InplaceEditor 设计](./inplace_editor.md) | `factory.inplaceEditor` 壳；fld `inplaceFieldEditor`。**不是**表格 `inplaceEdit` |
| [InplaceEditor：怎么写](./inplace_editor_usage.md) | display / content；表单还没接线 |
| [FileLink 设计](./file_link.md) | `factory.fileLink`；URL；`downloadable` / `preview` |
| [FileLink：怎么写](./file_link_usage.md) | FileLink / Url；不要 externalLink |
| [FileUploader 设计](./file_uploader.md) | 单 `fileUploader` / 多 `filesUploader`；落库 URL |
| [FileUploader：怎么写](./file_uploader_usage.md) | onUpload 返回 URL；旧名别名 |
| [ImageUploader 设计](./image_uploader.md) | 单 `imageUploader` / 多 `imagesUploader`；详情 `imageGallery` |
| [ImageUploader：怎么写](./image_uploader_usage.md) | 预览、可选 ImageEditor |
| [Chips 设计](./chips.md) | `factory.chips`；字段 `tags` / `enumChipSet` / `bitChipSet` |
| [Chips：怎么写](./chips_usage.md) | kind / colorRole / icon / 字段翻译 |
| [ContextMenu 设计](./context_menu.md) | `factory.contextMenu`；右键/长按锚点 |
| [ContextMenu：怎么写](./context_menu_usage.md) | items / target / onSelect |
| [列表与过滤](./list.md) | 工具栏、搜索、表头日期 multi、`select()` / selectMany |
| [表格契约](../../vui-syncfusion/docs/sf-grid.md) | 厂商无关的 Grid 接口（各皮肤共用） |
| [SfGrid 设计](../../vui-syncfusion/docs/sf-grid-design.md) | Syncfusion 皮肤如何实现该契约 |
| [树](./tree.md) | `factory.tree`；vui 名 tree，不要 TreeView |
| [树：怎么写](./tree_usage.md) | `factory.tree` / `buildTree`；链 treeSelect / treeGrid |
| [树形表格](./treegrid.md) | `factory.treeGrid`；列来自 MetaUi，不是 EJ2 `GridColumn` |
| [树形表格：怎么写](./treegrid_usage.md) | `viewKind` / 子表 shapeKey / `editable` |

core 对照：[core README](../../core/README.md)。
