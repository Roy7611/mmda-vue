import { SqlDataType } from './datatype'
import {
  defaultColumnFilterOps,
  MetaUiFilterType,
  type MetaUiFilterOpCode,
} from './metaui_filter'
import { pluralize } from '../utils/pluralize'
import { isNullObject, isNullOrUndefined } from '../utils/is'
import { hasBit } from '../utils/number'
import {
  parseValidatorDescriptors,
  type ValidatorDescriptor,
} from './validator_parse'

export {
  parseValidatorDescriptors,
  type ValidatorDescriptor,
} from './validator_parse'

export interface Translatable {
  message: string
  param?: unknown
  plural?: number
}

export type TranslateFn = (message: string | Translatable) => string
export enum MetaUiFieldAlignment {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  CENTER = 'CENTER',
  JUSTIFY = 'JUSTIFY',
  START = 'START',
  END = 'END',
}

/**
 * 聚合类型
 */
export const enum MetaAggregation {
  NONE = 0, //默认，从数据源获取后未更改
  COUNT = 1, //计数
  SUM = 2, //求和
  AVG = 4, //平均值
  MIN = 8, //最小值
  MAX = 16, //最大值
  FIRST = 32, //首值
}

export type Nullable<T> = T | null
export type Nullishable<T> = T | null | undefined

/**
 * 元界面域初始化类型
 *
 * @remarks
 *
 * 指用户界面的一个基本元素的定义，比如一个输入框，表格列或者显示文本的元数据。
 * 定义了其展现方式、编辑和互动行为。
 */
export interface MetaUiFieldInit {
  fieldIdx: number // 域顺序
  fieldName: string // 域名称
  displayLabel: string // 显示标签
  dataType: SqlDataType //数据类型，参考{@link SqlDataType}
  nullable: boolean // 是否可为空值

  // 列表
  emphasized?: boolean // 重要，在最简列表显示
  listed?: boolean // 列出，桌面端列表显示
  /** 联查子表字段：原 groupUi 内分组的 groupLabel，给多级表头用 */
  subGroupLabel?: string
  mergeLabel?: string
  mergePrefix?: string
  listSize?: number // 列显示宽度，像素；缺省按字段类型估算
  listPos?: number // 列表列顺序；缺省按 fieldIdx。勿与详情 fieldIdx 混用
  align?: MetaUiFieldAlignment // 对齐方式
  sortable?: boolean // 可排序，通常是有索引的字段支持排序
  /**
   * 列过滤器类型位掩码，见 {@link MetaUiFilterType}。
   * 服务端下发不会空；本地未写时可用 {@link MetaUiField.inferColumnFilterType}。
   */
  filterTypes?: number
  aggregationSet?: MetaAggregation // 聚合函数

  // 渲染
  hidden?: boolean // 隐藏
  frozen?: MetaUiFieldFrozen // 冻结：'' | left | right
  readOnly?: boolean // 只读，只显示不能编辑
  /** 详情组网格占几列，缺省 1。不存起始格；2/3 列切换时运行时装箱。 */
  colSpan?: number
  /** 详情组网格占几行，缺省 1。 */
  rowSpan?: number
  renderer?: string // 渲染器
  formatter?: string // 显示格式，例如D为长日期，翻译为各种编
  prefix?: string // 前缀文本，如%
  suffix?: string // 后缀文本，如%
  nullDisplayText?: string // 空值显示文本

  editor?: string // 编辑器
  selectOptions?: string // 选择项设置，例如：[{"value":"UNINSPECT"}]
  placeholder?: string // 输入提示
  tooltip?: string // 工具提示

  dataBinding?: string // 数据绑定，如风格、颜色等定制展现方式

  ////////////////////////////
  // 以下为metacol的属性（只读）
  ////////////////////////////

  primaryKey?: boolean //是否主键

  maxLength?: number //字符串最大长度，用于CHAR/VARCHAR

  unsigned?: boolean //是否无符号，用于整型
  numericPrecision?: number //数值精度
  numericScale?: number //小数位数
  validationRules?: string // 校验规则

