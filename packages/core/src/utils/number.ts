/** 取精确数值：默认 6 位小数，去掉尾部 0（纯函数，不修改全局 Number.prototype）。 */
export function toPrecise(value: number, digits = 6): string {
  return Number(value)
    .toFixed(digits)
    .replace(/\.?0+$/, '')
}

export function hasBit(value: number, bit: number): boolean {
  return (value & bit) === bit
}
