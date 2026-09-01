import {
  compareListColumns,
  MetaUiField,
  MetaUiFieldRef,
} from './metaui_field'

type PropsMapper = Record<string, string | ((it: any) => any)>

export type CreateGroupItemsFn = (
  context: any,
  entity: any,
  items: any[]
) => Promise<boolean>
export type OnChangeGroupFn<E = any, G = any> = (
  context: any,
  model: E,
  items: G[]
) => any
export type GroupFilterFn<E = any, G = any> = (
  context: any,
  model: E,
  items: G[]
) => any
export type AddGroupItemsFn<E = any> = (context: any, model: E) => any
export interface ImportGroupItemsProps<E> {
  propsMapper?: PropsMapper
  importFn?: (context: any, file: File[]) => Promise<void> // 导入处理方法
  exportFn?: (context: any, model: E) => Promise<void> // 导出处理方法
}
export type ImportGroupItemsFn<E = any> = (context: any, model: E) => ImportGroupItemsProps<E>

/**
 * 详情和编辑界面的三个区域
 */
export const enum MetaUiGroupType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TAILS = 'tails',
}
export const enum MetaUiSubGroupShape {
  // LIST, //列表，默认
  // TREE, //父子结构 有parentID字段
  // HIERARCHY, //层次结构，1，1.1，1.2
  // PHOTO, // 图片
  LIST = 'LIST', //列表，默认
  TREE = 'TREE', //父子结构 有parentID字段
  HIERARCHY = 'HIERARCHY', //层次结构，1，1.1，1.2
  PHOTO = 'PHOTO', // 图片
  BPMN = 'BPMN', // 流程图
}
export interface MetaUiMasterGroup {
  groupName: string // 组名称，如a1,items
  groupLabel: string // 分组标签，如：订单信息
  fields: MetaUiField[] // 主表组的元域集合
  groupIdx?: number // 组顺序位置，primary(0~19), summary(20,29), details(30~)
  secondary?: boolean //次要组，放概要组下面
  // new(groupName: string, groupLabel: string, fields: MetaUiField[]): MetaUiMasterGroup;
}
export interface MetaUiSubGroup {
  groupName: string // 组名称，如a1,items
  groupLabel: string // 分组标签，如：订单信息
  relObjName: string // 对象名称，参见`MetaObject.objName`
  joinOn: string // 连接条件，形如whID=@whID
  groupUi: MetaUi // 子表组的元界面
  requiredAny?: boolean // 要求子表必须有至少一个元素
  readOnly?: boolean // 只读否
  canHave?: string // 是否有此子表的控制属性
  sequenceKey?: string // 序列键，如itemID
  displayShape?: MetaUiSubGroupShape //显示形状
  shapeKey?: string //形状键
  secondary?: boolean //次要组，放概要组下面
  aggregates?: string //聚合设置，例如SUM(fld1),COUNT(fld2)
  // new(groupName: string, groupLabel: string, relObjName: string, joinOn: string, groupUi: MetaUi, requiredOnly?: boolean,readOnly?: boolean): MetaUiSubGroup;
}
export interface MetaUiGroupInit {
  groupName: string // 组名称，如a1,items
  groupLabel: string // 分组标签，如：订单信息
  many: boolean // 是否一对多，子表否
  groupIdx?: number // 组顺序位置，primary(0~19), summary(20,29), details(30~)
  fields?: MetaUiField[] // 主表组的元域集合
  relObjName?: string // 对象名称，参见`MetaObject.objName`
  joinOn?: string // 连接条件，形如whID=@whID
  requiredAny?: boolean // 要求子表必须有至少一个元素
  readOnly?: boolean // 只读否
  groupUi?: MetaUi // 子表组的元界面
  canHave?: string // 是否有此子表的控制属性
  sequenceKey?: string // 序列键，如itemID
  displayShape?: MetaUiSubGroupShape //显示形状
  shapeKey?: string //形状键
  secondary?: boolean //次要组，放概要组下面
  aggregates?: string //聚合设置，例如SUM(fld1),COUNT(fld2)
}
const _joinExp = /(\w+)=\@(\w+)/gm

