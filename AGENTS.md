# MMDA 代理说明

产品横向分层是 **UI → Logic → Data**（见 [ARCHITECTURE.md](ARCHITECTURE.md)）。`@mmda/core` 只有 Logic 和 Data，没有 UI。

## 目的

- **Logic**：给程序员的规范接口。只写交互（显示、锁定、校验、引用加码过滤、onChange）。纯 TypeScript，不出现 Vue/React 类型。
- **Data**：给 Logic 用的标准接口（元数据、`MetaModel`、`ApiClient`）。不要自己拼 HTTP，不要改写共享元数据。
- **UI**：vui 与皮肤做配置和展现——挂上 Logic 函数。不写业务计算、不调 API。

## 原则

层只与相邻层交互。UI 不感知 Data。数据向下、事件向上。Logic 经 Data 读写，Data 更新后再交给 Logic 刷新 UI。

## Data 内目录（`packages/core/src`）

内部依赖：`utils` / `extensions` → `metaui` → `models` → `net`。`di` 只依赖 utils。

- `net`：服务器 API
- `metaui`：服务端界面元数据；`MetaUiService` 可依赖 net；`Module` 在此
- `models`：实体框架，`MetaModel` 用元数据操纵实体
- `logic`：程序员规范接口
- `di` / `utils` / `extensions` 依赖注入 / 工具列 /

引用范围：元数据 `reference.where`（SQL 硬限制）不可改写。业务加码用 `refFilter`，可叠加，由 Logic 与 `where` AND 组装。不要把 JS 过滤器写进 `MetaUiField`。

从 `@mmda/core` 顶层导入，不要 `@mmda/core/src/...`。

字段引用（enum / ref / hasOne）见 `.cursor/rules/mmda-field-reference.mdc`。core 设计说明见 `packages/core/docs/index.md`。
