# net/fetch_api_http.ts

- **层**：Data / net
- **源码**：packages/core/src/net/fetch_api_http.ts

## 职责

FetchApi 适配 HttpClient，供 ApiClient 使用。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