export class MetaUiGroup {
  /**
   * 构造一个元界面组
   * @param param0 构造
   */
  constructor({
    groupName,
    groupLabel,
    many,
    groupIdx,
    fields,
    relObjName,
    joinOn,
    requiredAny,
    readOnly,
    groupUi,
    canHave,
    sequenceKey,
    displayShape, shapeKey,
    secondary, aggregates
  }: MetaUiGroupInit) {
    this.groupName = groupName
    this.groupLabel = groupLabel
    this.many = many
    this.groupIdx = groupIdx
    this.fields = fields
    this.relObjName = relObjName
    this.joinOn = joinOn
    this.requiredAny = requiredAny
    this.readOnly = readOnly
    this.canHave = canHave
    this.sequenceKey = sequenceKey
    this.displayShape = displayShape
    this.shapeKey = shapeKey
    this.secondary = secondary
    this.aggregates = aggregates
    this.expanded = true
    if (many) {
      if (groupUi) this.groupUi = new MetaUi(groupUi)
      const matches = [...joinOn.matchAll(_joinExp)]
      this.joinFields = {}
      matches.forEach(m => (this.joinFields[m[1]] = m[2]))
      // 老逻辑 子表元数据有需要聚合的字段才开启聚合
      // this.aggregate = this.groupUi.getListedFields().some(f=>f.aggregationSet>0);
      // 新逻辑 默认开启聚合，合计数据总数
      this.aggregate = true
    } else if (fields && fields.length > 0) {
      // 主表组，解析字段上的校验规则
      fields.forEach(fld => fld.validationRulesParseds = MetaUiField.parseValidationRules(fld.validationRules))

      // 如果是主表组，且字段上有selectOptions，则解析出引用关系
      fields
        .filter(fld => !!fld.selectOptions)
        .forEach(
          fld => (fld.reference = MetaUiFieldRef.parse(fld.selectOptions))
        )
      this.aggregate = false
    }
  }
  /**
   * 构造主表元界面组，包含主表中一组元界面域{@link MetaUiField}
   * @remarks 使用工厂构造方法
   * @param g 主表组
   * @returns 元界面组
   */
  static master = (g: MetaUiMasterGroup) =>
    new MetaUiGroup({ many: false, ...g })
  /**
   * 构造子表元界面组
   * @param g 子表组
   * @returns 元界面组
   */
  static sub = (g: MetaUiSubGroup) => new MetaUiGroup({ many: true, ...g })

  readonly groupName: string // 组名称，如a1,items
  readonly groupLabel: string // 分组标签，如：订单信息
  readonly many: boolean // 是否一对多，子表否
  readonly groupIdx?: number // 组顺序位置，primary(0~19), summary(20,29), details(30~)
  readonly fields: MetaUiField[] // 主表组的元域集合
  readonly relObjName?: string // 对象名称，参见`MetaObject.objName`
  readonly joinOn?: string // 连接条件，形如whID=@whID
  readonly joinFields?: Record<string, string>
  readonly requiredAny?: boolean // 要求子表必须有至少一个元素
  readonly readOnly?: boolean // 只读否
  readonly canHave?: string // 是否有此子表的控制属性
  readonly sequenceKey?: string // 序列键，如itemID

  //2024.12.23 增加
  readonly displayShape?: MetaUiSubGroupShape //显示形状
  readonly shapeKey?: string //形状键
  readonly secondary?: boolean //次要组，放概要组下面
  readonly aggregates?: string //聚合设置，例如SUM(fld1),COUNT(fld2)

  groupUi?: MetaUi // 子表组的元界面
  assembled?: boolean
  expanded?: boolean // 默认展开
  aggregate?: boolean // 是否聚合（子表=true，主表=false，构造时设置）

  //左边主要区域
  isPrimary() {
    return !(this.isSecondary() || this.isTails())
  }

  //右边辅助区
  isSecondary() {
    return this.groupName[0] == 's' && this.groupName.length == 2
  }

  //末尾区域
  isTails() {
    return this.groupName[0] == 't' && this.groupName.length == 2
  }

  private _listedFields: MetaUiField[] = []
  getListedFields(reset = false) {
    if (this._listedFields.length == 0 || reset) {
      this._listedFields = this.many
        ? this.groupUi!.getListedFields(reset)
        : this.fields!.filter(field => field.listed && !field.hidden)
            .sort(compareListColumns)
    }
    return this._listedFields
  }

  getListLayoutFields() {
    return (this.fields ?? [])
      .filter(field => !field.hidden)
      .sort(compareListColumns)
  }
}

/**
 * 元界面数据组装状态
 *
 * @remarks
 *
 * 一个{@link MetaUi|元界面}使用一个`key-value`在本地缓存，缓存时为了避免重复会将关联数据拆分，
 * 异步加载时需同时获取关联数据并进行组装，框架需要知道组装状态。
 */
