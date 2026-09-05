# core 内部分层

产品横向分层见仓库 [ARCHITECTURE.md](../../../ARCHITECTURE.md) 与 [AGENTS.md](../../../AGENTS.md)。`@mmda/core` **没有 UI**。

```text
UI     vui + 皮肤     配置与展现：设置 Logic 函数，展示 Logic 给出的状态
  ↑ 数据向下    ↓ 事件向上
Logic  core/logic     规范接口：程序员只写交互；纯 TS
  ↑ 新数据      ↓ 标准接口
Data   core 其余      元数据 / 实体 / HTTP；SSOT
```

规则：层只与相邻层说话；UI 不感知 Data；数据向下、事件向上；Logic 调 Data，Data 更新后再交给 Logic 刷新 UI。

## 目录

| 产品层 | 目录 | 职责 |
|---|---|---|
| Logic | `logic` | 给程序员的规范接口：`UiLogic` / Field/Group Logic / `UiContext`；纯 TS |
| Data | `net` | 与服务器 API 交互 |
| Data | `metaui` | 服务端下发的界面元数据；`Module` 在此；`MetaUiService` 可依赖 net |
| Data | `models` | 实体框架；`MetaModel` 用元数据操纵实体 |
| Data | `di` | 依赖注入 |
| Data | `utils` / `extensions` | 工具与类型扩展 |

Data 内部依赖：`utils` / `extensions` → `metaui` → `models` → `net`。`metaui` / `models` / `utils` 不 import `logic/`。`net` 不 import `metaui`：`MetaUi` 在 `MetaUiService` 里从 JSON 构造。

引用范围：元数据 `reference.where` 是 SQL 硬限制，不可改写。业务加码用 Logic `refFilter`，与 `where` AND。不要把 JS 过滤器写进 `MetaUiField`。
