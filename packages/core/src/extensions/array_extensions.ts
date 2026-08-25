
declare global {
  interface Array<T> {
    /**
     * 忽略未定义元素
     */
    skipUndefined(): Array<T>;
    skipNullAndUndefined(): Array<T>;
  }
}

/**
 * 忽略未定义元素
 */
Array.prototype.skipUndefined = function () {
  return this.filter((value) => value !== undefined)
}
/**
 * 忽略未定义和空值元素
 */
Array.prototype.skipNullAndUndefined = function () {
  return this.filter((value) => value !== undefined && value !== null)
}
/**
 * 返回忽略未定义元素的数组
 */
export function nonNullArray<T>(a: Array<T>) {
  return a.skipNullAndUndefined();
}
export function nonUndefinedArray<T>(a: Array<T>) {
  return a.skipUndefined();
}
export { }