  formula?: string // 公式
  defaultVal?: string // 缺省值
}

/**
 * 图片格式
 * @remarks
 * 从MetaUiField.formatter中解析，例如200*200.webp => W 200, H 200, 转格式.webp，例如?*100 限制100高度
 */
export interface MetaUiImageFormat {
  width?: number
  height?: number
  fileExt?: string
}

const _imgReg = /^([\d|\?]+)?[_|\*]?([\d|\?]+)(\.\w+)?$/
const parseImageFormat = (format: string): MetaUiImageFormat | null => {
  const matches = format.match(_imgReg)
  if (matches == null) return null
  let [w, h, fileExt] = matches
  return {
    width: Number.isNaN(w) ? undefined : Number(w),
    height: Number.isNaN(h) ? undefined : Number(h),
    fileExt,
  }
}
export const toImageFormat = (
  imgFormat: MetaUiImageFormat,
  prefix?: string
) => {
  const { width, height, fileExt } = imgFormat
  if (width == null && height == null) return ''

  let format = prefix ?? ''
  if (width) {
    format += width.toFixed(0)
    if (height) format += '_' + height.toFixed(0)
  } else {
    if (height) format += height.toFixed(0)
  }
  format += fileExt ?? ''
  return format
}

export enum MetaUiFieldFrozen {
  None = '',
  Left = 'left',
  Right = 'right',
}

export const listColumnOrder = (field: {
  listPos?: number
  fieldIdx: number
}) => field.listPos ?? field.fieldIdx

export const listFreezeBand = (frozen?: string | MetaUiFieldFrozen): 0 | 1 | 2 => {
  const value = String(frozen ?? '').toLowerCase()
  if (value === MetaUiFieldFrozen.Left || value === 'left') return 0
  if (value === MetaUiFieldFrozen.Right || value === 'right') return 2
  return 1
}

export const compareListColumns = (
  a: { listPos?: number; fieldIdx: number; frozen?: string | MetaUiFieldFrozen },
  b: { listPos?: number; fieldIdx: number; frozen?: string | MetaUiFieldFrozen },
) => {
  const band = listFreezeBand(a.frozen) - listFreezeBand(b.frozen)
  if (band) return band
  return listColumnOrder(a) - listColumnOrder(b)
}

export const isListFrozen = (frozen?: string | MetaUiFieldFrozen) =>
  listFreezeBand(frozen) !== 1

/** 冻结列必须出现在列表：listed=true，hidden=false */
export function ensureListFieldVisibleWhenFrozen(field: MetaUiField) {
  if (!isListFrozen(field.frozen)) return
  field.listed = true
  field.hidden = false
}

/**
 * 元界面域
 *
 * @remarks
 *
 * 指用户界面的一个基本元素的定义，比如一个输入框，表格列或者显示文本的元数据。
 * 定义了其展现方式、编辑和互动行为。
 *
 * 字段形状在 {@link MetaUiFieldInit}；这里只补构造后才有的成员。
 */
export interface MetaUiField extends MetaUiFieldInit {
  frozen: MetaUiFieldFrozen
  linkable?: boolean
  validatorDescriptors: ValidatorDescriptor[]
  /** 参考选项，四种 {@link MetaRelationType}，定义选择数据源 */
  reference?: MetaUiFieldRef
  imageFormat?: MetaUiImageFormat
}

export class MetaUiField {
  constructor(init: MetaUiFieldInit) {
    Object.assign(this, init)
    delete (this as { min?: unknown }).min
    delete (this as { max?: unknown }).max
    if (this.frozen == null) this.frozen = MetaUiFieldFrozen.None
    if (this.selectOptions) {
      this.reference = MetaUiFieldRef.parse(this.selectOptions) ?? undefined
    }
    this.validatorDescriptors = parseValidatorDescriptors(this.validationRules)
  }

