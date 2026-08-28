import { SqlDataType } from './datatype'
import { sqlAnd } from './metaui_search'
import { pluralize } from '../utils/pluralize'
import { isFunction, isNullObject, isNullOrUndefined } from '../utils/is'
import type { UiContext } from '../logic/ui_context'

export type Predicate<T = any> = (t: T, context?: any) => boolean

type UiReferenceSearchContext = UiContext<any> & {
  searchFields?: any[]
  _fieldOptions?: Record<string, any>
}

export interface Translatable {
  message: string
  param?: any
  plural?: number
}

export type TranslateFn = (message: string | Translatable) => string

export type RefFilterFn<T = any> = (
  model: T,
  ctx: UiContext<any>,
  fieldOptions?: Record<string, any>,
) => string
export type OnChangeFn<E = any, T = any> = (
  context: UiContext<E & object>,
  model: E,
  newVal: T,
  oldVal: T
) => void
export type onSearchChangeFn<T = any> = (
  context: UiContext,
  fld: MetaUiField,
  newVal: T,
  oldVal: T
) => void
export type setSelectableFn = (
  context: UiContext,
  field: MetaUiField,
  row: any
) => boolean
export type setSearchParamFn<T = any> = (
  context: UiContext<T & object>,
  model: T,
  field: MetaUiField
) => Record<string, any>
export type setAggregationFn<T = any> = (
  context: UiContext,
  field: MetaUiField,
  model: T,
) => Record<string, any>
export type OnValidateFn<T = any, E = any> = (
  value: T,
  model: E,
  ctx?: UiContext<any>
) => string | Translatable | undefined
export type OnWarnFn<T = any, E = any> = (
  value: T,
  model: E,
  ctx?: UiContext<any>
) => string
export enum MetaUiFieldAlignment {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  CENTER = 'CENTER',
  JUSTIFY = 'JUSTIFY',
  START = 'START',
  END = 'END',
}
export const MetaUiFieldAlignmentEnum = {
  LEFT_VALUE: 'left',
  RIGHT_VALUE: 'right',
  CENTER_VALUE: 'center',
  JUSTIFY_VALUE: 'justify',
  START_VALUE: 'start',
  END_VALUE: 'end',

  valueOf(enumCode: MetaUiFieldAlignment): string {
    return this[`${enumCode}_VALUE`]
  },
} as const

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

// type BoolFunc = (entity: any, editing: boolean) => boolean;
// type ReadOnlyFunc = (entity: any) => boolean;

export interface ValidationRulesParsed {
  key: string;
  value: any;
}

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
  mergeLabel?: string
  mergePrefix?: string
  listSize?: number // 列显示宽度，字符数，通常用于计算列宽，基数是200
  align?: MetaUiFieldAlignment // 对齐方式
  sortable?: boolean // 可排序，通常是有索引的字段支持排序
  aggregationSet?: MetaAggregation // 聚合函数

  // 渲染
  hidden?: boolean // 隐藏
  readOnly?: boolean // 只读，只显示不能编辑
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

  min?: string //数值范围
  max?: string

  unsigned?: boolean //是否无符号，用于整型
  numericPrecision?: number //数值精度
  numericScale?: number //小数位数
  validationRules?: string // 校验规则
  validationRulesParseds?: ValidationRulesParsed[] // 解析后的校验规则

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

/**
 * 过滤器参数
 * @remarks
 */
export interface FilterProps {
  searchWord?: string
  andCondition?: string
  ctx: UiReferenceSearchContext
  /** 来自 FieldLogic 的会话过滤器；不传则回退 reference.filterFn */
  filterFn?: RefFilterFn
}

