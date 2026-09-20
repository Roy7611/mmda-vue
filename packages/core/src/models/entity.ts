import type { EntityAction } from "./entity_action";

export * from "./entity_search";
export * from "./date_range";
export * from "./date_filter";

export type LooseRequired<T> = { [P in keyof (T & Required<T>)]: T[P] };
/**
 * 实体状态
 */
export enum EntityState {
  //默认前端未修改
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
  value: unknown;
  label: string;
}

/**
 * 实体抽象基类，从服务器获取的Json数据
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

export abstract class Entity {
  [index: string]: any;
  rowNum!: string;
  editable!: boolean;
  deletable!: boolean;
  entityState!: EntityState;
  actions?: EntityAction[];
  customProperties?: Record<string, any>;
}

/**
 * 实体构造函数
 */
export type EntityCtor<E> = (o: object) => E;

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
