import { ReactUiFieldFactory } from '@mmda/rui'
import type { ReactNode } from 'react'
import { SfReactUiFactory } from './factory'

/**
 * Syncfusion EJ2 React 字段控件工厂。
 *
 * `MetaUiField → UiXxxProps → factory.xxx` 的通用映射已在 @mmda/rui 的
 * {@link ReactUiFieldFactory} 完成；本类只负责绑定 Syncfusion factory。
 */
export class SfReactUiFieldFactory extends ReactUiFieldFactory {
  constructor(factory: SfReactUiFactory = new SfReactUiFactory()) {
    super(factory)
  }
}
