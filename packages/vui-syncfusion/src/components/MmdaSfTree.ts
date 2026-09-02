import { computed, defineComponent, h, nextTick, ref, watch, type PropType } from 'vue'
import { ContextMenuComponent, TreeViewComponent } from '@syncfusion/ej2-vue-navigations'
import {
  isTreeIconUrl,
  mapTreeNodes,
  selectedIdSet,
  type UiAction,
  type UiTreeEmits,
  type UiTreeFields,
  type UiTreeMappedNode,
  type UiTreeProps,
} from '@mmda/vui'

type TreeProps = UiTreeProps & UiTreeEmits

export const MmdaSfTree = defineComponent({
  name: 'MmdaSfTree',
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
    const byId = computed(() => indexMapped(roots.value))
    const selectedNodes = computed(() => [...selectedIdSet(props.selected)])
    const menuRef = ref<any>()
    const menuItems = ref<any[]>([])
    const pending = ref<UiAction[]>([])
    const hover = ref<{ id: string; x: number; y: number } | null>(null)

    const fields = computed(() => ({
      dataSource: flattenMapped(roots.value).map((node) => {
        const icon = node.icon ?? ''
        const url = isTreeIconUrl(icon)
        return {
          ...node,
          icon: url ? undefined : icon,
          imageUrl: url ? icon : undefined,
        }
      }),
      id: 'id',
      text: 'label',
      parentID: 'parentId',
      hasChildren: 'hasChildren',
      iconCss: props.showIcon ? 'icon' : undefined,
      imageUrl: props.showIcon ? 'imageUrl' : undefined,
    }))

    const emitSelect = (ids: string[]) => {
      const nodes = ids
        .map((id) => byId.value.get(id)?.src)
        .filter((node) => node != null)
      const mode = props.selectionMode ?? 'single'
      if (mode === 'checkbox') props.onNodeSelect?.(nodes)
      else if (nodes[0] != null) props.onNodeSelect?.(nodes[0])
    }

    const treeRef = ref<any>()
    watch(
      () => props.editing,
      (id) => {
        if (!id) return
        void nextTick(() => {
          const inst = treeRef.value?.ej2Instances ?? treeRef.value
          inst?.beginEdit?.(id)
        })
      },
    )

    const nodeFromEvent = (event: MouseEvent) => {
      const item = (event.target as HTMLElement | null)?.closest('.e-list-item')
      if (!item) return undefined
      const id = String(item.getAttribute('data-uid') ?? '')
      const text = item.querySelector('.e-list-text')?.textContent?.trim()
      return (
        byId.value.get(id) ??
        [...byId.value.values()].find((mapped) => mapped.label === text)
      )
    }

    const openContextMenu = (event: MouseEvent) => {
      event.preventDefault()
      const node = nodeFromEvent(event)
      if (!node || !props.contextMenu) return
      const actions = props.contextMenu(node.src) ?? []
      if (!actions.length) return
      pending.value = actions
      menuItems.value = actions.map((action) =>
        action.divider
          ? { separator: true }
          : {
              id: action.name,
              text: action.label,
              iconCss: action.icon,
            },
      )
      void nextTick(() => {
        const inst = menuRef.value?.ej2Instances ?? menuRef.value
        inst?.open(event.pageY, event.pageX)
      })
    }

    const canHoverAdd = (node?: UiTreeMappedNode) => {
      if (!node || !props.onNodeAddChild || props.showHoverAdd === false) return false
      return typeof props.showHoverAdd === 'function'
        ? props.showHoverAdd(node.src)
        : true
    }

    return () =>
      h(
        'div',
        {
          class: ['mmda-sf-tree-host', props.class].filter(Boolean).join(' '),
          onContextmenuCapture: openContextMenu,
          onMousemove: (event: MouseEvent) => {
            const node = nodeFromEvent(event)
            const item = (event.target as HTMLElement | null)?.closest('.e-list-item')
            if (!node || !item || !canHoverAdd(node)) {
              hover.value = null
              return
            }
            const rect = item.getBoundingClientRect()
            hover.value = {
              id: node.id,
              x: rect.right - 28,
              y: rect.top + Math.max(0, (rect.height - 24) / 2),
            }
          },
          onMouseleave: () => {
            hover.value = null
          },
        },
        [
          h(TreeViewComponent as any, {
            ref: treeRef,
            cssClass: ['mmda-sf-tree', props.class].filter(Boolean).join(' '),
            fields: fields.value,
            showCheckBox: (props.selectionMode ?? 'single') === 'checkbox',
            selectedNodes: selectedNodes.value,
            allowEditing: Boolean(props.onNodeRename),
            nodeSelecting: (args: any) => {
              const ev = args?.event as MouseEvent | undefined
              if (ev && (ev.button === 2 || ev.which === 3)) args.cancel = true
            },
            nodeSelected: (args: any) => {
              const ev = args?.event as MouseEvent | undefined
              if (ev && (ev.button === 2 || ev.which === 3)) return
              const id = String(args?.nodeData?.id ?? args?.id ?? '')
              if (id) emitSelect([id])
            },
            nodeChecked: (args: any) => {
              const ids = (args?.data ?? [])
                .map((item: any) => String(item.id ?? item.nodeData?.id ?? ''))
                .filter(Boolean)
              emitSelect(ids)
            },
            nodeExpanded: (args: any) => {
              const id = String(args?.nodeData?.id ?? args?.id ?? '')
              const node = byId.value.get(id)
              if (node) void props.onExpand?.(node.src)
            },
            nodeEditing: (args: any) => {
              if (!props.onNodeRename) {
                args.cancel = true
                return
              }
              const id = String(args?.nodeData?.id ?? '')
              const node = byId.value.get(id)
              if ((node?.src as { editable?: boolean } | undefined)?.editable === false) {
                args.cancel = true
              }
            },
            nodeEdited: (args: any) => {
              const id = String(args?.nodeData?.id ?? '')
              const node = byId.value.get(id)
              const text = String(args?.newText ?? '')
              if (node) props.onNodeRename?.(node.src, text)
            },
          }),
          props.contextMenu
            ? h(ContextMenuComponent as any, {
                ref: menuRef,
                items: menuItems.value,
                select: (args: any) => {
                  const id = String(args?.item?.id ?? '')
                  const action = pending.value.find(
                    (item) => item.name === id || item.label === args?.item?.text,
                  )
                  void action?.onAction?.()
                },
              })
            : null,
          hover.value
            ? h(
                'button',
                {
                  type: 'button',
                  class: 'e-btn e-flat e-small e-round mmda-tree-hover-add',
                  style: {
                    position: 'fixed',
                    left: `${hover.value.x}px`,
                    top: `${hover.value.y}px`,
                    zIndex: 20,
                  },
                  onClick: (event: Event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    const node = byId.value.get(hover.value?.id ?? '')
                    hover.value = null
                    if (node) props.onNodeAddChild?.(node.src)
                  },
                },
                '+',
              )
            : null,
        ],
      )
  },
})

function flattenMapped<T>(nodes: UiTreeMappedNode<T>[]): UiTreeMappedNode<T>[] {
  const list: UiTreeMappedNode<T>[] = []
  const walk = (items: UiTreeMappedNode<T>[], parentId?: string) => {
    for (const node of items) {
      list.push({
        ...node,
        parentId: parentId || undefined,
        children: [],
      })
      if (node.children.length) walk(node.children, node.id)
    }
  }
  walk(nodes)
  return list
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
