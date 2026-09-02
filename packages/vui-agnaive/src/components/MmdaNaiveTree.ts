import { computed, defineComponent, h, ref, watch, type PropType } from 'vue'
import { NDropdown, NInput, NTree, type TreeOption } from 'naive-ui'
import {
  createIconVNode,
  mapTreeNodes,
  selectedIdSet,
  type UiTreeEmits,
  type UiTreeFields,
  type UiTreeMappedNode,
  type UiTreeProps,
} from '@mmda/vui'

type TreeProps = UiTreeProps & UiTreeEmits

export const MmdaNaiveTree = defineComponent({
  name: 'MmdaNaiveTree',
  props: {
    data: { type: Array as PropType<unknown[]>, required: true },
    fields: { type: Object as PropType<UiTreeFields>, default: undefined },
    selectionMode: {
      type: String as PropType<UiTreeProps['selectionMode']>,
      default: 'single',
    },
    selected: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },
    showIcon: { type: Boolean, default: false },
    class: { type: String, default: '' },
    onNodeSelect: {
      type: Function as PropType<UiTreeEmits['onNodeSelect']>,
      default: undefined,
    },
    onExpand: {
      type: Function as PropType<UiTreeEmits['onExpand']>,
      default: undefined,
    },
    editing: { type: String, default: '' },
    contextMenu: {
      type: Function as PropType<UiTreeProps['contextMenu']>,
      default: undefined,
    },
    showHoverAdd: {
      type: [Boolean, Function] as PropType<UiTreeProps['showHoverAdd']>,
      default: undefined,
    },
    onNodeAddChild: {
      type: Function as PropType<UiTreeEmits['onNodeAddChild']>,
      default: undefined,
    },
    onNodeContextMenu: {
      type: Function as PropType<UiTreeEmits['onNodeContextMenu']>,
      default: undefined,
    },
    onNodeRename: {
      type: Function as PropType<UiTreeEmits['onNodeRename']>,
      default: undefined,
    },
  },
  setup(props: TreeProps) {
    const roots = computed(() => mapTreeNodes(props.data ?? [], props.fields))
    const options = computed(() => roots.value.map((node) => toOption(node, props.showIcon)))
    const byId = computed(() => indexMapped(roots.value))
    const keys = computed(() => [...selectedIdSet(props.selected)])
    const checkable = computed(() => (props.selectionMode ?? 'single') === 'checkbox')

    const menuShow = ref(false)
    const menuX = ref(0)
    const menuY = ref(0)
    const menuOptions = ref<any[]>([])
    const pending = ref<Record<string, () => void>>({})
    const hoverKey = ref('')
    const localEditing = ref('')
    const draft = ref('')
    const closing = ref(false)
    const suppressSelect = ref(false)

    watch(
      () => props.editing,
      (id) => {
        closing.value = false
        localEditing.value = id ?? ''
        if (id) draft.value = byId.value.get(String(id))?.label ?? ''
      },
    )

    const editingId = computed(() => localEditing.value || props.editing || '')

    const canRename = (src?: unknown) =>
      Boolean(props.onNodeRename) &&
      src != null &&
      (src as { editable?: boolean }).editable !== false

    const startEdit = (id: string, src?: unknown) => {
      if (!canRename(src ?? byId.value.get(id)?.src)) return
      closing.value = false
      localEditing.value = id
      draft.value = byId.value.get(id)?.label ?? ''
    }

    const finishEdit = (option: TreeOption, text: string | undefined, save: boolean) => {
      if (closing.value) return
      closing.value = true
      const src = option.key != null ? byId.value.get(String(option.key))?.src : undefined
      localEditing.value = ''
      if (src == null) return
      props.onNodeRename?.(src, save ? String(text ?? draft.value) : String(option.label ?? ''))
    }

    const emitKeys = (next: Array<string | number>) => {
      if (suppressSelect.value) {
        suppressSelect.value = false
        return
      }
      const nodes = next
        .map((key) => byId.value.get(String(key))?.src)
        .filter((node) => node != null)
      if (checkable.value) props.onNodeSelect?.(nodes)
      else if (nodes[0] != null) props.onNodeSelect?.(nodes[0])
    }

    const openContextMenu = (event: MouseEvent, option: TreeOption) => {
      event.preventDefault()
      suppressSelect.value = true
      const src = option.key != null ? byId.value.get(String(option.key))?.src : undefined
      if (src == null || !props.contextMenu) return
      const actions = props.contextMenu(src) ?? []
      if (!actions.length) return
      const next: Record<string, () => void> = {}
      menuOptions.value = actions.map((action, index) => {
        if (action.divider) return { type: 'divider', key: `d-${index}` }
        const key = String(action.name ?? action.label ?? index)
        next[key] = () => {
          void action.onAction?.()
        }
        return {
          label: action.label,
          key,
          icon: action.icon ? () => createIconVNode(action.icon as string) : undefined,
        }
      })
      pending.value = next
      menuX.value = event.clientX
      menuY.value = event.clientY
      menuShow.value = true
    }

    return () =>
      h('div', { class: 'mmda-agnaive-tree-host' }, [
        h(NDropdown, {
          trigger: 'manual',
          show: menuShow.value,
          x: menuX.value,
          y: menuY.value,
          options: menuOptions.value,
          onClickoutside: () => {
            menuShow.value = false
          },
          onSelect: (key: string) => {
            pending.value[key]?.()
            menuShow.value = false
          },
        }),
        h(NTree, {
          class: ['mmda-agnaive-tree', props.class].filter(Boolean).join(' '),
          data: options.value,
          checkable: checkable.value,
          selectable: (props.selectionMode ?? 'single') !== 'none',
          selectedKeys: checkable.value ? undefined : keys.value,
          checkedKeys: checkable.value ? keys.value : undefined,
          'onUpdate:selectedKeys': (next: Array<string | number>) => {
            if (!checkable.value) emitKeys(next)
          },
          'onUpdate:checkedKeys': (next: Array<string | number>) => {
            if (checkable.value) emitKeys(next)
          },
          'onUpdate:expandedKeys': (
            _keys: Array<string | number>,
            option?: TreeOption,
            meta?: { action?: string },
          ) => {
            if (meta?.action !== 'expand' || option?.key == null) return
            const src = byId.value.get(String(option.key))?.src
            if (src != null) void props.onExpand?.(src)
          },
          nodeProps: ({ option }: { option: TreeOption }) => ({
            onContextmenu: (event: MouseEvent) => openContextMenu(event, option),
            onDblclick: (event: MouseEvent) => {
              event.preventDefault()
              startEdit(String(option.key ?? ''), byId.value.get(String(option.key))?.src)
            },
            onKeydown: (event: KeyboardEvent) => {
              if (event.key === 'F2' && !editingId.value) {
                event.preventDefault()
                startEdit(String(option.key ?? ''), byId.value.get(String(option.key))?.src)
              }
            },
          }),
          renderLabel: ({ option }: { option: TreeOption }) => {
            if (editingId.value && String(option.key) === String(editingId.value)) {
              return h(NInput, {
                class: 'mmda-tree-rename-input',
                value: draft.value,
                size: 'small',
                autofocus: true,
                onUpdateValue: (value: string) => {
                  draft.value = value
                },
                onKeydown: (event: KeyboardEvent) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    finishEdit(option, draft.value, true)
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    finishEdit(option, String(option.label ?? ''), false)
                  }
                },
                onBlur: () => finishEdit(option, draft.value, true),
              })
            }
            const src = byId.value.get(String(option.key))?.src
            const canAdd =
              src != null &&
              Boolean(props.onNodeAddChild) &&
              props.showHoverAdd !== false &&
              (typeof props.showHoverAdd === 'function' ? props.showHoverAdd(src) : true)
            return h(
              'span',
              {
                onMouseenter: () => {
                  hoverKey.value = canAdd ? String(option.key) : ''
                },
                onMouseleave: () => {
                  hoverKey.value = ''
                },
              },
              [
                option.label,
                canAdd && hoverKey.value === String(option.key)
                  ? h(
                      'button',
                      {
                        type: 'button',
                        class: 'mmda-tree-hover-add',
                        onClick: (event: Event) => {
                          event.stopPropagation()
                          if (src != null) props.onNodeAddChild?.(src)
                        },
                      },
                      '+',
                    )
                  : null,
              ],
            )
          },
        }),
      ])
  },
})

function toOption(node: UiTreeMappedNode, showIcon?: boolean): TreeOption {
  return {
    key: node.id,
    label: node.label,
    isLeaf: !node.hasChildren,
    prefix: showIcon && node.icon ? () => createIconVNode(node.icon as string) : undefined,
    children: node.children.length ? node.children.map((child) => toOption(child, showIcon)) : undefined,
  }
}

function indexMapped<T>(
  nodes: UiTreeMappedNode<T>[],
): Map<string, UiTreeMappedNode<T>> {
  const map = new Map<string, UiTreeMappedNode<T>>()
  const walk = (items: UiTreeMappedNode<T>[]) => {
    for (const node of items) {
      map.set(node.id, node)
      if (node.children.length) walk(node.children)
    }
  }
  walk(nodes)
  return map
}
