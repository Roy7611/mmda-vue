import { h } from 'vue'
import { NaiveTree } from '../components/NaiveTree'
import type { UiTreeProps } from '@mmda/vui'
import { treeModifierClasses } from '@mmda/vui'

export function createTree<T = any>(props: UiTreeProps<T>) {
  const { class: _className, ...rest } = props
  return h(NaiveTree as any, {
    ...rest,
    class: treeModifierClasses(props),
  })
}
