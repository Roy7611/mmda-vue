import { defaultDataTypeValue } from "../metaui/datatype";
import { MetaUiField } from "../metaui/metaui_field";
import { MetaUi, MetaUiGroup } from "../metaui/metaui_group";
import {
  isString,
  isNumber,
  isFunction,
  isEmpty,
  isArray,
  isNullOrUndefined,
  isObject,
} from "../utils/is";
import { EntityState, type ValueObject, Entity, type EntityCtor } from "./entity";
import {
  created,
  createdForModified,
  deleted,
  destroy,
  dirty,
  isEntity,
  modified,
  modify,
} from './entity_state'
import {
  addItem,
  clearItems,
  count,
  deleteItem,
  deleteItemByIndex,
  hasAny,
  hasAnyLike,
  max,
  maxRowNum,
  min,
  removeItem,
  sum,
} from './entity_collection'
export type { NumberGetter } from './entity_collection'
import type { NumberGetter } from './entity_collection'

export const REF_PROP_PREFIX = "$";

const getCustomProp = (e: any, propName: string) => {
  if (!e.customProperties) return undefined;
  return e.customProperties[propName];
};
const setCustomProp = (e: any, propName: string, propVal: any) => {
  if (!e) return;
  (e.customProperties ??= {})[propName] = propVal;
};
const delCustomProp = (e: any, propName: string) => {
  if (!e.customProperties) return;
  delete e.customProperties[propName];
};
const getRefProp = (e: any, propName: string) => {
  return getCustomProp(e, REF_PROP_PREFIX + propName) ?? e[propName];
};
const setRefProp = (e: any, propName: string, propVal: any) => {
  return setCustomProp(e, REF_PROP_PREFIX + propName, propVal);
};

const getValueObject = (e: any, propName: string): ValueObject => {
  return {
    value: e[propName],
    label: getRefProp(e, propName),
  };
};
const getRefObject = (e: any, f: MetaUiField): any => {
  const item: any = {};
  const propName = f.fieldName;
  const refFlds = f.reference.refFlds;

  // 加一个逻辑，判断customProperties是否有值，没值补一个进去
  if (!e.customProperties) {
    setRefProp(e, refFlds[0], e[refFlds[1]]);
  }

  refFlds.forEach((rf, i) => {
    if (i == 0) item[rf] = e[rf] ?? getCustomProp(e, rf) ?? e[propName]; // 第一个都是取值参数
    else item[rf] = e[rf] ?? getCustomProp(e, rf) ?? getRefProp(e, propName); // 取值优先级 model > REF_PROP_PREFIX > propName
  })


  return item;
};

const getEnumObject = (e: any, f: MetaUiField): any => {
  const fldRef = f.reference!;
  const enumItem = fldRef.enumFn(e[f.fieldName]);

  return enumItem;
};
const setValueObject = (e: any, propName: string, valueObj?: ValueObject) => {
  e[propName] = valueObj?.value;
  setRefProp(e, propName, valueObj?.label);
};

const getDataProp = (e: any, dataPath: string) => {
  if (dataPath.startsWith(REF_PROP_PREFIX)) {
    return getCustomProp(e, dataPath);
  } else if (dataPath.indexOf(".") == -1) {
    return e[dataPath];
  }

  return dataPath.split(".").reduce((o, i) => {
    if (o) return o[i];
  }, e);
};

const getOneProp = (e: any, one: string, propName: string) => {
  // if(!one || !e[one]) {
  //   console.warn('MetaModel.getOneProp',e,one,propName);
  // }
  if (!one || !e[one]) return undefined;
  return e[one][propName];
};

/**
 * 获取实体属性显示文本，自动处理枚举、引用和一对一关系引用
 * @param e 实体对象
 * @param f 元界面域
 * @returns
 */
const displayField = (e: any, f: MetaUiField, linkable: boolean = true) => {
  if (f.reference && linkable) {
    const r = f.reference;
    // console.debug(f);
    return r.hasOne ? r.labelFn(e[r.alias]) : getRefProp(e, f.fieldName);
  } else {
    return e[f.fieldName];
  }
};

const getFieldValue = (e: any, f: MetaUiField) => {
  const fv = e[f.fieldName] ?? f.defaultVal; // 如果实体中没有值，则使用字段的默认值
  if (f.reference) {
    if (fv === null || fv === undefined) return fv;
    const r = f.reference;
    return r.hasOne
      ? e[r.alias]
      : r.isRef
        ? getRefObject(e, f)
        : r.isEnum ? getEnumObject(e, f)
          : getValueObject(e, f.fieldName);
  }
  return fv;
};
const isBitField = (f: MetaUiField) =>
  (f.renderer && f.renderer.startsWith("EnumSet")) ||
  (f.editor && f.editor.startsWith("Bit"));
