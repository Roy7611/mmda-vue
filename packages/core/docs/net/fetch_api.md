# net/fetch_api.ts

- **层**：Data / net
- **源码**：packages/core/src/net/fetch_api.ts

## 职责

推荐传输层。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
