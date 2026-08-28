import { EntityState } from './entity'

/**
 * 判断是否实体类型
 * @param e 对象
 * @returns
 */
export const isEntity = (e: any): e is object => Object.prototype.hasOwnProperty.call(e, "entityState");
/**
*如果实体已创建，则返回 true。
 *@param e 实体对象
 *@如果实体被创建则返回 true，否则返回 false
 */
export const created = (e: any) =>
  (e.entityState & EntityState.CREATED) === EntityState.CREATED;
/**
*如果实体已创建且已修改，则返回 true。
 *@param e 实体对象
 *@如果实体被创建且已修改则返回 true，否则返回 false
 */
export const createdForModified = (e: any) =>
  (e.entityState & EntityState.CREATED_MODIFIED) === EntityState.CREATED_MODIFIED;
/**
 * 如果实体已修改，则返回 true。
 * @param e 实体对象
 * @returns 如果实体被修改则返回 true，否则返回 false
 */
export const modified = (e: any) =>
  (e.entityState & EntityState.MODIFIED) === EntityState.MODIFIED;
/**
 * 如果实体已删除，则返回 true。
 * @param e 实体对象
 * @returns 如果实体被删除则返回 true，否则返回 false
 */
export const deleted = (e: any) =>
  (e.entityState & EntityState.DELETED) === EntityState.DELETED;

/**
 * 如果实体已更改，则返回 true。
 * @param e 实体对象
 * @returns 如果实体已更改则返回 true，否则返回 false
 */
export const dirty = (e: any) => e.entityState !== EntityState.DEFAULT;

/**
 * 通过将实体的entityState 设置为MODIFIED 将实体标记为已修改 
 * 
 * @param e -要标记为已修改的实体对象
 */
export const modify = (e: any) => {
  e.entityState |= EntityState.MODIFIED;
};
/**
 * 通过将实体的entityState 设置为DELETED 将实体标记为已删除。
 * 
 * @param e -要标记为已删除的实体对象。
 */
export const destroy = (e: any) => {
  // old logic 是通过 逻辑运算符|= EntityState.DELETED 来标记删除的，这样做的好处是可以保留之前的状态（比如是否已修改），坏处是如果之前是MODIFIED状态，那么现在就是MODIFIED | DELETED状态了，可能会导致一些逻辑判断上的混乱。
  // e.entityState |= EntityState.DELETED;

  // new logic 新的逻辑是直接把状态设置为DELETED，这样就清晰明了了。
  e.entityState = EntityState.DELETED;
};

/**
 * 通过将实体的entityState 重置为MODIFIED（如果之前标记为DELETED）将实体标记为未删除。
 * 
 * @param e -要重置删除状态的实体对象。
 */
export const reset = (e: any) => {
  e.entityState = (e.entityState & ~EntityState.DELETED) | EntityState.MODIFIED;
};

