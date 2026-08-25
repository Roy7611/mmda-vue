declare global {
  interface Number {
    toPrecise(digits?: number): string
    hasBit(bit: number) : boolean
  }
}

/** 取精确数值：默认 6 位小数，去掉尾部 0 */
Number.prototype.toPrecise = function (digits: number = 6): string {
  return Number(this)
    .toFixed(digits)
    .replace(/\.?0+$/, '')
}
Number.prototype.hasBit = function (bit: number) : boolean {
  return ((this as number) & bit) === bit
}
export function hasBit(value: number, bit: number): boolean {
  return (value & bit) === bit
}

export {}