/**
 * 设置实体中字段的值，处理各种引用类型，包括位字段、枚举、
 * 以及一对一的关系。更新实体的字段值及其关联的引用属性
 * 如果适用。
 *
 * @param e -要设置字段值的实体对象。
 * @param f -表示要设置的字段的 MetaUiField 对象。
 * @param value -为指定字段设置的值。这可以是原始值或对象
 *                取决于字段的引用类型。
 * @returns 一个布尔值，指示字段值是否已修改。
 */
const setFieldValue = (e: any, f: MetaUiField, value: any): boolean => {
  if (f.reference) {
    const r = f.reference;
    if (isBitField(f)) {
      //value should be a number or object
      const v = isNumber(value) ? value : (value.id ?? 0);
      if (e[f.fieldName] == v) return false;
      e[f.fieldName] = v;
      const labels = r.refOptions
        .filter((it) => it.id & v)
        .map((it) => r.labelFn(it));
      setRefProp(e, f.fieldName, labels.join("|"));
    } else if (r.isEnum || r.isRef) {
      // value有可能是直接设置的值，这个时候允许赋值，不需要转换
      // const v = r.valueOf(value) ?? value;
      const v = r.valueOf(value);
      if (e[f.fieldName] == v) return false;
      e[f.fieldName] = v;
      // 处理引用 
      if (isObject(value)) { // 当是对象时 把所有refFlds的值都设置到 customProperties
        f.reference.refFlds.forEach((rf, i) => i == 0 ? setRefProp(e, f.fieldName, r.labelOf(value)) : setCustomProp(e, rf, value?.[rf]));
      } else { // 当是值时 拿当前实体中的ref设置到 customProperties
        setRefProp(e, f.fieldName, getRefProp(e, f.fieldName));
      }
      value && r.findOrAddValueObject(value); // 当有值时，添加到refOptions中
    } else if (r.hasOne) {
      const v = r.valueOf(value);
      if (e[f.fieldName] == v) return false;
      e[f.fieldName] = v;
      e[r.alias] = value;
    } else {
      e[r.alias] = value;
    }
  } else {
    if (e[f.fieldName] == value) return false;
    e[f.fieldName] = value;
  }
  modify(e);
  return true;
};

function withValue(value: any): PropertyDescriptor {
  const d =
    (withValue as any).d ||
    ((withValue as any).d = {
      enumerable: true,
      writable: true,
      configurable: true,
      value,
    });

  // avoiding duplicate operation for assigning value
  if (d.value !== value) d.value = value;

  return d;
}

export const defineDataProperty = <T, V = any>(
  o: T,
  p: PropertyKey,
  value?: V
) => Object.defineProperty(o, p, withValue(value));
export const defineGetter = <T, P = any>(
  o: T,
  p: PropertyKey,
  getter: () => P
) => Object.defineProperty(o, p, { get: getter });
export const defineSetter = <T, P = any>(
  o: T,
  p: PropertyKey,
  setter: (value: P) => void
) => Object.defineProperty(o, p, { set: setter });
export const defineID = <T>(o: T, getId: () => string) =>
  defineGetter(o, "id", getId);
export const defineCompute = <T>(o: T, computeFn: () => any) =>
  defineGetter(o, "compute", computeFn);

const entity: Entity = {
  rowNum: "0",
  editable: true,
  deletable: true,
  entityState: EntityState.DEFAULT,
};
//待试验，性能与new Entity()比较
export function defineEntity<T = any>(o?: object): T {
  if (!o) o = Object.create(entity);
  defineGetter(o, "isDirty", () => dirty(o));
  defineGetter(o, "isCreated", () => created(o));
  defineGetter(o, "isModified", () => modified(o));
  defineGetter(o, "isDeleted", () => deleted(o));
  defineSetter(o, "setModified", () => modify(o));
  defineSetter(o, "setDeleted", () => destroy(o));
  return o as T;
}
export function defineEntityWithId<E>(metaui: MetaUi, o?: object): E {
  const e = defineEntity<E>(o);
  if (metaui.primaryKey) {
    if (metaui.primaryKey.indexOf(",") != -1) {
      const keys = metaui.primaryKey.split(",");
      const getId = () => keys.map((k) => (o as any)[k]).join(",");
      defineID(e, getId);
    } else {
      const getId = () => (o as any)[metaui.primaryKey];
      defineID(e, getId);
    }
  }
  return e;
}
/**
 * 实体数组
 */
