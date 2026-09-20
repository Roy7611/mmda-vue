import {
  compareListColumns,
  MetaUiField,
} from './metaui_field'
import { pluralize } from '../utils/pluralize'

/**
 * 详情和编辑界面的三个区域
 */
export const enum MetaUiGroupType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TAILS = 'tails',
}

export const enum MetaUiSubGroupShape {
  LIST = 'LIST', //扁平列表，默认
  TREE = 'TREE', //父子，shapeKey = 父字段名
  HIERARCHY = 'HIERARCHY', //点分编码，shapeKey = 编码字段名
  CALENDAR = 'CALENDAR', //日历事件，用 Scheduler
  IMAGE_GALLERY = 'IMAGE_GALLERY', //图片画廊
}
/**
 * 主表/子表共用声明。完整构造袋还要 `many`，走 {@link MetaUiGroup} 或 `master` / `sub`。
 */
export interface MetaUiGroupInit {
  groupName: string // 组名称，如a1,items
  groupLabel: string // 分组标签，如：订单信息
  groupIdx?: number // 组顺序位置，primary(0~19), summary(20,29), details(30~)
  secondary?: boolean //次要组，放概要组下面
}

/** 主表组：一组 {@link MetaUiField}。 */
export interface MetaUiMasterGroup extends MetaUiGroupInit {
  fields: MetaUiField[]
}

/** 子表组：一对多关联。 */
export interface MetaUiSubGroup extends MetaUiGroupInit {
  relObjName: string // 对象名称，参见`MetaObject.objName`
  joinOn: string // 连接条件，形如whID=@whID
  groupUi: MetaUi // 子表组的元界面
  requiredAny?: boolean // 要求子表必须有至少一个元素
  allowJoinList?: boolean // 允许作为联查列表的默认子表
  readOnly?: boolean // 只读否
  canHave?: string // 是否有此子表的控制属性
  sequenceKey?: string // 序列键，如itemID
  displayShape?: MetaUiSubGroupShape //显示形状
  shapeKey?: string //形状键
  aggregates?: string //聚合设置，例如SUM(fld1),COUNT(fld2)
}

/**
 * 组运行时形状在 {@link MetaUiGroupInit}；这里只补判别、主表字段和构造后成员。
 * 子表专有字段复用 {@link MetaUiSubGroup}。
 */
export interface MetaUiGroup extends MetaUiGroupInit,
  Partial<Omit<MetaUiSubGroup, keyof MetaUiGroupInit>> {
  many: boolean
  fields?: MetaUiField[]
  joinFields?: Record<string, string>
  assembled?: boolean
  expanded?: boolean
  aggregate?: boolean
}

const _joinExp = /(\w+)=\@(\w+)/gm

export class MetaUiGroup {
  constructor(
    init: MetaUiGroupInit & { many: boolean } & Partial<MetaUiMasterGroup> & Partial<MetaUiSubGroup>,
  ) {
    Object.assign(this, init)
    this.expanded = true
    if (this.fields?.length) {
      this.fields = this.fields.map((fld) =>
        fld instanceof MetaUiField ? fld : new MetaUiField(fld),
      )
    }
    if (this.many) {
      if (this.groupUi) this.groupUi = new MetaUi(this.groupUi)
      const joinFields: Record<string, string> = {}
      for (const m of (this.joinOn ?? '').matchAll(_joinExp)) {
        joinFields[m[1]] = m[2]
      }
      this.joinFields = joinFields
      this.aggregate = true
    } else {
      this.aggregate = false
    }
  }

  /** 主表组，含一组 {@link MetaUiField}。 */
  static master = (g: MetaUiMasterGroup) =>
    new MetaUiGroup({ many: false, ...g })

  /** 子表组。 */
  static sub = (g: MetaUiSubGroup) =>
    new MetaUiGroup({ many: true, ...g })

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

