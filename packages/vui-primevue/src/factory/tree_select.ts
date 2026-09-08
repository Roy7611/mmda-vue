import { h, reactive } from 'vue'
import TreeSelect from 'primevue/treeselect'
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

type PrimeTreeNode = {
  key: string
  label: string
  icon?: string
  leaf?: boolean
  children?: PrimeTreeNode[]
  data: unknown
}

type PrimeCheckKeys = Record<
  string,
  { checked?: boolean; partialChecked?: boolean }
>

function toPrimeNodes<T>(rows: T[], fields?: UiTreeFields<T>): PrimeTreeNode[] {
  return rows.map((row) => {
    const kids = treeChildrenOf(row, fields)
    const expandable = treeHasExpandableChildren(row, fields)
    const node: PrimeTreeNode = {
      key: treeIdOf(row, fields),
      label: treeLabelOf(row, fields),
      leaf: !expandable,
      data: row,
    }
    const icon = fields?.icon
    if (typeof icon === 'string') {
      const name = (row as Record<string, unknown>)[icon]
      if (typeof name === 'string' && name) node.icon = name
    }
    if (kids?.length) node.children = toPrimeNodes(kids, fields)
    else if (expandable) node.children = []
    return node
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

function checkboxKeys(ids: string[]): PrimeCheckKeys {
  const keys: PrimeCheckKeys = {}
  for (const id of ids) keys[id] = { checked: true, partialChecked: false }
  return keys
}

function idsFromCheckboxKeys(keys: PrimeCheckKeys | null | undefined): string[] {
  if (!keys) return []
  return Object.entries(keys)
    .filter(([, state]) => state?.checked)
    .map(([id]) => id)
}

function emitValue(props: UiTreeSelectProps, ids: string[]) {
  const next =
    props.selectionMode === 'checkbox' ? ids : (ids[0] ?? null)
  props.onChange?.(next)
  props['onUpdate:modelValue']?.(next)
  props.onUpdate?.(next)
}

function primeDisplay(display?: UiTreeSelectProps['selectedDisplay']) {
  if (display === 'chips') return 'chip'
  return 'comma'
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
    selectedDisplay,
    popupHeight,
    showSelectAll,
    selectAllLabel,
    header,
    item,
    selected,
    loadMode,
    onExpand,
    loadRoots,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    delimiter: _delimiter,
    popupWidth: _popupWidth,
    treeShape: _treeShape,
    shapeKey: _shapeKey,
    ...rest
  } = props

  const checkbox = selectionMode === 'checkbox'
  const state = reactive({
    options: toPrimeNodes(treeSelectNodesOf(props), fields),
  })
  if (loadMode === 'lazy' && loadRoots) {
    void Promise.resolve(loadRoots()).then((rows) => {
      state.options = toPrimeNodes((rows ?? []) as never[], fields)
    })
  }

  const ids = idsOf(props)
  const modelValue = checkbox ? checkboxKeys(ids) : (ids[0] ?? null)

  const slots: Record<string, unknown> = {}
  if (header) slots.header = header
  if (item) {
    slots.item = (slot: { node?: PrimeTreeNode }) =>
      item(slot.node?.data as never)
  }
  if (selected) {
    slots.value = () => selected([])
  }

  return h(
    TreeSelect,
    {
      ...rest,
      ...htmlAttributesOf(props),
      modelValue,
      options: state.options,
      placeholder,
      disabled,
      filter: allowFiltering !== false,
      showClear: showClear !== false,
      display: primeDisplay(selectedDisplay),
      selectionMode: checkbox ? 'checkbox' : 'single',
      metaKeySelection: false,
      scrollHeight:
        popupHeight != null ? String(popupHeight) : undefined,
      class: ['mmda-tree-select', props.class].flat(),
      onNodeExpand: (node: PrimeTreeNode) => {
        const src = node?.data
        if (src != null) void Promise.resolve(onExpand?.(src))
      },
      'onUpdate:modelValue': (next: unknown) => {
        if (checkbox) {
          emitValue(props, idsFromCheckboxKeys(next as PrimeCheckKeys))
          return
        }
        emitValue(props, next == null || next === '' ? [] : [String(next)])
      },
    },
    Object.keys(slots).length ? slots : undefined,
  )
}

export function createDropDownTree(props: UiTreeSelectProps) {
  return createTreeSelect(props)
}