export class EntityArray<E extends Entity> extends Array<E> {
  constructor(
    public readonly ctor: EntityCtor<E>,
    items: object[] = []
  ) {
    super(...items.map((it) => ctor(it)));
  }
  hasAny(predicate?: (e: E, context?: any) => boolean) {
    return hasAny(this, predicate);
  }
  sum(numProp: string | NumberGetter<E>) {
    return sum(this, numProp);
  }
  min(numProp: string | NumberGetter<E>, init: number = 0) {
    return min(this, numProp, init);
  }
  max(numProp: string | NumberGetter<E>, init: number = 0) {
    return max(this, numProp, init);
  }
  count() {
    return count(this);
  }
  addItem(it: object) {
    this.push(this.ctor(it));
  }
  insertItem(it: object, at: number) {
    this.splice(at, 0, this.ctor(it));
  }
  deleteItem(it: E | number) {
    if (isNumber(it)) return deleteItemByIndex(this, it);
    return deleteItem(this, it);
  }
}

export function defineEntityArray<E extends Entity>(
  ctor: EntityCtor<E>,
  items?: object[]
) {
  return new EntityArray(ctor, items ?? []);
}

/**
 * 根据元数据创建实体
 * @typeParam E 要创建的实体类型
 * @param metaui 实体类型的元数据
 * @param proto 原型对象，凡是元数据中包括的所有属性拷贝至返回的实体对象
 * @param mapper 属性映射函数集合，例如 { targetProp: 'srcProp', }
 * @returns
 * @example
 * ```ts
 * let itemId = MetaModel.max(bom.items);
 * let bomItem:BOMItem = createEntity(metaui, defineBOMItem, material, {
 *  partNo: 'materialCode',
 *  itemID: (m)=>++itemId,
 *  bomID: ()=>bom.bomID,
 *  //...更多映射
 * })
 * bom.items.push(bomItem);
 * ```
 */
function createEntity<E>(
  metaui: MetaUi,
  creator: EntityCtor<E>,
  proto?: any,
  mapper?: Record<string, string | ((it: any) => any)>
): E {
  const e = Object.create(entity);

  if (proto) {
    // 配置实体修改/删除权限
    for (const key in e) {
      // new
      if (
        mapper &&
        ((key === 'deletable' && !!mapper[key]) ||
          (key === 'editable' && !!mapper[key]))
      ) {
        e[key] = isString(mapper[key])
          ? proto[mapper[key] as string]
          : (mapper[key] as ((it: any) => any))(proto);
      }
    }

    metaui.groups.forEach((group) => {
      if (group.many) {
        let defVal = [];
        if (mapper && mapper[group.groupName]) {
          const groupMapper = mapper[group.groupName];
          defVal = isString(groupMapper)
            ? proto[groupMapper]
            : groupMapper(proto);
        }
        defineDataProperty(e, group.groupName, defVal);
      } else {
        group.fields.forEach((field) => {
          const r = field.reference;
          if (r) {
            if (mapper && mapper[field.fieldName]) {
              const fieldMapper = mapper[field.fieldName];
              let defVal = isString(fieldMapper)
                ? proto[fieldMapper]
                : fieldMapper(proto);
              setFieldValue(e, field, defVal);
            } else {
              const defVal =
                getFieldValue(proto, field) ||
                r.defaultValueObject(field.defaultVal);
              setFieldValue(e, field, defVal);
            }
          } else {
            const dv = defaultDataTypeValue(field.dataType, field.defaultVal);
            let defVal = proto[field.fieldName] ?? dv;
            if (mapper && mapper[field.fieldName]) {
              const fieldMapper = mapper[field.fieldName];
              defVal = isString(fieldMapper)
                ? proto[fieldMapper]
                : fieldMapper(proto);
            }
            defineDataProperty(e, field.fieldName, defVal);
          }
        });
      }
    });
  } else {
    metaui.groups.forEach((group) => {
      if (group.many) {
        let defVal = [];
        if (mapper && mapper[group.groupName]) {
          const groupMapper = mapper[group.groupName];
          if (!isString(groupMapper) && groupMapper.length == 0)
            defVal = groupMapper(proto);
        }
        defineDataProperty(e, group.groupName, defVal);
      } else {
        group.fields.forEach((field) => {
          if (field.reference) {
            let defVal = field.reference.defaultValueObject(field.defaultVal);
            setFieldValue(e, field, defVal);
          } else {
            const dv = defaultDataTypeValue(field.dataType, field.defaultVal);
            let defVal = dv;
            if (mapper && mapper[field.fieldName]) {
              const fieldMapper = mapper[field.fieldName];
              if (!isString(fieldMapper) && fieldMapper.length == 0)
                defVal = fieldMapper(proto);
            }
            defineDataProperty(e, field.fieldName, defVal);
          }
        });
      }
    });
  }

  // 实体状态
  e.entityState = EntityState.CREATED;
  if (isFunction(mapper?.rowNum)) e.rowNum = mapper.rowNum(proto);
  return creator ? creator(e) : defineEntityWithId<E>(metaui, e);
}