  /**
   * 按 dataType + reference 推断简单类型：boolean | date | number | text | set。
   * enum / ref / hasOne → set。JOIN / MULTI 不在这里。
   * 静态版给皮肤处理尚未 `new MetaUiField` 的字段袋。
   */
  static inferColumnFilterType(field: {
    dataType: SqlDataType
    reference?: { isEnum?: boolean; isRef?: boolean; hasOne?: boolean }
  }): MetaUiFilterType {
    const ref = field.reference
    if (ref?.isEnum || ref?.isRef || ref?.hasOne) return MetaUiFilterType.SET
    if (SqlDataType.isBool(field.dataType)) return MetaUiFilterType.BOOLEAN
    if (SqlDataType.isDate(field.dataType)) return MetaUiFilterType.DATE
    if (SqlDataType.isNum(field.dataType) && !ref) return MetaUiFilterType.NUMBER
    return MetaUiFilterType.TEXT
  }

  inferColumnFilterType(): MetaUiFilterType {
    return MetaUiField.inferColumnFilterType(this)
  }
}

/** 列过滤能力的最小字段形状：位掩码 + 类型 + 引用。 */
export interface ColumnFilterField {
  filterTypes?: number
  dataType: SqlDataType
  reference?: { isEnum?: boolean; isRef?: boolean; hasOne?: boolean }
}

/**
 * 列过滤位掩码：服务端 `filterTypes` 优先；本地未写时按 dataType + reference 推断
 * （{@link MetaUiField.inferColumnFilterType}）。
 */
export function resolveColumnFilterTypes(field: ColumnFilterField): number {
  return Number(field.filterTypes) || MetaUiField.inferColumnFilterType(field)
}

/** 位测试：可传字段或现成掩码。 */
export function hasFilterType(
  fieldOrMask: ColumnFilterField | number,
  bit: MetaUiFilterType,
): boolean {
  const mask =
    typeof fieldOrMask === 'number'
      ? fieldOrMask
      : resolveColumnFilterTypes(fieldOrMask)
  return hasBit(mask, bit)
}

/** 简单比较类型：date / number / text。布尔 / 集合不算简单比较。 */
export function simpleFilterTypeOf(
  field: ColumnFilterField,
): 'text' | 'number' | 'date' {
  const mask = resolveColumnFilterTypes(field)
  if (hasBit(mask, MetaUiFilterType.DATE)) return 'date'
  if (hasBit(mask, MetaUiFilterType.NUMBER)) return 'number'
  if (hasBit(mask, MetaUiFilterType.TEXT)) return 'text'
  const inferred = MetaUiField.inferColumnFilterType(field)
  if (inferred === MetaUiFilterType.DATE) return 'date'
  if (inferred === MetaUiFilterType.NUMBER) return 'number'
  return 'text'
}

/**
 * 列过滤算子表（表头菜单口径），按 {@link MetaUiFilterType} 位给出。
 * set 位（enum / ref / hasOne、纯集合列）只出 IN / NOT_IN；比较位出各家族算子；
 * 两族都在（`multi` 列）时合并 —— 搜索页用「同字段多行」分别表达两种叶子。
 * 不要用 {@link getFieldFilterOps}（SQL 片段口径）代替。
 */
export function getColumnFilterOps(
  field: ColumnFilterField,
): MetaUiFilterOpCode[] {
  const mask = resolveColumnFilterTypes(field)
  if (hasBit(mask, MetaUiFilterType.BOOLEAN)) {
    return [...defaultColumnFilterOps.BooleanFieldOps]
  }
  const set =
    hasBit(mask, MetaUiFilterType.SET) || hasBit(mask, MetaUiFilterType.MULTI)
  const compare =
    hasBit(mask, MetaUiFilterType.TEXT) ||
    hasBit(mask, MetaUiFilterType.NUMBER) ||
    hasBit(mask, MetaUiFilterType.DATE)
  if (set && !compare) return [...defaultColumnFilterOps.SetFieldOps]
  const compareOps = hasBit(mask, MetaUiFilterType.DATE)
    ? [...defaultColumnFilterOps.DateFieldOps]
    : hasBit(mask, MetaUiFilterType.NUMBER)
      ? [...defaultColumnFilterOps.NumberFieldOps]
      : hasBit(mask, MetaUiFilterType.TEXT)
        ? [...defaultColumnFilterOps.TextFieldOps]
        : [...columnFilterOpsOfInferred(MetaUiField.inferColumnFilterType(field))]
  return set
    ? [...compareOps, ...defaultColumnFilterOps.SetFieldOps]
    : compareOps
}

