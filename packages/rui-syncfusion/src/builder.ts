import { createElement, type ReactNode } from 'react'
import type { UiProps, MetaUiGroup } from '@mmda/core'
import { ReactUiBuilder } from '@mmda/rui'
import { SfReactUiFactory } from './factory'
import { SfReactUiFieldFactory } from './field_factory'
import { sfReactUiOverlay } from './overlay'

export class SfReactUiBuilder extends ReactUiBuilder {
  constructor(
    factory: SfReactUiFactory = new SfReactUiFactory(),
    fieldFactory: SfReactUiFieldFactory = new SfReactUiFieldFactory(factory),
  ) {
    super(factory, fieldFactory)

    this.toast = (_ctx, props) => sfReactUiOverlay.toast(props)
    this.message = (_ctx, props) => sfReactUiOverlay.message(props)
    this.confirm = (_ctx, props) => sfReactUiOverlay.confirm(props)
    this.dialog = (content, _ctx, props) =>
      sfReactUiOverlay.dialog(content, props ?? {})
  }

  // —— Syncfusion skin ——
  setColorScheme(dark: boolean): void {
    // TODO: apply syncfusion dark theme
  }

  setFontScale(_scale: unknown): void {
    // TODO: syncfusion font scaling
  }

  // —— groupCard（e-card 包装）——
  buildGroupCard(group: MetaUiGroup, body: ReactNode | ReactNode[], props: UiProps = {}): ReactNode {
    const cls = (props as any).class ?? ''
    return createElement('div', {
      className: `e-card mmda-group ${cls}`,
      key: group.groupName,
    },
      createElement('div', { className: 'e-card-header' },
        createElement('div', { className: 'e-card-header-caption' },
          createElement('div', { className: 'e-card-header-title' }, group.groupLabel),
        ),
      ),
      createElement('div', { className: 'e-card-content' }, body),
    )
  }
}