  #listedFields: MetaUiField[] = []
  getListedFields(reset = false) {
    if (this.#listedFields.length == 0 || reset) {
      this.#listedFields = this.many
        ? this.groupUi!.getListedFields(reset)
        : this.fields!.filter(field => field.listed && !field.hidden)
            .sort(compareListColumns)
    }
    return this.#listedFields
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

/**
 * 元界面声明袋，{@link MetaUi} 构造入参。
 *
 * `assembled` 只在这里，构造后折成 `assembleStatus`。
 * `groups` 可以是服务端 JSON 或已有 {@link MetaUiGroup}。
 */
export interface MetaUiInit {
  objName: string // 对象名称
  displayLabel: string // 默认显示标签
  uniqueKey?: string // 租户内唯一索引字段
  primaryKey?: string // 主键字段
  labelKey?: string // 链接标签字段，列表渲染为超链接
  locale?: string // 语言区域，如en,zh-Hans,zh-Hant
  lastModified?: Date
  groups: any[]
  assembled?: boolean // 已装齐全量关联；构造后不再保留
  /** 联查视图：数据打这个主表仓储的 getJoinList */
  sourceRepository?: string
  /** 联查视图：对着哪张子表拼的 */
  sourceRelation?: string
}

/**
 * 元界面是一个用户界面的元数据，用于自动化构建一个前端用户界面。
 *
 * @remarks
 *
 * `MetaUi`包含多个{@link MetaUiGroup|元界面组}，而组中包含多个{@link MetaUiField|元界面域}。
 * 通过{@link MetaUi#locale|区域语言属性}支持国际化。
 * 声明形状在 {@link MetaUiInit}；这里只补构造后的 `groups` 实例和 `assembleStatus`。
 */
export interface MetaUi extends Omit<MetaUiInit, 'assembled' | 'groups'> {
  groups: MetaUiGroup[]
  assembleStatus?: MetaUiAssemblyStatus
}

export class MetaUi {
  /** `MetaUiBuilder.create(name).fields(inits).build()` 短写。 */
  static list(objName: string, fields: MetaUiField[] = []) {
    return new MetaUi({
      objName,
      displayLabel: objName,
      groups: [
        {
          groupName: 'a1',
          groupLabel: objName,
          many: false,
          fields,
        },
      ],
      assembled: true,
    })
  }

  constructor(init: MetaUiInit) {
    Object.assign(this, init)
    delete (this as { assembled?: unknown }).assembled
    this.groups = (init.groups ?? []).map(g =>
      g instanceof MetaUiGroup ? g : new MetaUiGroup(g),
    )
    this.assembleStatus = init.assembled
      ? MetaUiAssemblyStatus.ASSEMBLED_ALL
      : MetaUiAssemblyStatus.ASSEMBLED_ONE
    this.groups.forEach(g => {
      if (g.many) return
      g.fields?.forEach(fld => (this.#namedFields[fld.fieldName] = fld))
    })
    if (this.labelField && this.#namedFields[this.labelField])
      this.#namedFields[this.labelField].linkable = true
  }

  /**
   * 链接标签域，如果没设置`labelKey`则默认为`uniqueKey`
   */
  get labelField() {
    return this.labelKey ?? this.uniqueKey
  }

  #namedFields: Record<string, MetaUiField> = {}
  getField(name: string): MetaUiField | undefined {
    return this.#namedFields[name]
  }

  #listedFields: MetaUiField[] = []
  getListedFields(reset = false) {
    if (this.#listedFields.length == 0 || reset) {
      this.#listedFields = this.groups
        .filter(g => !g.many)
        .reduce<MetaUiField[]>((prev, curr) => {
          return prev.concat(curr.getListedFields(reset))
        }, []).sort(compareListColumns)
    }
    return this.#listedFields
  }

  getListLayoutFields() {
    return this.groups
      .filter(g => !g.many)
      .reduce((prev, curr) => prev.concat(curr.getListLayoutFields()), [] as MetaUiField[])
      .sort(compareListColumns)
  }

  getGroup(name: string): MetaUiGroup | undefined {
    return this.groups.find(g => g.groupName == name)
  }

  getGroupUi(name: string): MetaUi | undefined {
    return this.getGroup(name)?.groupUi
  }

  /** 一对多组都带了 groupUi 才能 group().field() / 画子表。 */
  hasSubGroupUis() {
    return this.groups.every((group) => !group.many || !!group.groupUi)
  }

  /** 有可联查子表才出「联查模式」菜单。必须 requiredAny，否则 inner join 会滤掉无子行的主表。 */
  hasJoinList() {
    return this.groups.some(g => g.many && g.requiredAny && g.allowJoinList)
  }
}

function splitKeys(primaryKey?: string) {
  return (primaryKey ?? '')
    .split(',')
    .map(key => key.trim())
    .filter(Boolean)
}

function copyViewField(
  src: MetaUiField,
  patch: Partial<MetaUiField> = {},
): MetaUiField {
  return Object.assign(
    new MetaUiField({
      fieldName: patch.fieldName ?? src.fieldName,
      displayLabel: patch.displayLabel ?? src.displayLabel,
      fieldIdx: src.fieldIdx,
      dataType: src.dataType,
      nullable: src.nullable,
    }),
    src,
    patch,
  )
}

/** 第一个可联查子表组名（many && requiredAny && allowJoinList）。 */
export function joinListRelationName(metaUi: MetaUi): string | undefined {
  return metaUi.groups.find(
    group => group.many && group.requiredAny && group.allowJoinList,
  )?.groupName
}

/** 联查视图 objName：`MaterialTransItemView`。 */
export function joinViewObjName(group: {
  relObjName?: string
  groupUi?: { objName?: string }
}): string | undefined {
  const rel = group.relObjName ?? group.groupUi?.objName
  return rel ? `${rel}View` : undefined
}

/**
 * 用主表 metaUi + 子表 groupUi 本地拼联查列界面。
 * 字段新实例，`reference` 与源字段同一对象。
 */
export function assembleViewUi(metaUi: MetaUi, relationName: string): MetaUi {
  const relation = metaUi.getGroup(relationName)
  if (!relation?.many || !relation.groupUi) {
    throw new Error(
      `assembleViewUi: "${relationName}" is not a many group with groupUi`,
    )
  }
  const groupUi = relation.groupUi
  const hideNames = new Set([
    ...splitKeys(metaUi.primaryKey),
    ...Object.keys(relation.joinFields ?? {}),
  ])
  const masterGroups = metaUi.groups
    .filter(group => !group.many)
    .map(group =>
      MetaUiGroup.master({
        groupName: group.groupName,
        groupLabel: group.groupLabel,
        groupIdx: group.groupIdx,
        secondary: group.secondary,
        fields: (group.fields ?? []).map(field => copyViewField(field)),
      }),
    )
  const childFields: MetaUiField[] = []
  for (const inner of groupUi.groups.filter(group => !group.many)) {
    for (const field of inner.fields ?? []) {
      const hide = hideNames.has(field.fieldName)
      childFields.push(
        copyViewField(field, {
          fieldName: `${relationName}.${field.fieldName}`,
          hidden: hide ? true : field.hidden,
          readOnly: hide ? true : field.readOnly,
          subGroupLabel: inner.groupLabel,
        }),
      )
    }
  }
  const childPk = splitKeys(groupUi.primaryKey)
    .filter(key => !hideNames.has(key))
    .map(key => `${relationName}.${key}`)
  const primaryKey = [...splitKeys(metaUi.primaryKey), ...childPk].join(',')
  const viewObjName =
    joinViewObjName(relation) ?? `${relationName}View`
  return new MetaUi({
    objName: viewObjName,
    displayLabel: relation.groupLabel,
    uniqueKey: metaUi.uniqueKey,
    primaryKey: primaryKey || undefined,
    labelKey: metaUi.labelKey,
    locale: metaUi.locale,
    sourceRepository: pluralize(metaUi.objName),
    sourceRelation: relationName,
    groups: [
      ...masterGroups,
      MetaUiGroup.master({
        groupName: relationName,
        groupLabel: relation.groupLabel,
        groupIdx: relation.groupIdx,
        fields: childFields,
      }),
    ],
    assembled: true,
  })
}
