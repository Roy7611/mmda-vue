# 校验：程序员怎么写

从 `@mmda/core` 导入。不要 `@mmda/core/src/...`。内置名字与参数见 [validator.md](./validator.md)。设计见 [validation_design.md](./validation_design.md)。

## 先用元数据

服务器字段 `validationRules`，多个校验器英文 **分号** 隔开：

```text
Min(0);Max(100)
NotBlank;MaxLength(50)
Email
Range(0,100);Integer
Pattern(^[A-Z]{2}\d{4}$)
```

加载后变成 `field.validatorDescriptors`，`this.field('qty')` 时已经装进 `validators`。你不必再 parse。

能写在规则串里的不要再抄一遍 `onValidate`。必填不要写进规则串：列 `nullable`，或 Logic 里 `required()` / `requiredIf`。

```ts
this.field('qty').required()
this.field('remark').requiredIf((model) => model.needRemark === true)
```

引用字段（非枚举）空值按「未选」处理（`0` / `'0'` 也算未选）。

## 自定义：叠加，不覆盖

`onValidate` **追加**到同一条链上，不会丢掉元数据规则。通过返回 `''` / `undefined`；失败返回 i18n key、已翻译字符串，或 `{ message, param }`。

```ts
this.field('expirationDays').onValidate((value, model, ctx) => {
  if (value != null && value > 32767) return ctx.t('bom.expirationDaysMax')
})
```

跨字段（开始 ≤ 结束、与另一列比较）也走这里，不要发明规则串语法。

## 警告：不拦保存

第二个参数 `'warning'`。保存、`validate()` 仍为 true；结果在 `$v[field].warning`，不进 `getFieldError` / `errorNum`。

```ts
this.field('remark').onValidate((value, model, ctx) => {
  if (value && String(value).length >= 255) {
    return ctx.t('productionEvent.remarkMaxLength')
  }
}, 'warning')
```

没有 `onWarn`。不要用 warning 表达必填或硬范围。

## 空值和长度

`null` / `undefined` / `''` / 纯空白：除必填、`NotBlank`、`NotEmpty` 外，其它规则通过。

列 `maxLength` 是库列长度，只给输入框 `maxlength`。业务要更短的上限，写规则串 `MaxLength(n)`。

## 规则串写法

| 要表达 | 写法 |
|---|---|
| 多条 | `Min(0);Positive` |
| 无参数 | `Email`、`Integer`、`Past` |
| 一个参数 | `Max(100)`、`After(2020-01-01)` |
| 两个参数 | `Range(0,100)`、`Length(2,8)`、`Size(1,10)`、`Digits(5,2)` |
| 正则里有分号 | `Pattern(a;b)`（括号内的 `;` 不会拆规则） |
| 正则里有 `)` | `Pattern("a)b")` |

`Url` 只认 `http`/`https`。任意 URI 用 `Uri`。`IdCard` 是 18 位身份证。`Digits(2)` 限制小数位；`Digits(5,2)` 是整数位 + 小数位。

未知名字加载时 `console.warn`，该条跳过，页面还能开。

## 读结果（UI / 调试）

```ts
const ok = await ctx.validate()           // 仅 error 为 false
ctx.getFieldError('qty')                  // 错误文案，拦保存
ctx.$v.qty.message                        // 同上
ctx.$v.qty.warning                        // 警告，不拦保存
```

隐藏、只读字段不计入。皮肤不要另写一套 EJ2 列规则当权威。

## 返回值约定

内置规则返回 `invalid.*` key（如 `invalid.minValue`，参数 `it`）。自定义优先 `ctx.t('模块.key')`，与其它 Logic 文案一致。

```ts
return { message: 'invalid.maxValue', param: { it: 100 } }
```

## 不要

- 不要改 `MetaUiField.validationRules` / `validatorDescriptors` 当运行时开关
- 不要把 JS 过滤器写进元数据字段
- 不要用 `onValidate` 覆盖整条链（它本来就是追加）
- 不要为库列 `maxLength` 再写一条相同的 `MaxLength`，除非业务上限更严
