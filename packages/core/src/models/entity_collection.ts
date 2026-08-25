import type { Predicate } from '../metaui/metaui_field'
import { isEmpty, isString } from '../utils/is'
import type { Entity } from './entity'
import { created, deleted, destroy } from './entity_state'

export type NumberGetter<E> = (e: E) => number | null | undefined;
const getNumProp = (e: any, prop: string) => e[prop] as number;

/**
 * 计算实体数组中某个数值属性的和
 * @template E 实体类型
 * @param {E[]} entities 实体数组
 * @param {string | NumberGetter<E>} numProp 数值属性名或一个获取数值的函数
 * @returns {number} 实体数组中数值属性的和
 */
export const sum = <E extends Entity>(
  entities: E[],
  numProp: string | NumberGetter<E>
) => {
  if (isEmpty(entities)) return 0;
  const numGetter = isString(numProp)
    ? (e: E) => getNumProp(e, numProp)
    : numProp;
  return entities
    .filter((e) => !e.isDeleted)
    .reduce((prev, curr) => prev + (numGetter(curr) || 0), 0);
};
export const min = <E extends Entity>(
  entities: E[],
  numProp: string | NumberGetter<E>,
  init: number = Number.MAX_VALUE
) => {
  if (isEmpty(entities)) return init;
  const numGetter = isString(numProp)
    ? (e: E) => getNumProp(e, numProp)
    : numProp;
  return entities.reduce((prev, curr) => {
    const currVal = numGetter(curr) || 0;
    return currVal < prev ? currVal : prev;
  }, init);
};
export const max = <E extends Entity>(
  entities: E[],
  numProp: string | NumberGetter<E>,
  init: number = Number.MIN_VALUE
) => {
  if (isEmpty(entities)) return init;
  const numGetter = isString(numProp)
    ? (e: E) => getNumProp(e, numProp)
    : numProp;
  return entities.reduce((prev, curr) => {
    const currVal = numGetter(curr) || 0;
    return currVal > prev ? currVal : prev;
  }, init);
};
/**
 * 计算实体数组中最大的行号
 * @param entities 实体数组
 * @return 实体数组中最大的行号，如果数组为空则返回0
 */
export const maxRowNum = <E extends Entity>(entities: E[]) => {
  if (isEmpty(entities)) return 0;
  const rowNumGetter = (e: E) => Number(e.rowNum);
  return entities.reduce((prev, curr) => {
    const currVal = rowNumGetter(curr) || 0;
    return currVal > prev ? currVal : prev;
  }, 0);
};
export const count = <E extends Entity>(entities: E[]) => {
  return entities.filter((e) => !deleted(e)).length;
};

/**
 * 是否存在满足条件的实体
 * @param items 实体数组
 * @param predicate 可选的条件函数，返回true表示满足条件
 * @returns 如果存在满足条件的实体，返回true，否则返回false
 */

export const hasAny = <E extends Entity>(items: E[], predicate?: Predicate<E>) => {
  if (isEmpty(items)) return false;
  return predicate
    ? items.some((it) => !deleted(it) && predicate(it))
    : items.some((it) => !deleted(it));
};
/**
 * 是否存在满足条件的实体
 * @param items 实体数组
 * @param props 条件对象，key为实体的字段名，value为对应的值
 * @return 是否存在满足条件的实体
 */
export const hasAnyLike = <E extends Entity>(
  items: E[],
  props: Record<string, any>
) => {
  const predicate = (e: E) => {
    for (const k in props) {
      if (e[k] != props[k]) return false;
    }
    return true;
  };
  return hasAny(items, predicate);
};
export const addItem = <E extends Entity>(entities: E[], item: E) => {
  let rowNum = maxRowNum(entities);
  item.rowNum = (++rowNum).toFixed();
  return entities.push(item);
};
// 移除
export const removeItem = <E extends Entity>(entities: E[], item: E) => {
  const index = entities.indexOf(item);
  if (index >= 0) return entities.splice(index, 1).length;
  else return 0;
};
export const deleteItem = <E extends Entity>(entities: E[], item: E) => {
  if (created(item)) {
    return removeItem(entities, item);
  } else {
    destroy(item);
    return 1;
  }
};
export const deleteItemByIndex = <E extends Entity>(entities: E[], index: number) => {
  const item = entities[index];
  if (!item) return 0;
  if (created(item)) {
    const deleted = entities.splice(index, 1);
    return deleted.length;
  } else {
    destroy(item);
    return 1;
  }
};
// 清空
export function clearItems<E extends Entity>(entities: E[]) {
  const createdItems = entities
    .filter((it) => it.isCreated)
    .forEach((it) => removeItem(entities, it));
  for (const item of entities) {
    destroy(item);
  }
}