export interface EntitySimplifyOptions {
  ignoreProperties: string[];
  ignoreNullish: boolean;
  ignoreDeeply: boolean;
  keepDirtyOnly: boolean;
}
export const defaultEntitySimplifyOptions = {
  ignoreProperties: ["actions"],
  ignoreNullish: true,
  ignoreDeeply: false,
  keepDirtyOnly: true,
};
/**
 * 删除模型对象的空值属性，空值指`null`|`undefined`
 * @param model 模型对象
 * @returns
 */
function ignoreNullishProps(model: any) {
  for (let name in model) {
    if (isNullOrUndefined(model[name])) delete model[name];
  }
  return model;
}

/**
 * 保存前简化实体模型，例如忽略`actions`和空值属性
 * @param metaui 元界面
 * @param model 实体模型
 * @param options 简化选项
 * @returns 简化后的实体模型
 */
function savable<E>(metaui: MetaUi, model: E, options: EntitySimplifyOptions) {
  let e = Object.assign<any, E>({}, model);
  const { ignoreProperties, ignoreDeeply, ignoreNullish, keepDirtyOnly } =
    options;
  ignoreProperties.forEach((prop) => delete e[prop]);
  if (ignoreNullish) ignoreNullishProps(e);
  if (ignoreDeeply) {
    metaui.groups
      .filter((g) => g.many)
      .forEach((g) => {
        let gv = e[g.groupName];
        if (Array.isArray(gv) && !isEmpty(gv)) {
          if (keepDirtyOnly) gv = gv.filter((it) => it.isDirty);
          gv.forEach((it: any) => {
            ignoreProperties.forEach((prop) => delete it[prop]);
            ignoreNullishProps(it);
          });
        }
        e[g.groupName] = gv;
      });
  }
  modify(e);
  return e;
}
/**
 * 赋值实体对象，更新属性和相关的子表并触发响应式
 * @param metaui 元界面数据
 * @param model 要赋值的实体对象
 * @param data 从服务器返回的数据对象
 */
function assign<E extends Entity>(metaui: MetaUi, model: E, data: any) {
  metaui.groups.forEach((g) => {
    if (g.many) {
      (model as any)[g.groupName].splice(
        0,
        Infinity,
        ...(data[g.groupName] ?? [])
      );
    } else {
      g.fields.forEach((f) => setFieldValue(model, f, getFieldValue(data, f)));
    }
  });
  model.actions = data.actions;
  model.entityState = data.entityState ?? EntityState.DEFAULT;
  model.editable = data.editable ?? true;
  model.deletable = data.deletable ?? true;
}
/**
 * 添加子表项参数
 * @typeParam E 主表实体类型，如`BOM`
 * @typeParam G 子表实体类型，如`BOMItem`
 */
export interface SubGroupItemTransform<E, G> {
  metaUiGroup: MetaUiGroup;
  source: any;
  target: E;
  creator: EntityCtor<G>;
  propsMapper?: PropsMapper;
  ignoreMapper?: Record<string, string>;
  sequenceKey?: string;
}

export type PropsMapper = Record<string, string | ((it: any) => any)>

/** 会话侧子表转换参数：group 可以是组名，由 UiContext 解析成 MetaUiGroup。 */
export interface SubGroupItemTransformParam<G> {
  group: string | MetaUiGroup
  source?: any
  target?: any
  creator?: EntityCtor<G>
  propsMapper?: PropsMapper
  ignoreMapper?: Record<string, string>
  sequenceKey?: string
}

