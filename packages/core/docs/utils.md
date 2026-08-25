# 工具函数（@mmda/core）

面向业务与框架开发者。`utils` 与 [extensions](./extensions.md) **同属包内最底层**，不依赖 models / net / metaui。全部从 `@mmda/core` 导出。框架真正依赖的只有 **`is` / `localdb` / `pluralize`**；格式化、树、防抖、UA 主要给 vui 和页面用。位运算 `hasBit` 在 extensions，不在这里。

日期时间计算优先用包里再导出的 luxon（`DateTime` / `Duration` / `Interval`），不要再引一份 moment。某个 `Date` 实例上的 `weekStart()` / `toSQL()` 见 [extensions.md](./extensions.md)。

---

## 1. 最小例子

```ts
import {
  isNullOrUndefined,
  useLocalAsyncDb,
  pluralize,
  dateTimeRange,
  DateRangeKind,
  debounce,
} from '@mmda/core'

if (isNullOrUndefined(id) || isRefNone(id)) return

const repo = pluralize('Warehouse') // 'Warehouses'
const { start, end } = dateTimeRange[DateRangeKind.LAST_7_DAYS]()

const db = useLocalAsyncDb('wms', locale)
await db.put(`meta/${repo}`, pack)

const onSearch = debounce((q: string) => api.searchAll({ q }), 300)
```

约定：

- 类型判断用 `is*`，不要自己写 `typeof` 和 `== null` 两套口径
- 本地缓存用 `useLocalAsyncDb`，key 自己带业务前缀
- 仓储名用 `pluralize`（和 MetaUi 的 repository 规则一致）
- 筛选「今天 / 近 7 天」用 `dateTimeRange[DateRangeKind.xxx]()`，不要手算

---

## 2. 怎么选

| 模块 | 干什么 | 环境 |
|---|---|---|
| `is` | 类型守卫、是否浏览器 | Node / 浏览器 |
| `localdb` | 按应用+语言隔离的本地 KV | 浏览器（IndexedDB 优先） |
| `pluralize` | 实体名 → 仓储名 | 任意 |
| `date_range` | 预定义 luxon 区间 | 任意 |
| 原型扩展 | `Date`/`String` 实例方法、`hasBit`，见 [extensions.md](./extensions.md) | 任意 |
| `formatter` | 显示用：金额、工期、文件大小 | 任意（相对时间要能跑 luxon） |
| `platform` | UA：手机 / 微信 / 小程序 | 读 `navigator`，结果进程内缓存 |
| `tools` | 防抖、树、模拟 ESC | ESC 仅 DOM |

---

## 3. is：类型守卫

```ts
import {
  isBrowser,
  isNullOrUndefined,
  isRefNone,
  isEmpty,
  isPlainObject,
  isPromise,
  isMobile,
} from '@mmda/core'
```

| 函数 | 为 true 当 |
|---|---|
| `isNullOrUndefined` | `null` 或 `undefined` |
| `isRefNone` | 空值或 `'0'`（外键未选） |
| `isEmpty` | 数组缺省或 `length == 0` |
| `isNullObject` | 对象且没有自己的 key |
| `isPlainObject` | `[object Object]`，数组不是 |
| `isObject` | 非 null 的 `typeof === 'object'`（**数组也是**） |
| `isPromise` | 对象且有 `then` + `catch` |
| `isPromiseLike` | 上面，或带 `then`/`catch` 的**函数** |
| `isFile` | 存在 `File` 且 `instanceof File` |
| `isBrowser` | `typeof window !== 'undefined'` |
| `isMobile` | 浏览器里简易 UA；Node 为 `false` |

`isArray` 就是 `Array.isArray`。

不要用 `isObject` 当「纯对象」：`isObject([]) === true`。要纯对象用 `isPlainObject`。

手机端：页面布局用 `isMobile()` 够用；微信 / iOS / 小程序用 `Platform.*`（见第 8 节）。

---

## 4. localdb：本地 KV

```ts
import { useLocalAsyncDb, LocalStorageDb } from '@mmda/core'

const db = useLocalAsyncDb('wms', 'zh-Hans')
await db.put('meta/Warehouses', pack)
const hit = await db.get('meta/Warehouses')

await db.putMany([
  ['a', 1],
  ['b', 2],
])
const [a, b] = await db.getMany(['a', 'b'])
```

`useLocalAsyncDb`：有 IndexedDB 用 `LocalIndexedDb`，否则 `LocalAsyncStorageDb`（包一层 `localStorage`）。两边都没有就抛错。

