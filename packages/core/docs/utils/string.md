# utils/string.ts

- **层**：Data / utils
- **源码**：packages/core/src/utils/string.ts

## 职责

字符串工具。原 `extensions/string_extensions.ts` 的 `String.prototype` 补丁已改为纯函数。

## 导出

| API | 签名 | 用途 |
|---|---|---|
| `firstLetterLower` | `(value: string) => string` | 首字母小写（生成驼峰字段名、DI token） |
| `firstLetterUpper` | `(value: string) => string` | 首字母大写（拼类名、i18n key） |
| `toPascalCase` | `(value: string) => string` | 转 PascalCase |
| `thousandDigitFormat` | `(value: string) => string` | 千分位格式化（**入参是字符串**，数值先 `String(n)`） |

## 从原型扩展迁移

```ts
// 旧
s.firstLetterLower()
s.thousandDigitFormat()

// 新
firstLetterLower(s)
thousandDigitFormat(s)
```

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
- 不要再给 `String.prototype` 加方法（架构门禁会红）。