/**
 * 创建子表项，例如给BOM实体对象`bom`创建`items`
 * @typeParam E 主表实体类型，如`BOM`
 * @typeParam G 子表实体类型，如`BOMItem`
 * @param param 参数，
 * @param addToTarget 创建后是否立即添加到目标
 * @returns 如果`param`.`source`是数组，返回结果也是数组，否则是单个实体对象
 * @example
 * ```ts
 * const bom:BOM = ...;//假设你有一个实体对象bom
 * //会自动处理关联主键bomID, 自增itemID, 行号rowNum
 * const items = MetaModel.createSubGroupItems({
 *  metaUiGroup: context.metaui.getGroup('items'),//bom元数据
 *  source: selection,//源数组 Material[]
 *  target: bom, //添加至target.items
 *  creator: defineBOMItem, //创建BOMItem函数
 *  sequenceKey: 'itemID',//itemID自动+1
 *  propsMapper: { //映射
 *    partNo: 'materialCode',
 *    unit: (m)=>m.unit ?? 'PCS'
 *  }
 * })
 * ```
 */
function createSubGroupItems<E, G extends Entity>(
  param: SubGroupItemTransform<E, G>,
  addToTarget: boolean = false
) {
  const { metaUiGroup, source, target, creator, propsMapper = {} } = param;
  const toModel = target as any;
  const toItems = toModel[metaUiGroup.groupName] as G[];
  // rowNum 过滤掉已删除的行，避免行号重复
  let rowNum = maxRowNum(toItems.filter((it) => !deleted(it)));
  propsMapper.rowNum = () => (++rowNum).toFixed();
  //sequenceKey
  let sequenceId = 0;
  let sequenceKey = param.sequenceKey ?? metaUiGroup.sequenceKey;
  if (!!sequenceKey && !propsMapper[sequenceKey]) { // 当前没有传入时才自动处理
    sequenceId = max(toItems, sequenceKey);
    propsMapper[sequenceKey] = () => ++sequenceId;
  }
  //joinFields
  if (metaUiGroup.joinFields) {
    Object.entries(metaUiGroup.joinFields).forEach(([t, s]) => {
      if (!propsMapper[t]) propsMapper[t] = () => toModel[s];
    });
  }

  // 多选数据添加到子表中
  if (Array.isArray(source)) {
    // 1. 将源数据转换为子表项实体对象
    const newItems = source
      .map((it) => createEntity(metaUiGroup.groupUi, creator, it, propsMapper))

    if (addToTarget) toItems.push(...newItems);
    return newItems;
  } else {
    const newItem = createEntity(
      metaUiGroup.groupUi,
      creator,
      source ?? target,
      // target,
      propsMapper
    );
    if (addToTarget) toItems.push(newItem);
    return newItem;
  }
}
/**
 * 添加子表项，例如给BOM实体对象`bom`添加`items`
 * @typeParam E 主表实体类型，如`BOM`
 * @typeParam G 子表实体类型，如`BOMItem`
 * @param param 参数，
 * @example
 * ```ts
 * const bom:BOM = ...;//假设你有一个实体对象bom
 * //会自动处理关联主键bomID, 自增itemID, 行号rowNum
 * MetaModel.addGroupItems({
 *  metaUiGroup: context.metaui.getGroup('items'),//bom元数据
 *  source: selection,//源数组 Material[]
 *  target: bom, //添加至toModel.items
 *  creator: defineBOMItem, //创建BOMItem函数
 *  sequenceKey: 'itemID',//itemID自动+1
 *  propsMapper: { //映射
 *    partNo: 'materialCode',
 *    unit: (m)=>m.unit ?? 'PCS'
 *  }
 * })
 * ```
 */
function addSubGroupItems<E, G extends Entity>(
  param: SubGroupItemTransform<E, G>
) {
  createSubGroupItems(param, true);
}

/**
 * 元模型静态函数
 */
export const MetaModel = {
  isEntity,
  created,
  createdForModified,
  modified,
  deleted,
  dirty,
  modify,
  destroy,

  createEntity,

  getCustomProp,
  setCustomProp,
  delCustomProp,
  getRefProp,
  setRefProp,
  getValueObject,
  setValueObject,
  getDataProp,
  getOneProp,
  ignoreNullishProps,

  displayField,
  getFieldValue,
  setFieldValue,

  isEmpty,
  sum,
  min,
  max,
  maxRowNum,
  count,
  hasAny,
  hasAnyLike,
  addItem,
  removeItem,
  deleteItem,
  deleteItemByIndex,
  clearItems,

  assign,
  createSubGroupItems,
  addSubGroupItems,
  savable,
} as const;
