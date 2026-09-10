# UiBuilder：程序员怎么写

> **已由四职文档取代。**  
> 设计：[ui_four_roles_design.md](./ui_four_roles_design.md)  
> 用法：[ui_four_roles_usage.md](./ui_four_roles_usage.md)  
> 总览：[ui.md](../ui.md)

本页保留为旧书签入口。请勿再按下文过时的 `buildTable` / `buildField` / `buildListView` 写法新增代码。

---

（历史摘要，仅供对照）

旧文档曾把列表薄包（`buildTable` / `buildGrid`）、字段行（`buildField`）和应用壳（`buildAppScaffold`）都写在 Builder 上。现约定：

| 旧 | 新 |
|---|---|
| `buildField` | `fldFactory.render` |
| `buildTable` 等 | `factory.table` 等 |
| `buildAppScaffold` | `AppLayout.scaffold` |
| `buildSigninForm` | `factory.signinForm` |
| `buildView` | `buildEntityView` |
| `buildTreeListView` | `buildExplorerView` |
