# 数据校验器

内置名字与参数。规则串怎么写、`onValidate`、警告见 [validation_usage.md](./validation_usage.md)。分层与文件见 [validation_design.md](./validation_design.md)。

## 数值

1. 最小 `Min(0)`，最大 `Max(100)`
2. 大于 `Gt(0)`，大于等于 `Ge(0)`，小于 `Lt(0)`，小于等于 `Le(0)`
3. 正数 `Positive`，正数或 0 `PositiveOrZero`
4. 负数 `Negative`，负数或 0 `NegativeOrZero`
5. 范围 `Range(0,100)`
6. 小数 `Digits(2)` 或 `Digits(integer,fraction)`
7. 整数 `Integer`，倍数 `MultipleOf(n)`

## 日期时间

1. 过去 `Past`，过去或现在 `PastOrPresent`
2. 将来 `Future`，将来或现在 `FutureOrPresent`
3. 之后 `After(d)`，之后或等于 `AfterOrEqual(d)`
4. 之前 `Before(d)`，之前或等于 `BeforeOrEqual(d)`

## 字符串

- 最大长度 `MaxLength(100)`，最小 `MinLength(1)`，长度 `Length(min, max)`
- 限 Ascii 和长度 `Ascii(15)`，限 Unicode 长度 `Unicode(255)`
- 正则 `Pattern(a-z|A-Z|0-9)`，`Email`，`Uri`，`Url`（http/https），`Mobile`，`PhoneNumber`
- 非空 `NotBlank`，`Uuid`，`IdCard`（18 位身份证）

## 集合

- 非空 `NotEmpty`
- 大小 `Size(max)` 或 `Size(min,max)`

## 后补（名字已定，尚未实现）

`Alpha` `Alphanumeric` `StartsWith` `EndsWith` `Contains` `Ipv4` `Ipv6` `Hostname` `Json` `Unique` `CreditCode`