function columnFilterOpsOfInferred(
  type: MetaUiFilterType,
): readonly MetaUiFilterOpCode[] {
  if (type === MetaUiFilterType.DATE) return defaultColumnFilterOps.DateFieldOps
  if (type === MetaUiFilterType.NUMBER)
    return defaultColumnFilterOps.NumberFieldOps
  if (type === MetaUiFilterType.BOOLEAN)
    return defaultColumnFilterOps.BooleanFieldOps
  if (type === MetaUiFilterType.SET) return defaultColumnFilterOps.SetFieldOps
  return defaultColumnFilterOps.TextFieldOps
}

/**
 * 关系类型：HAS_ONE,HAS_MANY,REF
 */
export enum MetaRelationType {
  HAS_ONE = 'HAS_ONE', // 一对一
  HAS_MANY = 'HAS_MANY', // 一对多
  REF = 'REF', // 引用
  ENUM = 'ENUM', // 枚举
}
/**
 * 选择源数据形状
 */
export enum MetaOptionsShape {
  FLAT,
  GROUPED,
  TREE,
}

// test at https://www.mklab.cn/utils/regex
const _refExp =
  /^(\w+)\s(\w+(?:\.\w+)?)\(([\w|,]+)\)(?:\s+AS\s+(\w+))?(?:\s+WHERE\s*\((.+)\))?(?:\s+GROUP\s+BY\s+(\w+))?(?:\s+(READONLY))?$/
type propFn = (item: unknown) => any
type MetaUiRefOption = Record<string, any>
export interface MetaUiFieldRefInit {
  refType: MetaRelationType
  refObjName: string
  refRepository?: string
  refFlds: string[]
  alias?: string
  groupBy?: string
  where?: string
  readOnly?: boolean
  refDbName?: string
  refOptions?: MetaUiRefOption[]
  refOptionsShape: MetaOptionsShape
}
export class MetaUiFieldRef {
  private constructor(init: MetaUiFieldRefInit) {
    Object.assign(this, init)
  }