const _imgReg = /^([\d|\?]+)?[_|\*]?([\d|\?]+)(\.\w+)?$/
const parseImageFormat = (format: string): MetaUiImageFormat | null => {
  const matches = format.match(_imgReg)
  if (matches == null) return null
  let [w, h, fileExt] = matches
  return {
    width: Number.isNaN(w) ? null : Number(w),
    height: Number.isNaN(h) ? null : Number(h),
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

/** 弹窗 Footer 操作按钮 */
export interface FooterAction {
  /** 按钮文案 */
  label: string
  /** 按钮图标（PrimeIcons class），可选 */
  icon?: string
  /** 按钮语义样式 */
  severity?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger'
  /** 点击回调 */
  onClick: () => void
}

/**
 * 元界面域
 *
 * @remarks
 *
 * 指用户界面的一个基本元素的定义，比如一个输入框，表格列或者显示文本的元数据。
 * 定义了其展现方式、编辑和互动行为。
 */
export class MetaUiField {
  constructor(init: MetaUiFieldInit) {
    Object.assign(this, init);
    if (this.selectOptions) {
      this.reference = MetaUiFieldRef.parse(this.selectOptions);
    }
  }

  fieldIdx: number
  readonly fieldName: string
  readonly displayLabel: string
  readonly dataType: SqlDataType
  readonly nullable: boolean

  readonly emphasized?: boolean
  readonly listed?: boolean
  readonly mergeLabel?: string
  readonly mergePrefix?: string
  readonly listSize?: number
  readonly align?: MetaUiFieldAlignment
  readonly sortable?: boolean
  readonly aggregationSet?: MetaAggregation

  readonly hidden?: boolean
  readonly readOnly?: boolean
  linkable?: boolean //是否超链接
  readonly renderer?: string
  readonly formatter?: string
  readonly prefix?: string
  readonly suffix?: string
  readonly nullDisplayText?: string

  readonly editor?: string
  readonly selectOptions?: string
  readonly validationRules?: string
  validationRulesParseds?: ValidationRulesParsed[]
  readonly placeholder?: string
  readonly tooltip?: string

  readonly dataBinding?: string

  readonly primaryKey?: boolean
  readonly maxLength?: number
  min?: string
  max?: string
  readonly unsigned?: boolean
  readonly numericPrecision?: number
  readonly numericScale?: number
  readonly defaultVal?: string

  readonly formula?: string

  /**
   * 参考选项，包含四种类型的{@link MetaRelationType}，
   * 用于定义选择数据源
   */
  reference?: MetaUiFieldRef

  /**
   * 图片格式
   */
  imageFormat?: MetaUiImageFormat



  static parseValidationRules(validationRules: string): ValidationRulesParsed[] {
    //  输入Max(100) 输出 { name: 'max', value: '100' } 输入Range(0,100) 输出 { name: 'range', value: '0,100' }
    // const pattern = /^(\w+)\((\d+)\)$/;
    const pattern = /^([A-Za-z]+)(?:\(([^)]*)\))?$/i;
    return (validationRules ?? '').split(';').map(rule => {
      const match = pattern.exec(rule);
      if (!match) return null;
      return {
        key: match[1].toLocaleLowerCase(),
        value: match[2] ? match[2] : ''
      };
    }).filter((v): v is ValidationRulesParsed => !!v);
  }


  // /**
  //  * 给实体赋值
  //  * @param entity 实体
  //  * @param value 值
  //  */
  // assign(entity: Entity, value: any){
  //   if(this.reference){
  //     this.reference.assign(entity,this.fieldName,value);
  //   }
  //   else{
  //     entity[this.fieldName] = value;
  //   }
  // }
}

/**
 * 关系类型：HAS_ONE,HAS_MANY,REF
 */
export const enum MetaRelationType {
  HAS_ONE = 'HAS_ONE', // 一对一
  HAS_MANY = 'HAS_MANY', // 一对多
  REF = 'REF', // 引用
  ENUM = 'ENUM', // 枚举
}
/**
 * 选择源数据形状
 */
export const enum MetaOptionsShape {
  FLAT,
  GROUPED,
  TREE,
}

// test at https://www.mklab.cn/utils/regex
const _refExp =
  /^(\w+)\s(\w+(?:\.\w+)?)\(([\w|,]+)\)(?:\s+AS\s+(\w+))?(?:\s+WHERE\s*\((.+)\))?(?:\s+GROUP\s+BY\s+(\w+))?(?:\s+(READONLY))?$/
const _paramExp = /\@(\w+)/gi
type propFn = (item: any) => any
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
  refOptions?: any[]
  refOptionsShape: MetaOptionsShape
}
export class MetaUiFieldRef {
  private constructor(init: MetaUiFieldRefInit) {
    Object.assign(this, init)
  }