export const enum MetaUiAssemblyStatus {
  /**
   * 加载中
   */
  LOADING,

  /**
   * 加载了本身
   */
  ASSEMBLED_ONE,

  /**
   * 加载了关联元数据
   */
  ASSEMBLED_ALL,
}

export interface MetaUiInit {
  // String dbName;
  objName: string
  displayLabel: string
  uniqueKey?: string
  primaryKey?: string
  labelKey?: string
  /** 后端旧名称：列表中作为详情链接的字段。 */
  nameCol?: string
  locale?: string
  lastModified?: Date
  groups: any[]
  assembled?: boolean
}
/**
 * 元界面是一个用户界面的元数据，用于自动化构建一个前端用户界面。
 *
 * @remarks
 *
 * `MetaUi`包含多个{@link MetaUiGroup|元界面组}，而组中包含多个{@link MetaUiField|元界面域}。
 * 通过{@link MetaUi#locale|区域语言属性}支持国际化。
 * 元界面数据通常从服务器端首次获取，在本地缓存，框架利用它动态创建一个屏幕，供用户操作和互动。
 */
export class MetaUi {
  constructor({
    objName,
    displayLabel,
    uniqueKey,
    primaryKey,
    labelKey,
    nameCol,
    locale,
    lastModified,
    groups,
    assembled,
  }: MetaUiInit) {
    this.objName = objName
    this.displayLabel = displayLabel
    this.uniqueKey = uniqueKey
    this.primaryKey = primaryKey
    this.labelKey = labelKey
    this.nameCol = nameCol
    this.locale = locale
    this.lastModified = lastModified
    this.groups = groups.map(g => new MetaUiGroup(g))
    this.assembleStatus = assembled
      ? MetaUiAssemblyStatus.ASSEMBLED_ALL
      : MetaUiAssemblyStatus.ASSEMBLED_ONE
    this._namedFields = {}
    this.groups.forEach(g => {
      if (g.many) return

      g.fields.forEach(fld => (this._namedFields[fld.fieldName] = fld))
    })
    if (this.labelField && this._namedFields[this.labelField])
      this._namedFields[this.labelField].linkable = true
  }
  // 数据库名称
  // String dbName;

  // 对象名称
  objName: string

  // 默认显示标签
  displayLabel: string

  // 租户内唯一索引字段，可生成findByXxx函数，查重等
  uniqueKey?: string

  // 主键字段，UI层需要
  primaryKey?: string

  // 链接标签字段，UI列表上渲染为超链接
  labelKey?: string

  // 后端兼容字段；新元数据优先使用 labelKey
  nameCol?: string

  // 语言区域，如en,zh-Hans,zh-Hant
  locale?: string

  // 租户标识，0表示默认租户，公用
  // int? tenantID;

  // 最后修改时间
  lastModified?: Date

  // 分组
  groups: MetaUiGroup[]

  // 组装状态
  assembleStatus?: MetaUiAssemblyStatus

  /**
   * 链接标签域，如果没设置`labelKey`则默认为`uniqueKey`
   */
  get labelField() {
    return this.labelKey ?? this.nameCol ?? this.uniqueKey
  }
  // 命名域查找
  private _namedFields: Record<string, MetaUiField>
  getField(name: string): MetaUiField | undefined {
    return this._namedFields[name]
  }

  // 列表显示域
  private _listedFields: MetaUiField[] = []
  getListedFields(reset = false) {
    if (this._listedFields.length == 0 || reset) {
      this._listedFields = this.groups
        .filter(g => !g.many)
        .reduce((prev, curr) => {
          return prev.concat(curr.getListedFields(reset))
        }, []).sort(compareListColumns)
    }
    return this._listedFields
  }

  getListLayoutFields() {
    return this.groups
      .filter(g => !g.many)
      .reduce((prev, curr) => prev.concat(curr.getListLayoutFields()), [] as MetaUiField[])
      .sort(compareListColumns)
  }
  /**
   * 获取元界面组
   * @param name 组名称
   * @returns
   */
  getGroup(name: string): MetaUiGroup | undefined {
    return this.groups.find(g => g.groupName == name)
  }
  /**
   * 获取子表组的元界面
   * @param name 组名称
   * @returns
   */
  getGroupUi(name: string): MetaUi | undefined {
    return this.getGroup(name)?.groupUi
  }
}