  static parse(selectOptions: string, bitable: boolean = false) {
    if (selectOptions.startsWith('[')) {
      const refOptions = JSON.parse(selectOptions)
      const reference = new MetaUiFieldRef({
        refType: MetaRelationType.ENUM,
        refObjName: 'vt',
        refFlds: ['value', 'text'],
        refOptions: refOptions,
        refOptionsShape: MetaOptionsShape.FLAT,
      })
      reference.labelFn = (valueObject: unknown) => {
        const option = valueObject as MetaUiRefOption | null | undefined
        return option ? (option.text ?? option.label ?? '') : ''
      }
      return reference
    } else if (selectOptions.indexOf('|') != -1) {
      // `0;LABOR;劳动力`：value=数值, code=英文成员（实体存这个）, label=显示文本
      const refOptions = selectOptions.split('|').map(raw => {
        const parts = String(raw ?? '').split(';')
        if (parts.length >= 3) {
          const value = Number(parts[0])
          return {
            value: Number.isNaN(value) ? parts[0] : value,
            code: parts[1],
            label: parts.slice(2).join(';'),
          }
        }
        if (parts.length === 2) {
          return { value: parts[0], code: parts[0], label: parts[1] }
        }
        return { value: raw, code: raw, label: raw }
      })
      return new MetaUiFieldRef({
        refType: MetaRelationType.ENUM,
        refObjName: 't',
        refFlds: ['code', 'label'],
        refOptions: refOptions,
        refOptionsShape: MetaOptionsShape.FLAT,
      })
    } else {
      const matches = selectOptions.match(_refExp) //or const matches = _refExp.exec(selectOptions);
      if (matches == null) return null

      let [
        _,
        refType,
        refObjName,
        refColList,
        alias,
        where,
        groupBy,
        readOnly,
      ] = matches
      const refFlds = refColList.split(',')

      if (refType == null || refObjName == null || refColList == null) {
        console.error(selectOptions + ' is invalid.')
        return null
      }

      let refDbName: string | null = null
      if (refObjName.indexOf('.') != -1) {
        let refDbObj = refObjName.split('.')
        refDbName = refDbObj[0]
        refObjName = refDbObj[1]
      }
      // if(!alias) alias = refObjName.firstLetterLower();
      if (!alias) alias = refObjName[0].toLowerCase() + refObjName.slice(1)
      let shape = MetaOptionsShape.FLAT
      if (groupBy) shape = MetaOptionsShape.GROUPED
      else if (
        refFlds.length > 2 &&
        (refFlds[2].startsWith('parent') || refFlds[2].startsWith('super'))
      )
        shape = MetaOptionsShape.TREE

      return new MetaUiFieldRef({
        refType: refType as MetaRelationType,
        refObjName: refObjName,
        refRepository: pluralize(refObjName),
        refOptions: [],
        refFlds: refFlds,
        alias: alias,
        groupBy: groupBy,
        where: where,
        readOnly: readOnly === 'READONLY',
        refDbName: refDbName ?? undefined,
        refOptionsShape: shape,
      })
    }
  }

  readonly refType!: MetaRelationType
  readonly refObjName!: string
  readonly refRepository?: string
  readonly refFlds!: string[]
  readonly alias?: string
  readonly groupBy?: string
  readonly where?: string
  readonly readOnly!: boolean
  readonly refDbName?: string

  readonly refOptions!: MetaUiRefOption[]
  readonly refOptionsShape!: MetaOptionsShape
  /** 运行时：首页 50 已穷尽，列筛可本地过滤。 */
  refOptionsComplete?: boolean

  /** enum 恒穷尽；ref / hasOne 看 {@link refOptionsComplete}。 */
  get isRefOptionsFull() {
    if (this.isEnum) return true
    return this.refOptionsComplete === true
  }

  #enumFn?: propFn
  #valueFn?: propFn
  #labelFn?: propFn
  #groupByFn?: propFn

  get isEnum() {
    return this.refType == MetaRelationType.ENUM
  }
  get isRef() {
    return this.refType == MetaRelationType.REF
  }
  get hasOne() {
    return this.refType == MetaRelationType.HAS_ONE
  }
  get hasMany() {
    return this.refType == MetaRelationType.HAS_MANY
  }
  get hasExtraRefFields() {
    return (
      this.refFlds.length > 2 && this.refOptionsShape != MetaOptionsShape.TREE
    )
  }