物理 key 是 `{dbName}/{locale}/{key}`。`zh` 和 `en` 不会撞。

只认 JSON：`put` 会 `JSON.stringify`，函数字段拿回来是 `undefined`。

| 方法 | 注意 |
|---|---|
| `get` 缺失 | Storage 实现是 `null`；IndexedDB 常是 `undefined`。用 `if (!hit)` |
| `clear()` | **只删本库本 locale 的前缀**，不会清空整个 `localStorage` |
| `LocalStorageDb(..., sessionOnly: true)` | 走 `sessionStorage` |
| `deleteKeysContaining(fragment)` | IndexedDB 按 key 片段删。旧名 `getAllKeys` 已弃用（它并不读取） |

MetaUi 缓存已经用这一套。自己存时不要和 `meta/` 抢 key。

---

## 5. pluralize：仓储名

```ts
import { pluralize } from '@mmda/core'

pluralize('Warehouse')          // Warehouses
pluralize('Equipment')          // Equipments（不规则，不是 Equipment）
pluralize('Person')             // Persons
pluralize('paper')              // paper（不可数）
pluralize('regex')              // regexii
```

和后端 repository、MetaUi 字段上的复数规则对齐。库会改大小写，例如 `ProjectSettlement` → `Projectsettlements`，`I` → `WE`。需要固定拼写时自己断言，不要假定驼峰保持不变。

领域不规则词目前写在 core 里。新实体尽量用规则复数，少加不规则规则。

---

## 6. 日期区间

```ts
import { DateRangeKind, dateTimeRange, toDateRange } from '@mmda/core'

const luxonRange = dateTimeRange[DateRangeKind.THIS_MONTH]()
// { start: DateTime, end: DateTime }  已 startOf/endOf 到该粒度的边界

const { start, end } = toDateRange(luxonRange) // JS Date，给日期控件
```

| `DateRangeKind` | 含义 |
|---|---|
| `TODAY` / `YESTERDAY` | 当天 / 昨天 0 点～结束 |
| `THIS_WEEK` / `LAST_WEEK` | luxon 的周（默认周一起点看 locale） |
| `LAST_7_DAYS` / `LAST_30_DAYS` | **含今天**共 7 / 30 个日历日 |
| `THIS_MONTH` / `LAST_MONTH` | 自然月 |
| `THIS_QUARTER` / `LAST_QUARTER` | 季 |
| `THIS_YEAR` / `LAST_YEAR` | 年 |
| `EARLIER` | 筛选项哨兵，**没有**对应函数 |

```ts
dateTimeRange[DateRangeKind.EARLIER] // 类型上就不存在
```

每次调用都按 **调用当下的 `DateTime.now()`** 算，不是单例。周、月边界用 luxon，不要自己 `setDate`。已有 `Date` 上的 `weekStart()` / `toSQL()` 见 [extensions.md](./extensions.md)。

---

## 7. formatter：给人看的字符串

输入是 **number / SQL 日期字符串**（`yyyy-MM-dd HH:mm:ss`），不是随意的 ISO。

```ts
import {
  n2,
  friendlySeconds,
  friendlyHours,
  friendlyDays,
  relativeTime,
  daysBetween,
  formatFileSize,
  formatAmount,
  preciseRound,
  getParams,
  encodeUriAndFix,
} from '@mmda/core'

n2(2.345)                    // '2.35'  （toFixed）
friendlySeconds(3661, 'en')  // 含 hour / minute（会 rescale 进位）
friendlyHours(48, 'en')      // 仍是 hours，故意不进位成天
friendlyDays(10)             // 中文「周 / 天」，locale 参数目前不起作用
relativeTime('2024-01-01 12:00:00', 'zh')
daysBetween(startSql, endSql, 'en')
formatFileSize(1024)         // '1.00 KB'（1024 进位）
formatAmount(1234.5)         // '1,234.50'
formatAmount('abc')          // '0.00'
preciseRound(1.225, 2)       // 1.23
getParams('https://x/a?id=1&tag=a&tag=b')
// { id: '1', tag: ['a', 'b'] }
```

`n1`～`n4` 就是 `toFixed(1..4)`，二进制小数可能导致 `2.15` 变成 `'2.1'`。金额展示用 `formatAmount`。

`decimals === 0` 时 `preciseRound` 走 `Math.round`：`Math.round(-1.5) === -1`（向 +∞）。

