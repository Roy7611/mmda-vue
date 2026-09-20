/** 忽略未定义元素（纯函数，不修改全局 Array.prototype）。 */
export function skipUndefined<T>(items: T[]): T[] {
  return items.filter((value) => value !== undefined)
}

/** 忽略未定义和空值元素。 */
export function skipNullAndUndefined<T>(items: T[]): T[] {
  return items.filter((value) => value !== undefined && value !== null)
}

/** 返回忽略未定义元素的数组。 */
export function nonUndefinedArray<T>(items: T[]): T[] {
  return skipUndefined(items)
}

/** 返回忽略未定义和空值元素的数组。 */
export function nonNullArray<T>(items: T[]): T[] {
  return skipNullAndUndefined(items)
}