  /**
   * 检索从“refOptions”中查找枚举项的函数
   *基于提供的值。如果 `refOptions` 不为空，则该函数
   *使用“refFlds[0]”作为键检查“refOptions”中是否存在该值
   *并返回匹配的枚举项，如果没有找到则返回原始值。
   *如果 `refOptions` 为空，则返回一个仅返回输入值的函数。
   */
  get enumFn() {
    if (!this.#enumFn) {
      this.#enumFn =
        this.refOptions.length > 0
          ? (value: unknown) => {
            if (value) {
              // const value = this.valueFn(valueObject)
              const enumItem = this.refOptions.find(it => value === it[this.refFlds[0]])
              return enumItem || value
            } else {
              return null
            }
          }
          : (value: unknown) => value
    }
    return this.#enumFn
  }
  /**
   * 取值函数，返回关联对象的第一个字段值，通常是id
   */
  get valueFn() {
    if (!this.#valueFn) {
      this.#valueFn =
        this.refFlds.length > 0
          ? (valueObject: unknown) =>
            isNullOrUndefined(valueObject) ? null :
              !isNullObject(valueObject) ? // 空对象等于是空
                (valueObject as MetaUiRefOption)[this.refFlds[0]] : null
          : (valueObject: unknown) => valueObject
    }
    return this.#valueFn
  }
  /**
   * 取标签函数，标签是用于显示的文本，返回关联对象的第二个及其之后的字段值文本拼接
   */
  get labelFn() {
    if (!this.#labelFn) {
      if (
        this.refFlds.length > 2 &&
        this.refOptionsShape != MetaOptionsShape.TREE
      ) {
        // HAS_ONE 常带 parentXxx：拼 label 时跳过空值，避免出现字面量 "undefined"
        this.#labelFn = (valueObject: unknown) => {
          const option = valueObject as MetaUiRefOption | null | undefined
          if (!option) return ''
          return this.refFlds
            .filter((_, i) => i > 0)
            .map((f) => option[f])
            .filter((v) => v != null && v !== '')
            .join(' ')
        }
      } else if (this.refFlds.length > 1) {
        this.#labelFn = (valueObject: unknown) =>
          valueObject ? (valueObject as MetaUiRefOption)[this.refFlds[1]] : ''
      } else {
        this.#labelFn = (valueObject: unknown) => this.valueFn(valueObject)
      }
    }
    return this.#labelFn
  }
  set labelFn(fn: propFn) {
    this.#labelFn = fn
  }
  get groupByFn() {
    if (!this.#groupByFn) {
      const groupBy = this.groupBy
      this.#groupByFn = groupBy
        ? (valueObject: unknown) => (valueObject as MetaUiRefOption)[groupBy] ?? '.'
        : this.refFlds.length > 2
          ? (valueObject: unknown) => (valueObject as MetaUiRefOption)[this.refFlds[2]] ?? '.'
          : (valueObject: unknown) => ''
    }
    return this.#groupByFn
  }

  get service(): string | undefined {
    if (this.refDbName) {
      const names = this.refDbName.split('_')
      let service = names.length > 1 ? names[1] : names[0]
      return service.toLowerCase()
    }
    return undefined
  }

  valueOf(valueObject: unknown) {
    return this.valueFn(valueObject)
  }
  labelOf(valueObject: unknown) {
    return this.labelFn(valueObject)
  }
  itemOf(valueObject: unknown) {
    const option = (valueObject ?? {}) as MetaUiRefOption
    const item: MetaUiRefOption = {}
    if (this.refFlds.length > 2) {
      for (let i = 0; i < this.refFlds.length; i++) {
        const refFld = this.refFlds[i]
        item[refFld] = option[refFld]
      }
    } else {
      item[this.refFlds[0]] = this.valueFn(valueObject)
      item[this.refFlds[1]] = this.labelFn(valueObject)
    }
    return item
  }
  defaultValueObject(val: unknown) {
    if (this.isEnum) {
      let vo = this.refOptions.find(it => this.valueFn(it) === val)
      if (!vo) vo = this.refOptions[0]
      return vo
    }
    // 原逻辑是在找不到数据的情况下返回一个空对象
    return {}
    // 因为原逻辑导致无数据反显有问题，所以改成找不到数据返回null
    // return null
  }
  /**
   * 在 refOptions 中查找与给定 valueObject 匹配的值对象。
   * 如果没有找到这样的值对象，则根据 valueObject 创建一个新的值对象。
   * @param valueObject 要查找或添加的值对象
   * @return 找到的或增值的对象
   */
  findOrAddValueObject(valueObject: unknown) {
    const val = this.valueOf(valueObject)
    let item = this.refOptions.find(it => this.valueFn(it) === val)
    if (!item) item = this.itemOf(valueObject)
    return item
  }
}

export class MetaUiFieldPair extends MetaUiField {
  constructor(init: MetaUiFieldInit, public readonly first: MetaUiField) {
    super(init)
  }
  get second() {
    return this
  }
}
