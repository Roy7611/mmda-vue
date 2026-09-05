# 校验框架重构设计

对照旧实现（`parseValidationRules` + `validateField` 三选一短路），把规则执行收进 Logic，元数据只保留字符串和描述符。产品分层仍是 **UI → Logic → Data**（见 [core_architecture.md](../core_architecture.md)）。

程序员用法见 [validation_usage.md](./validation_usage.md)。内置名字见 [validator.md](./validator.md)。

## 为什么改

旧链路：

```text
validationRules 字符串
  → split(';') + 第一个 ')' 截断
  → field.validationRulesParseds
  → validateField：onValidateFn 或 规则 或 必填（三选一）
```

问题：

- 有自定义 `onValidate` 就不跑元数据规则；有规则就跳过 `nullable` 必填。
- 解析只在主表组构造时做，子表 `groupUi` 容易漏。
- 执行几乎只有数值 min/max/range；`parseInt` 会弄坏小数。
- `onWarn` 与校验/保存脱节；警告和错误混在同一套「非法」语义里。
- 可执行逻辑挂在 Data 的字段对象上，命名 `Parseds` 也不清。

## 目标链路

```text
服务器 validationRules
  → parseValidatorDescriptors（加载时一次扫描）
  → field.validatorDescriptors { name, args[] }
  → FieldLogic.validators（注册表实例 + onValidate 追加）
  → validateField 全跑
  → severity：error 拦保存；warning 只展示
```

必填不进规则串：运行时看 `nullable` / `requiredFn`，引用非枚举仍用 `requiredNonZero`。

## 分层

| 层 | 放什么 | 不放什么 |
|---|---|---|
| Data `MetaUiField` | `validationRules`；只读 `validatorDescriptors` | 可执行 `validate`、Vue |
| Data `validator_parse.ts` | O(n) 扫描，无 logic 依赖 | 业务规则实现 |
| Logic `validators/` | `FieldValidator`、注册表、Min/Email 等 | `$v` 树、保存按钮 |
| Logic `field_logic.ts` | 构造时组装 `validators`；`onValidate` 追加 | 改写元数据 |
| Logic `validation.ts` | `$v`、`validateField` / `validateFieldResult` | 再解析字符串 |
| UI vui | 把 result 写进 `$v.message` / `$v.warning`；`validate()` 只计 error | 自己实现规则；EJ2 列 `validationRules` 当权威 |

`metaui` 不能 import `logic`。因此解析必须在 Data。

## 文件

- [`metaui/validator_parse.ts`](../../src/metaui/validator_parse.ts)：`ValidatorDescriptor`、`parseValidatorDescriptors`
- [`logic/validation.ts`](../../src/logic/validation.ts)：状态树与编排
- [`logic/validators/`](../../src/logic/validators/)：`types` / `registry` / `number` / `datetime` / `string` / `collection`
- 不拆成一器一文件，也不把扫描器塞回 `validation.ts`

`MetaUiField` 构造时 parse；`MetaUiGroup` 把裸 JSON 包成 `MetaUiField`，主表子表同一路径。

## 解析

分隔符是 **`;`**（`Range(0,100)` 里的逗号是参数）。一次循环：括号深度 + 引号状态。

- `Pattern(foo;bar);Min(1)` 两条规则
- `Pattern((a|b))` 分组括号不提前结束
- 字面 `)` 用引号：`Pattern("a)b")`

名字保持原样（`Max`，不是 `max`）。非法 token `console.warn` 后跳过，不打断加载。只在加载时跑；失焦/保存只跑已组装的函数。

## 执行语义

1. Required（动态，不进 `validators` 数组）
2. 元数据组装的校验器（一律 `error`）
3. `onValidate` 追加的 `Custom`（默认 `error`，可 `'warning'`）

全部执行，消息用 `；` 拼接。空值除 `NotBlank` / `NotEmpty` / Required 外通过。列 `maxLength` 只绑控件，不生成 `MaxLength`。已删除从未下发的 `MetaUiField.min` / `max`。

`validateField` 仍返回 error 字符串（兼容 `getFieldError`）。完整结果走 `validateFieldResult`：`{ errors, warnings }`。`UiFieldValidation.warning` 不计 `errorNum`。

已删除独立 `onWarn`。未知校验器名 warn 后跳过。后补名字（`Alpha`、`CreditCode` 等）尚未注册，出现在规则串里会走未知名警告。

## 对皮肤

表单与就地编辑共用 `validateField`。不要把元数据规则投影成 EJ2 `column.validationRules` 当权威。网格只负责取消非法 `cellSave` 并展示框架给出的消息。
