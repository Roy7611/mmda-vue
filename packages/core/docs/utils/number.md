# utils/number.ts

- **层**：Data / utils
- **源码**：packages/core/src/utils/number.ts

## 职责

数值工具。原 `extensions/number_extensions.ts` 的 `Number.prototype` 补丁已改为纯函数。

## 导出

| API | 签名 | 用途 |
|---|---|---|
| `toPrecise` | `(value: number, digits?: number) => string` | 按精度取整并**返回字符串**（默认 6 位），避免浮点尾差（`0.1 + 0.2`） |
| `hasBit` | `(value: number, bit: number) => boolean` | 位标志判断（`ModuleOp` 等），替代 `(value & bit) === bit` 的裸写法 |

## 从原型扩展迁移

```ts
// 旧
n.toPrecise(2)          // Number.prototype.toPrecise
n.hasBit(ModuleOp.Edit) // Number.prototype.hasBit

// 新
toPrecise(n, 2)         // 注意返回 string
hasBit(n, ModuleOp.Edit)
```

`hasBit` 是当前权限位判断的主力写法（15 个文件在用）；看到裸 `&` 运算可直接换成它。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
- 不要再给 `Number.prototype` 加方法（架构门禁会红）。