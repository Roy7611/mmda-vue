import type { EntityAction } from "../metaui/metaui_action";
import type { EntitySearchParam } from "./entity_search";

export * from "./entity_search";

export { EntityActionType, entityActionFactory } from "../metaui/metaui_action";
export type { ActionCallback, EntityAction } from "../metaui/metaui_action";

export type SelectableFn<E = any> = (e: E, context?: any) => boolean;
export type LooseRequired<T> = { [P in keyof (T & Required<T>)]: T[P] };
/**
 * 实体状态
 */
export const enum EntityState {
  /** @deprecated 使用 EntityState.DEFAULT */
  DEFUALT = 0,
  DEFAULT = 0,

  //客户端已修改
  MODIFIED = 1,

  //客户端新增
  CREATED = 2,

  //客户端新增后，做了修改
  CREATED_MODIFIED = CREATED | MODIFIED,

  //客户端已删除
  DELETED = 4,
}

/**
 * 值对象，常用于选择域（如Dropdown）的数据源
 */
export interface ValueObject {
  value: any;
  label: string;
}

/**
 * 实体接口，从服务器获取的Json数据
 */
export abstract class Entity {
  [index: string]: any;
  rowNum: string;
  editable: boolean;
  deletable: boolean;
  entityState: EntityState;
  actions?: EntityAction[];
  customProperties?: Record<string, any>;
}

/**
 * 实体构造函数
 */
export type EntityCtor<E> = (o: object) => E;

/**
 * 实体抽象基类
 *
 * @example 举例，你的贸易伙伴实体类
 * ```ts
 * //partner.ts
 * export class Partner extends Entity {
 *  partnerID: string;
 *  partnerCode?: string;
 *  partnerName: string;
 *  //more props goes here...
 *  constructor(o?: any) {
 *    super();
 *    Object.assign(this,o);
 *  }
 * }
 * ```
 */

// export abstract class Entity {
//   // [index: string]: any;
//   constructor(public rowNum: number = 0,
//     public entityState: EntityState = EntityState.CREATED,
//     public editable: boolean = true,
//     public deletable: boolean = true,
//     public actions?: EntityAction[],
//     public customProperties?: Record<string,any>){
//   }
//   abstract get id():any;

//   get isCreated(){
//       return (this.entityState & EntityState.CREATED) > 0;
//   }
//   get isModified(){
//       return (this.entityState & EntityState.MODIFIED) > 0;
//   }
//   get isDeleted(){
//       return (this.entityState & EntityState.DELETED) > 0;
//   }
//   get isDirty(){
//       return this.entityState != EntityState.DEFUALT;
//   }

//   setModified(){ this.entityState |= EntityState.MODIFIED; }
//   setDeleted(){ this.entityState |= EntityState.DELETED; }

//   getCustomProp(propName: string){
//       return getCustomProp(this,propName);
//   }
//   setCustomProp(propName: string, propVal: any){
//     setCustomProp(this,propName,propVal);
//   }
//   removeCustomProperty(propName: string){
//     if(!this.customProperties) return;
//     this.customProperties.delete(propName);
//   }

//   getRefProp(propName: string){
//     return getRefProp(this,propName)
//   }
//   setRefProp(propName: string, propVal: any){
//     setRefProp(this,propName,propVal)
//   }

//   getValueObject(propName: string){
//     return getValueObject(this,propName)
//   }
//   setValueObject(propName: string, valueObj: any){
//     setValueObject(this,propName,valueObj)
//   }

//   getDataProp(dataPath: string){
//     return getDataProp(this,dataPath)
//   }

//   getOneProp(one: string, propName: string){
//     return getOneProp(this,one,propName)
//   }

//   toJSON(){
//     return JSON.stringify(this);
//   }
// }

/**
 * 视图模型
 *
 * @remarks
 *
 * 包含：
 * 1. entity 主实体对象
 * 2. valueObjects 值对象存储主实体对象的关联数据，比如选择项，枚举项，hidden函数，readOnly函数，引用值修改函数setValueObject
 * 3. computed 函数可用于valueObjects
 * 4. methods 方法比如，save, calc, doAction(a) 事件和行为
 * 5. lifetimes 声明周期钩子
 * 6. props, emits, slots, attrs 等组件架构
 * 使用选项式API更适合先写纯TS/JS的逻辑，然后组装成Vue或者Wx小程序的Component
 *
 * @example
 * 可以这么写一个实体编辑器逻辑
 * ```ts
 * // putaway_logic.ts
 * export default {
 *  props: ["id"]
 *  data() {
 *    return buildViewModel(Putaway, metaui)
 *  },
 *  computed: {
 *    totalQuantity(){ return this.items.reduce((prev,curr)=>prev+curr.quantity),0},
 *  },
 *  methods: {},
 *  lifetimes: {
 *    // 小程序和H5不一样写法
 *  },
 * }
 * ```
 *
 * 然后这么定义编辑器组件
 * ```ts
 * //putaway_edit.ts
 * import * as PutawayLogic from './putaway_logic.ts'
 * <script lang="ts">
 * export default defineEditor(
 *  PutawayLogic
 * );
 * </script>
 * ```
 */

/**
 * 实体引用键
 */
export interface EntityRefKey {
  refName: string;
  refID: string;
}
/**
 * 实体引用项键
 */
export interface EntityRefItemKey extends EntityRefKey {
  refItemID: number;
}
/**
 * 实体创建参数
 */
export interface EntityCreateParam extends Partial<EntityRefKey> {
  refItemKeys?: EntityRefItemKey[];
}
/**
 * 实体选择参数
 * searchFieldList 实体搜索条件列表
 * searchFieldProps 搜索条件组件props 例如：{fieldName: {param1: value,param2: value}}
 * searchFieldSearchParam 搜索条件自定义接口入参 例如：{fieldName: {param1: value,param2: value}}
 */
export interface EntitySelectParam<E> {
  repository: string;
  service?: string;
  searchParam?: EntitySearchParam;
  selectionMode?: "single" | "multiple";
  /** 缺省时由对方服务元数据 `MetaModel.createEntity` 构造，跨服务不必引用对方模型包 */
  ctor?: EntityCtor<E>;
  searchFieldList?: string[];
  searchFieldProps?: Record<string, any>;
  searchFieldSearchParam?: Record<string, any>;
  pageSizeOptions?: number[];
  labelKey?: string;
  selectableFn?: SelectableFn; // 用于标记可选择项的函数
  /** 弹窗 Footer 操作按钮（可选），显示在取消/确认按钮左侧 */
  footerActions?: import("../metaui/metaui_field").FooterAction[];
  /** 已选面板 label 格式化函数，传入选中行返回显示文本，仅多选模式生效。不传则从 group a1 首个 field 自动推导 */
  labelFn?: (item: any) => string;
}
// 工厂方法，不好用
// export function createEntity<E extends Entity>(c: new(o?: any) => E): E {
//   return new c();
// }
