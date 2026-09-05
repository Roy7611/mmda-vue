# net/http.ts

- **层**：Data / net
- **源码**：packages/core/src/net/http.ts

## 职责

HttpClient 与已 deprecated 的 FetchClient。推荐 FetchApi。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
