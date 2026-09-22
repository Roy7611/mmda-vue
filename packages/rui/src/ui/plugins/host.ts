import { PluginHost } from '@mmda/core'
import type { ReactNode } from 'react'

export class ReactPluginHost extends PluginHost<ReactNode> {}

/** 给裸对象挂上同一套 use / plugin / build 方法链。 */
export function mixPluginHost<T extends object>(target: T): T {
  return new ReactPluginHost().mixInto(target)
}
