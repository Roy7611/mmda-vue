/** Naive NModal 无内置 resize；在对话框根节点挂东南角拖柄。 */

const HANDLE_ATTR = 'data-mmda-dialog-resize'
const MIN_W = 280
const MIN_H = 160

const cleanups = new WeakMap<HTMLElement, () => void>()

function parsePx(value: string | null | undefined, fallback: number) {
  const n = Number.parseFloat(String(value ?? ''))
  return Number.isFinite(n) ? n : fallback
}

export function detachDialogResize(el: HTMLElement | null | undefined) {
  if (!el) return
  cleanups.get(el)?.()
  cleanups.delete(el)
  el.querySelectorAll(`[${HANDLE_ATTR}]`).forEach(node => node.remove())
}

export function attachDialogResize(
  el: HTMLElement,
  options?: { minWidth?: number; minHeight?: number },
) {
  detachDialogResize(el)
  const minW = options?.minWidth ?? MIN_W
  const minH = options?.minHeight ?? MIN_H

  const handle = document.createElement('div')
  handle.setAttribute(HANDLE_ATTR, 'se')
  handle.className = 'mmda-dialog__resize-handle mmda-dialog__resize-handle--se'
  handle.title = 'Resize'
  el.style.position = el.style.position || 'relative'
  el.appendChild(handle)

  let startX = 0
  let startY = 0
  let startW = 0
  let startH = 0

  const onMove = (event: PointerEvent) => {
    const nextW = Math.max(minW, startW + (event.clientX - startX))
    const nextH = Math.max(minH, startH + (event.clientY - startY))
    el.style.width = `${nextW}px`
    el.style.height = `${nextH}px`
    el.style.maxWidth = 'none'
  }

  const onUp = (event: PointerEvent) => {
    handle.releasePointerCapture(event.pointerId)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  const onDown = (event: PointerEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const rect = el.getBoundingClientRect()
    startX = event.clientX
    startY = event.clientY
    startW = rect.width
    startH = rect.height
    // 拖动前先钉死像素尺寸，避免 % / min() 宽度在 resize 时回弹
    el.style.width = `${startW}px`
    el.style.height = `${startH}px`
    el.style.maxWidth = 'none'
    handle.setPointerCapture(event.pointerId)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  handle.addEventListener('pointerdown', onDown)

  // 初始高度：若只有 minHeight，给一个可拖的起点
  if (!el.style.height) {
    const h = parsePx(getComputedStyle(el).height, 0)
    if (h > 0) el.style.height = `${Math.max(h, minH)}px`
  }

  cleanups.set(el, () => {
    handle.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    handle.remove()
  })
}

/** 刚打开的对话框通常是最后一个 `.n-dialog.mmda-dialog`。 */
export function findTopNaiveDialog(): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(
    '.n-dialog.mmda-dialog, .n-modal.mmda-dialog, .n-card.mmda-dialog',
  )
  return nodes.length ? nodes[nodes.length - 1]! : null
}
