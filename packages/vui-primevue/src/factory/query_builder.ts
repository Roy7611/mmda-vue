import { h } from 'vue'
import type { UiQueryBuilderProps } from '@mmda/vui'
import {
  QueryBuilderHost,
  htmlAttributesOf,
  queryBuilderModifierClasses,
} from '@mmda/vui'

export function createQueryBuilder(props: UiQueryBuilderProps) {
  const {
    onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props
  return h(QueryBuilderHost, {
    ...rest,
    ...htmlAttributesOf(props),
    class: queryBuilderModifierClasses(props).flat(),
    onChange,
  })
}
