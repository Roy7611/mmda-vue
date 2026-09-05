# net/oauth_api_client.ts

- **层**：Data / net
- **源码**：packages/core/src/net/oauth_api_client.ts

## 职责

OAuthApiClient deprecated；用 OAuth2ApiClient。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
