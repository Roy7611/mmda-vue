import { h, reactive } from 'vue'
import { NTreeSelect } from 'naive-ui'
import type { UiTreeSelectProps } from '@mmda/vui'
import {
  htmlAttributesOf,
  treeChildrenOf,
  treeHasExpandableChildren,
  treeIdOf,
  treeLabelOf,
  treeSelectNodesOf,
  type UiTreeFields,
} from '@mmda/vui'

type NaiveTreeOption = {
  key: string
  label: string
  isLeaf?: boolean
  children?: NaiveTreeOption[]
  src: unknown
}

function toNaiveOptions<T>(
  rows: T[],
  fields?: UiTreeFields<T>,
): NaiveTreeOption[] {
  return rows.map(row => {
    const kids = treeChildrenOf(row, fields)
    const expandable = treeHasExpandableChildren(row, fields)
    const option: NaiveTreeOption = {
      key: treeIdOf(row, fields),
      label: treeLabelOf(row, fields),
      isLeaf: !expandable,
      src: row,
    }
    if (kids?.length) option.children = toNaiveOptions(kids, fields)
    else if (expandable) option.children = []
    return option
  })
}

function idsOf(props: UiTreeSelectProps): string[] {
  const raw = props.value ?? props.modelValue
  if (props.selectionMode === 'checkbox') {
    const list = Array.isArray(raw) ? raw : raw == null || raw === '' ? [] : [raw]
    return list.map(String)
  }
  if (raw == null || raw === '') return []
  return [String(raw)]
}

function emitValue(props: UiTreeSelectProps, ids: string[]) {
  const next =
    props.selectionMode === 'checkbox' ? ids : (ids[0] ?? null)
  props.onChange?.(next)
  props['onUpdate:modelValue']?.(next)
  props.onUpdate?.(next)
}

export function createTreeSelect(props: UiTreeSelectProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    data: _data,
    fields,
    placeholder,
    disabled,
    allowFiltering,
    selectionMode,
    showClear,
    selectedDisplay: _selectedDisplay,
    delimiter: _delimiter,
    popupHeight,
    popupWidth,
    loadMode,
    onExpand,
    loadRoots,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    treeShape: _treeShape,
    shapeKey: _shapeKey,
    ...rest
  } = props

  const checkbox = selectionMode === 'checkbox'
  const state = reactive({
    options: toNaiveOptions(treeSelectNodesOf(props), fields),
  })
  if (loadMode === 'lazy' && loadRoots) {
    void Promise.resolve(loadRoots()).then(rows => {
      state.options = toNaiveOptions((rows ?? []) as never[], fields)
    })
  }

  const ids = idsOf(props)
  const value = checkbox ? ids : (ids[0] ?? null)

  return h(NTreeSelect, {
    ...rest,
    ...htmlAttributesOf(props),
    value,
    options: state.options,
    placeholder,
    disabled,
    filterable: allowFiltering !== false,
    clearable: showClear !== false,
    multiple: checkbox,
    checkable: checkbox,
    checkStrategy: checkbox ? 'child' : undefined,
    menuProps:
      popupHeight != null || popupWidth != null
        ? {
            style: {
              height: popupHeight != null ? String(popupHeight) : undefined,
              width: popupWidth != null ? String(popupWidth) : undefined,
            },
          }
        : undefined,
    class: ['mmda-tree-select', props.class].flat(),
    onLoad: async (option: NaiveTreeOption) => {
      const src = option.src
      if (src != null) await onExpand?.(src)
      const kids = treeChildrenOf(src, fields)
      option.children = kids?.length ? toNaiveOptions(kids, fields) : []
    },
    'onUpdate:value': (next: string | string[] | null) => {
      if (Array.isArray(next)) emitValue(props, next.map(String))
      else emitValue(props, next == null || next === '' ? [] : [String(next)])
    },
  })
}

export function createDropDownTree(props: UiTreeSelectProps) {
  return createTreeSelect(props)
}
