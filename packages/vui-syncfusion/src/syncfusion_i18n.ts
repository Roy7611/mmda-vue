import { L10n, setCulture } from '@syncfusion/ej2-base'
import { isRef, watch, type App } from 'vue'
import enUS from '@syncfusion/ej2-locale/src/en-US.json'
import zhLocale from '@syncfusion/ej2-locale/src/zh.json'

/** Official `@syncfusion/ej2-locale` `zh` pack is Traditional Chinese. */
const PACKS: Record<string, Record<string, unknown>> = {
  'en-US': (enUS as { 'en-US': Record<string, unknown> })['en-US'],
  zh: (zhLocale as { zh: Record<string, unknown> }).zh,
}

/**
 * MMDA 维护的 EJ2 简体中文包。过滤器 Menu 的运算符位于 grid 段。
 *
 * 它以独立的 `zh-Hans` culture 加载，不覆盖官方繁体 `zh` 包。
 */
const zhHansLocale: Record<string, Record<string, string>> = {
  grid: {
    EmptyRecord: '暂无记录',
    True: '是',
    False: '否',
    InvalidFilterMessage: '无效的过滤条件',
    GroupDropArea: '将列标题拖到此处以分组',
    UnGroup: '点击此处取消分组',
    GroupDisable: '该列已禁用分组',
    FilterbarTitle: '过滤栏',
    EmptyDataSourceError: 'DataSource 不能为空',
    Add: '新增',
    Edit: '编辑',
    Cancel: '取消',
    Update: '更新',
    Delete: '删除',
    Print: '打印',
    Pdfexport: '导出 PDF',
    Excelexport: '导出 Excel',
    Wordexport: '导出 Word',
    Csvexport: '导出 CSV',
    Search: '搜索',
    Columnchooser: '列选择',
    Save: '保存',
    Item: '条',
    Items: '条',
    EditOperationAlert: '请先选择要编辑的记录',
    DeleteOperationAlert: '请先选择要删除的记录',
    SaveButton: '保存',
    OKButton: '确定',
    CancelButton: '取消',
    EditFormTitle: '编辑详情',
    AddFormTitle: '添加新记录',
    BatchSaveConfirm: '确定要保存更改吗？',
    BatchSaveLostChanges: '未保存的更改将丢失，确定继续吗？',
    ConfirmDelete: '确定要删除该记录吗？',
    CancelEdit: '确定要取消更改吗？',
    ChooseColumns: '选择列',
    SearchColumns: '搜索列',
    SearchOperator: '搜索运算符',
    Matchs: '未找到匹配项',
    FilterButton: '筛选',
    ClearButton: '清除',
    StartsWith: '开头是',
    EndsWith: '结尾是',
    Contains: '包含',
    Equal: '等于',
    NotEqual: '不等于',
    LessThan: '小于',
    LessThanOrEqual: '小于或等于',
    In: '在列',
    NotIn: '不在列',
    GreaterThan: '大于',
    GreaterThanOrEqual: '大于或等于',
    ChooseDate: '选择日期',
    EnterValue: '输入值',
    Copy: '复制',
    Group: '按此列分组',
    Ungroup: '取消此列分组',
    autoFitAll: '自动调整所有列',
    autoFit: '自动调整此列',
    Export: '导出',
    FirstPage: '首页',
    LastPage: '末页',
    PreviousPage: '上一页',
    NextPage: '下一页',
    SortAscending: '升序',
    SortDescending: '降序',
    EditRecord: '编辑记录',
    DeleteRecord: '删除记录',
    FilterMenu: '筛选',
    SelectAll: '全选',
    Blanks: '空白',
    FilterTrue: '是',
    FilterFalse: '否',
    NoResult: '未找到匹配项',
    ClearFilter: '清除筛选',
    NumberFilter: '数字筛选',
    TextFilter: '文本筛选',
    DateFilter: '日期筛选',
    DateTimeFilter: '日期时间筛选',
    MatchCase: '区分大小写',
    Between: '介于',
    CustomFilter: '自定义筛选',
    CustomFilterPlaceHolder: '输入值',
    CustomFilterDatePlaceHolder: '选择日期',
    AND: '并且',
    OR: '或者',
    ShowRowsWhere: '显示符合以下条件的行：',
    NotStartsWith: '开头不是',
    NotEndsWith: '结尾不是',
    NotContains: '不包含',
    IsNull: '为空',
    NotNull: '不为空',
    IsEmpty: '为空',
    IsNotEmpty: '不为空',
    AddCurrentSelection: '将当前选择加入筛选',
    Clear: '清除',
    SortAtoZ: '从 A 到 Z 排序',
    SortZtoA: '从 Z 到 A 排序',
    SortByOldest: '按最早排序',
    SortByNewest: '按最新排序',
    SortSmallestToLargest: '从小到大排序',
    SortLargestToSmallest: '从大到小排序',
    Sort: '排序',
    AscendingText: '升序',
    DescendingText: '降序',
    NoneText: '无',
  },
  pager: {
    currentPageInfo: '第 {0} 页 / 共 {1} 页',
    totalItemsInfo: '（{0} 条）',
    firstPageTooltip: '首页',
    lastPageTooltip: '末页',
    nextPageTooltip: '下一页',
    previousPageTooltip: '上一页',
    pagerDropDown: '每页条数',
    All: '全部',
  },
  calendar: {
    today: '今天',
  },
  datepicker: {
    today: '今天',
    placeholder: '选择日期',
  },
  datetimepicker: {
    today: '今天',
    placeholder: '选择日期时间',
  },
  timepicker: {
    placeholder: '选择时间',
  },
  dialog: {
    close: '关闭',
    ok: '确定',
    cancel: '取消',
  },
  dropdowns: {
    noRecordsTemplate: '暂无数据',
    actionFailureTemplate: '请求失败',
    selectAllText: '全选',
    unSelectAllText: '取消全选',
  },
  toast: {
    close: '关闭',
  },
}

