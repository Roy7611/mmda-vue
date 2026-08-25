/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2025-07-01 15:29:27
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2025-07-07 18:30:33
 * @FilePath: /mmda-vue/packages/core/src/extensions/string_extensions.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
declare global {
  interface String {
    firstLetterLower(): string;
    firstLetterUpper(): string;
    thousandDigitFormat(): string;
  }
}
String.prototype.firstLetterLower = function (): string {
  if (!this.length) return String(this)
  return this[0].toLowerCase() + this.slice(1)
}
String.prototype.firstLetterUpper = function (): string {
  if (!this.length) return String(this)
  return this[0].toUpperCase() + this.slice(1)
}
// 数字字符串千分位格式化
String.prototype.thousandDigitFormat = function (): string {
  // 分离整数和小数部分
  const parts = this.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  // 添加千分位逗号
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // 组合结果
  return integerPart + decimalPart;
}

export function toCamel(value: string): string {
  return value.firstLetterUpper();
}
// make this file a module
export { };