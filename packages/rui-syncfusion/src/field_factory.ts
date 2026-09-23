import { RuiFieldFactory } from '@mmda/rui'
import type { ReactNode } from 'react'
import { SfRuiFactory } from './factory'

/**
 * Syncfusion EJ2 React 字段控件工厂。
 *
 * `MetaUiField → UiXxxProps → factory.xxx` 的通用映射已在 @mmda/rui 的
 * {@link RuiFieldFactory} 完成；本类只负责绑定 Syncfusion factory。
 */
export class SfRuiFieldFactory extends RuiFieldFactory {
  constructor(factory: SfRuiFactory = new SfRuiFactory()) {
    super(factory)
  }
}
