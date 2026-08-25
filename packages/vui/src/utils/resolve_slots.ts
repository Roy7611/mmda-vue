import {
  Comment,
  Fragment,
  isVNode,
  type Slot,
  type VNodeArrayChildren,
  type VNodeChild,
} from 'vue'

function ensureValidVNode(
  children: VNodeArrayChildren,
): VNodeArrayChildren | null {
  return children.some(child => {
    if (!isVNode(child)) return true
    if (child.type === Comment) return false
    if (
      child.type === Fragment &&
      !ensureValidVNode(child.children as VNodeArrayChildren)
    ) {
      return false
    }
    return true
  })
    ? children
    : null
}

export function resolveSlot(
  slot: Slot | undefined,
  fallback: () => VNodeArrayChildren,
): VNodeArrayChildren {
  return (slot && ensureValidVNode(slot())) || fallback()
}

export function resolveSlotWithProps<T>(
  slot: Slot | undefined,
  props: T,
  fallback: (props: T) => VNodeArrayChildren,
): VNodeArrayChildren {
  return (slot && ensureValidVNode(slot(props))) || fallback(props)
}

export function resolveWrappedSlot(
  slot: Slot | undefined,
  wrapper: (children: VNodeArrayChildren | null) => VNodeChild,
): VNodeChild {
  return wrapper((slot && ensureValidVNode(slot())) || null)
}

export function resolveWrappedSlotWithProps<T>(
  slot: Slot | undefined,
  props: T,
  wrapper: (children: VNodeArrayChildren | null) => VNodeChild,
): VNodeChild {
  return wrapper((slot && ensureValidVNode(slot(props))) || null)
}

export function isSlotEmpty(slot: Slot | undefined): boolean {
  return !(slot && ensureValidVNode(slot()))
}
