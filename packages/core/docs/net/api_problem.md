# net/api_problem.ts

- **层**：Data / net
- **源码**：packages/core/src/net/api_problem.ts

## 职责

RFC 9457 错误。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
