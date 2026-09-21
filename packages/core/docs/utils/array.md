# utils/array.ts

- **层**：Data / utils
- **源码**：packages/core/src/utils/array.ts

## 职责

数组工具。原 `extensions/array_extensions.ts` 的 `Array.prototype` 补丁已改为纯函数。

## 导出

| API | 签名 | 用途 |
|---|---|---|
| `skipUndefined` | `<T>(items: T[]) => T[]` | 去掉 `undefined` 元素 |
| `skipNullAndUndefined` | `<T>(items: T[]) => T[]` | 去掉 `undefined` 与 `null` 元素 |
| `nonUndefinedArray` | `<T>(items: T[]) => T[]` | 与 `skipUndefined` 同实现 |
| `nonNullArray` | `<T>(items: T[]) => T[]` | 与 `skipNullAndUndefined` 同实现 |

> `nonUndefinedArray` / `nonNullArray` 与上面的 `skip*` 是**同一实现的两个名字**，收敛前新代码请统一用 `skipUndefined` / `skipNullAndUndefined`。

## 从原型扩展迁移

```ts
// 旧
items.skipUndefined()
items.skipNullAndUndefined()

// 新
skipUndefined(items)          // 返回新数组，不改原数组
skipNullAndUndefined(items)
```

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
- 不要再给 `Array.prototype` 加方法（架构门禁会红）。