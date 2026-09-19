import { h } from 'vue'
import type { UiQueryBuilderProps } from '@mmda/core'
import { QueryBuilderHost, queryBuilderModifierClasses } from '@mmda/vui'
import { uiRenderProps } from '@mmda/core'

export function createQueryBuilder(props: UiQueryBuilderProps) {
  const {
    onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props
  return h(QueryBuilderHost, {
    ...rest,
    ...uiRenderProps(props).attributes,
    class: queryBuilderModifierClasses(props).flat(),
    onChange,
  })
}
