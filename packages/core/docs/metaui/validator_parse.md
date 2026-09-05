# metaui/validator_parse.ts

- **层**：Data / metaui
- **源码**：packages/core/src/metaui/validator_parse.ts

## 职责

把 `validationRules` 字符串扫成 `{ name, args[] }`。只在加载时跑一次。

不要让 metaui 依赖 logic。