旧拼写 `getParmas` 仍是 `getParams` 的别名，新代码用 `getParams`。

---

## 8. Platform：UA

```ts
import { Platform, isMobile } from '@mmda/core'

Platform.isMobile()
Platform.isIOS()
Platform.isAndroid()
Platform.isPad()
Platform.isWechat()       // UA 含 micromessenger / wechat
Platform.isMiniprogram()
```

无 `window` 时全是 `false`。UA 在**模块加载时读一次并缓存**，单测里改 `navigator.userAgent` 不会刷新（除非重载模块）。

`isMobile()` 和 `Platform.isMobile()` 正则不是同一套。布局用哪个就固定用哪个，不要混着判断。

---

## 9. tools：防抖和树

```ts
import {
  debounce,
  throttle,
  mapTree,
  getNodePath,
  isSubsetByKey,
  triggerEscKey,
} from '@mmda/core'
```

**debounce / throttle**：返回的是普通 `function`，作为方法调用时 `this` 是调用方。默认间隔 300ms。

```ts
const search = debounce(this.load, 300)
input.addEventListener('input', (e) => search.call(this, e))
```

**mapTree**：每个节点（含叶子）都跑 `mapper`。第三参是孩子字段名，默认 `'children'`。空孩子写成 `[]`（同一字段名）。根为假值时返回 `null`。

**getNodePath**：路径是 **根 → 目标**（不是子到父）。`target` 可以是 id 或带 `id` 的对象。找不到返回 `[]`。

```ts
getNodePath(tree, '3').map((n) => n.id) // ['1', '2', '3']
```

**isSubsetByKey(arrA, arrB, key)**：A 里每个元素的 `key` 都能在 B 里找到。

**triggerEscKey(cb?)**：在 `document` 上派发 `Escape` 的 `keydown`，然后调用 `cb`。只在浏览器用。

---

## 10. 和 DI / net 怎么配合

```ts
di.provide('wmsDb', () => useLocalAsyncDb('wms', locale))

const onType = debounce((q: string) => {
  di.inject(ApiToken).repository(pluralize('Warehouse')).searchAll({ q })
}, 300)
```

不要每个组件 `new LocalStorageDb('wms')` 又各写各的 locale。和 `MetaUiService` 共用同一 `dbName` + locale，缓存才能命中。

---

## 11. 常见错误

1. **`isObject` 当纯对象** — 数组也会过。用 `isPlainObject`。
2. **`clear()` 会清掉别人的 localStorage** — 已经改成只删 `{dbName}/{locale}/`。不要再自己 `localStorage.clear()`。
3. **以为 `getAllKeys` 是列举 key** — 实际是按片段删除。用 `deleteKeysContaining`。
4. **`dateTimeRange[DateRangeKind.EARLIER]`** — 没有实现。筛「更早」自己用 `start` 之前比较。
5. **`friendlyDays` 当 i18n** — 文案写死中文。
6. **`getParmas` 新代码继续写错** — 用 `getParams`。
7. **Node 里 `triggerEscKey` / 部分 `Platform`** — 需要 `document` / `navigator`。
8. **混用 `isMobile` 和 `Platform.isMobile`** — 结果可能不一致。
9. **`getNodePath` 当「从当前节点往上」** — 顺序是根在前。
10. **pluralize 当保持驼峰的纯字符串工具** — 不规则词会改大小写。

---

## 12. 从旧行为迁移

| 旧行为 | 现在 |
|---|---|
| `isMobile()` 在 Node 抛错 | 返回 `false` |
| 微信 UA `micromessenager` | `micromessenger` |
| `http.beforeRequest` 覆盖式（net） | 与 utils 无关；见 `docs/net.md` |
| `LocalStorageDb.clear()` 清空整个 storage | 只删本前缀 |
| `getAllKeys` | `deleteKeysContaining` |
| `getParmas` | `getParams`（旧名仍可用） |
| `debounce` 箭头函数导致 `this` 丢失 | 调用时 `this` 正确 |
| `mapTree` 叶子不 mapper、空孩子写成 `.children` | 叶子会 mapper；空孩子用你传入的 key |
| `DateRangeKind` 在 `models/date_range` | 定义在 utils，从 `@mmda/core` 导入即可。`models/date_range` 仍 re-export 该枚举 |
| 两套 `DateRange` 类型打架 | 现在的 `DateRange` 是 `{ start, end }` 的 JS Date 区间 |
