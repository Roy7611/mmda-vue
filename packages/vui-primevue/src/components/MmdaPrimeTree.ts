import { computed, defineComponent, h, ref, watch, type PropType } from 'vue'
import Tree from 'primevue/tree'
import ContextMenu from 'primevue/contextmenu'
import InputText from 'primevue/inputtext'
import {
  mapTreeNodes,
  selectedIdSet,
  type UiTreeEmits,
  type UiTreeFields,
  type UiTreeMappedNode,
  type UiTreeProps,
} from '@mmda/vui'

type TreeProps = UiTreeProps & UiTreeEmits

interface PrimeTreeNode {
  key: string
  label: string
  icon?: string
  children?: PrimeTreeNode[]
  data: unknown
}

export const MmdaPrimeTree = defineComponent({
  name: 'MmdaPrimeTree',
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
    const nodes = computed(() => roots.value.map((node) => toPrime(node, props.showIcon)))
    const byId = computed(() => indexMapped(roots.value))
    const selection = computed(() => {
      const keys: Record<string, boolean> = {}
      for (const id of selectedIdSet(props.selected)) keys[id] = true
      return keys
    })
    const mode = computed(() =>
      (props.selectionMode ?? 'single') === 'checkbox' ? 'checkbox' : 'single',
    )

    const menuRef = ref<any>()
    const menuModel = ref<any[]>([])
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

    const finishEdit = (node: PrimeTreeNode, text: string | undefined, save: boolean) => {
      if (closing.value) return
      closing.value = true
      const src = byId.value.get(String(node.key))?.src
      localEditing.value = ''
      if (src == null) return
      props.onNodeRename?.(src, save ? String(text ?? draft.value) : node.label)
    }

    const emitSelection = (value: Record<string, boolean> | string | null) => {
      if (suppressSelect.value) {
        suppressSelect.value = false
        return
      }
      if (mode.value === 'checkbox') {
        const ids = Object.keys(value ?? {}).filter((key) => (value as Record<string, boolean>)[key])
        props.onNodeSelect?.(
          ids.map((id) => byId.value.get(id)?.src).filter((node) => node != null),
        )
        return
      }
      const id = typeof value === 'string' ? value : Object.keys(value ?? {})[0]
      const node = id ? byId.value.get(id)?.src : undefined
      if (node != null) props.onNodeSelect?.(node)
    }

    const openContextMenu = (event: MouseEvent, node: PrimeTreeNode) => {
      event.preventDefault()
      event.stopPropagation()
      suppressSelect.value = true
      const src = byId.value.get(String(node.key))?.src
      if (src == null || !props.contextMenu) return
      const actions = props.contextMenu(src) ?? []
      if (!actions.length) return
      menuModel.value = actions.map((action) =>
        action.divider
          ? { separator: true }
          : {
              label: action.label,
              icon: action.icon,
              command: () => action.onAction?.(),
            },
      )
      menuRef.value?.show(event)
    }

    return () =>
      h(
        'div',
        {
          class: 'mmda-prime-tree-host',
          onKeydown: (event: KeyboardEvent) => {
            if (event.key !== 'F2' || editingId.value) return
            const id = [...selectedIdSet(props.selected)][0]
            if (id) startEdit(id)
          },
        },
        [
          h(
            Tree,
            {
              value: nodes.value,
              selectionMode: props.selectionMode === 'none' ? undefined : mode.value,
              selectionKeys: props.selectionMode === 'none' ? undefined : selection.value,
              class: ['mmda-prime-tree', props.class].filter(Boolean).join(' '),
              'onUpdate:selectionKeys': emitSelection,
              onNodeExpand: (node: PrimeTreeNode) => {
                const src = byId.value.get(String(node.key))?.src
                if (src != null) void props.onExpand?.(src)
              },
            },
            {
              default: ({ node }: { node: PrimeTreeNode }) => {
                if (editingId.value && String(node.key) === String(editingId.value)) {
                  return h(InputText, {
                    class: 'mmda-tree-rename-input',
                    modelValue: draft.value,
                    'onUpdate:modelValue': (value: string) => {
                      draft.value = value
                    },
                    onVnodeMounted: (vnode) =>
                      (vnode.el as HTMLInputElement | null)?.focus?.() ??
                      (vnode.el as HTMLElement | null)
                        ?.querySelector?.('input')
                        ?.focus(),
                    onKeydown: (event: KeyboardEvent) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        finishEdit(node, draft.value, true)
                      } else if (event.key === 'Escape') {
                        event.preventDefault()
                        finishEdit(node, node.label, false)
                      }
                    },
                    onBlur: () => finishEdit(node, draft.value, true),
                  })
                }
                const src = byId.value.get(String(node.key))?.src
                const canAdd =
                  src != null &&
                  Boolean(props.onNodeAddChild) &&
                  props.showHoverAdd !== false &&
                  (typeof props.showHoverAdd === 'function'
                    ? props.showHoverAdd(src)
                    : true)
                return h(
                  'span',
                  {
                    class: 'mmda-prime-tree-label',
                    onDblclick: (event: MouseEvent) => {
                      event.preventDefault()
                      event.stopPropagation()
                      startEdit(String(node.key), src)
                    },
                    onContextmenu: (event: MouseEvent) => openContextMenu(event, node),
                    onMouseenter: () => {
                      hoverKey.value = canAdd ? String(node.key) : ''
                    },
                    onMouseleave: () => {
                      hoverKey.value = ''
                    },
                  },
                  [
                    node.label,
                    canAdd && hoverKey.value === String(node.key)
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
            },
          ),
          props.contextMenu
            ? h(ContextMenu, { ref: menuRef, model: menuModel.value })
            : null,
        ],
      )
  },
})

function toPrime(node: UiTreeMappedNode, showIcon?: boolean): PrimeTreeNode {
  return {
    key: node.id,
    label: node.label,
    icon: showIcon ? node.icon : undefined,
    data: node.src,
    children: node.children.map((child) => toPrime(child, showIcon)),
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