let currentCulture = 'en-US'

const deepMerge = (
  base: Record<string, unknown>,
  overlay: Record<string, Record<string, string>>,
): Record<string, unknown> => {
  const next = { ...base }
  for (const [section, values] of Object.entries(overlay)) {
    next[section] = {
      ...((base[section] as Record<string, unknown> | undefined) ?? {}),
      ...values,
    }
  }
  return next
}

/** vui / vue-i18n locale → EJ2 culture name. */
export function resolveSyncfusionCulture(locale = 'zh'): string {
  const value = locale.toLowerCase().replace('_', '-')
  if (value.startsWith('zh-hant') || value === 'zh-tw' || value === 'zh-hk') {
    return 'zh-Hant'
  }
  if (
    value === 'zh' ||
    value.startsWith('zh-hans') ||
    value === 'zh-cn' ||
    value === 'zh-sg'
  ) {
    return 'zh-Hans'
  }
  if (value.startsWith('en')) return 'en-US'
  return locale
}

export function getSyncfusionCulture(): string {
  return currentCulture
}

export function applySyncfusionLocale(
  locale: string | Record<string, unknown> = 'zh',
): string {
  if (typeof locale !== 'string') {
    L10n.load(locale as Record<string, object>)
    const culture = Object.keys(locale)[0]
    if (culture) {
      currentCulture = culture
      setCulture(culture)
    }
    return currentCulture
  }

  const culture = resolveSyncfusionCulture(locale)
  if (culture === 'zh-Hans') {
    L10n.load({
      'zh-Hans': deepMerge(PACKS['en-US'] ?? {}, zhHansLocale),
    })
  } else if (culture === 'zh-Hant') {
    L10n.load({ 'zh-Hant': PACKS.zh ?? {} })
  } else if (culture === 'en-US') {
    L10n.load({ 'en-US': PACKS['en-US'] ?? {} })
  } else if (PACKS[culture]) {
    L10n.load({ [culture]: PACKS[culture] })
  }

  currentCulture = culture
  setCulture(culture)
  return currentCulture
}

function readLocale(locale: unknown): string | undefined {
  if (isRef(locale)) {
    const value = locale.value
    return typeof value === 'string' ? value : undefined
  }
  return typeof locale === 'string' ? locale : undefined
}

function i18nLocale(app: App): string | undefined {
  const i18n = app.config.globalProperties.$i18n as
    | { locale?: unknown }
    | undefined
  return i18n ? readLocale(i18n.locale) : undefined
}

/** Apply locale now, and follow vue-i18n when `app.changeLocale` updates it. */
export function installSyncfusionLocale(
  app: App,
  locale?: string | Record<string, unknown>,
): void {
  if (typeof locale === 'object' && locale) {
    applySyncfusionLocale(locale)
    return
  }
  applySyncfusionLocale(
    typeof locale === 'string' ? locale : (i18nLocale(app) ?? 'zh'),
  )

  const i18n = app.config.globalProperties.$i18n as
    | { locale?: unknown }
    | undefined
  if (!i18n?.locale) return
  watch(
    () => readLocale(i18n.locale),
    next => {
      if (next) applySyncfusionLocale(next)
    },
  )
}