  static parse(selectOptions: string, bitable: boolean = false) {
    if (selectOptions.startsWith('[')) {
      const refOptions = JSON.parse(selectOptions)

      return new MetaUiFieldRef({
        refType: MetaRelationType.ENUM,
        refObjName: 'vt',
        refFlds: ['value', 'text'],
        refOptions: refOptions,
        refOptionsShape: MetaOptionsShape.FLAT,
      })
    } else if (selectOptions.indexOf('|') != -1) {
      const refOptions = selectOptions.split('|')
      return new MetaUiFieldRef({
        refType: MetaRelationType.ENUM,
        refObjName: 't',
        refFlds: [],
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

      let refDbName: string = null
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
        refDbName: refDbName,
        refOptionsShape: shape,
      })
    }
  }

  readonly refType: MetaRelationType
  readonly refObjName: string
  readonly refRepository?: string
  readonly refFlds: string[]
  readonly alias?: string
  readonly groupBy?: string
  readonly where?: string
  readonly readOnly: boolean
  readonly refDbName?: string

  readonly refOptions: any[]
  readonly refOptionsShape: MetaOptionsShape

  private _enumFn?: propFn
  private _valueFn?: propFn
  private _labelFn?: propFn
  private _groupByFn?: propFn

  private _filterFn?: RefFilterFn
  // private _searchFn?: (searchParam:EntitySearchParam)=>Promise<PagedList<any>>;

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
    if (!this._enumFn) {
      this._enumFn =
        this.refOptions.length > 0
          ? (value: any) => {
            if (value) {
              // const value = this.valueFn(valueObject)
              const enumItem = this.refOptions.find(it => value === it[this.refFlds[0]])
              return enumItem || value
            } else {
              return null
            }
          }
          : (value: any) => value
    }
    return this._enumFn
  }
  /**
   * 取值函数，返回关联对象的第一个字段值，通常是id
   */
  get valueFn() {
    if (!this._valueFn) {
      this._valueFn =
        this.refFlds.length > 0
          ? (valueObject: any) =>
            isNullOrUndefined(valueObject) ? null :
              !isNullObject(valueObject) ? // 空对象等于是空
                valueObject[this.refFlds[0]] : null
          : (valueObject: any) => valueObject
    }
    return this._valueFn
  }
  /**
   * 取标签函数，标签是用于显示的文本，返回关联对象的第二个及其之后的字段值文本拼接
   */
  get labelFn() {
    if (!this._labelFn) {
      if (
        this.refFlds.length > 2 &&
        this.refOptionsShape != MetaOptionsShape.TREE
      ) {
        this._labelFn = (valueObject: any) =>
          valueObject
            // ? `${valueObject[this.refFlds[1]]} ${valueObject[this.refFlds[2]] ?? '' // old logic
            ? this.refFlds.filter((f, i) => i > 0).map(it => valueObject[it]).join(' ')
            : ''
      } else if (this.refFlds.length > 1) {
        this._labelFn = (valueObject: any) =>
          valueObject ? valueObject[this.refFlds[1]] : ''
      } else {
        this._labelFn = (valueObject: any) => this.valueFn(valueObject)
      }
    }
    return this._labelFn
  }
  set labelFn(fn: propFn) {
    this._labelFn = fn
  }
  get groupByFn() {
    if (!this._groupByFn) {
      this._groupByFn = this.groupBy
        ? (valueObject: any) => valueObject[this.groupBy] ?? '.'
        : this.refFlds.length > 2
          ? (valueObject: any) => valueObject[this.refFlds[2]] ?? '.'
          : (valueObject: any) => ''
    }
    return this._groupByFn
  }

  get filterFn() {
    return this._filterFn
  }
  set filterFn(fn: RefFilterFn) {
    this._filterFn = fn
  }

  // get searchFn(){
  //   return this._searchFn;
  // }
  // set searchFn(fn: (searchParam:EntitySearchParam)=>Promise<PagedList<any>>){
  //   this._searchFn = fn;
  // }
  buildSearchFilter(model: any, filterProps: FilterProps) {
    const { searchWord, andCondition, ctx, filterFn } = filterProps
    const { searchFields } = ctx
    const runtimeFilter = filterFn ?? this._filterFn

    let filter = isFunction(runtimeFilter)
      ? sqlAnd(this.where, runtimeFilter(model, ctx, ctx._fieldOptions))
      : this.where
    if (andCondition) filter = sqlAnd(filter, andCondition)
    if (filter && filter.indexOf('@') != -1) {
      filter = filter.replaceAll(
        _paramExp,
        (p: string) => model[p.substring(1)]
      )
    }
    if (searchWord) {
      let conditions: string[] = []
      conditions.push(`t.${this.refFlds[1]} LIKE %${searchWord}%`)
      if (this.hasExtraRefFields)
        conditions.push(`t.${this.refFlds[2]} LIKE %${searchWord}%`)
      filter = sqlAnd(filter, conditions.join(' OR '))
    }
    return filter
  }

  buildSearchQueryParams(model: any, filterProps: FilterProps) {
    const { searchWord, andCondition, ctx, filterFn } = filterProps
    const { searchFields } = ctx
    const runtimeFilter = filterFn ?? this._filterFn

    let filter = isFunction(runtimeFilter)
      ? sqlAnd(this.where, runtimeFilter(model, ctx, ctx._fieldOptions))
      : this.where
    if (andCondition) filter = sqlAnd(filter, andCondition)
    if (filter && filter.indexOf('@') != -1) {
      filter = filter.replaceAll(
        _paramExp,
        (p: string) => model[p.substring(1)]
      )
    }
    if (searchWord) {
      let conditions: string[] = []
      conditions.push(`t.${this.refFlds[1]} LIKE %${searchWord}%`)
      if (this.hasExtraRefFields)
        conditions.push(`t.${this.refFlds[2]} LIKE %${searchWord}%`)
      filter = sqlAnd(filter, conditions.join(' OR '))
    }
    return filter
  }

  get service(): string | undefined {
    if (this.refDbName) {
      const names = this.refDbName.split('_')
      let service = names.length > 1 ? names[1] : names[0]
      return service.toLowerCase()
    }
    return undefined
  }

  valueOf(valueObject: any) {
    return this.valueFn(valueObject)
  }
  labelOf(valueObject: any) {
    return this.labelFn(valueObject)
  }
  itemOf(valueObject: any) {
    const item: Record<string, any> = {}
    if (this.refFlds.length > 2) {
      for (let i = 0; i < this.refFlds.length; i++) {
        const refFld = this.refFlds[i]
        item[refFld] = valueObject[refFld]
      }
    } else {
      item[this.refFlds[0]] = this.valueFn(valueObject)
      item[this.refFlds[1]] = this.labelFn(valueObject)
    }
    return item
  }
  defaultValueObject(val: any) {
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
  findOrAddValueObject(valueObject: any) {
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

export interface SearchForRelativeOptions {
  searchWord?: string | any
  isComposing?: boolean
}
export const defaultSearchForRelativeOptions = (): SearchForRelativeOptions => {
  return {
    searchWord: null,
    isComposing: false
  }
}
