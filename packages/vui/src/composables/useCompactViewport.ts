import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/** PAD 竖屏常见宽度；横屏 / 桌面通常更宽。 */
export const COMPACT_VIEWPORT_MEDIA = '(max-width: 800px)'

export function useCompactViewport(
  query = COMPACT_VIEWPORT_MEDIA,
): Ref<boolean> {
  const compact = ref(false)
  onMounted(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const mql = window.matchMedia(query)
    const sync = () => {
      compact.value = mql.matches
    }
    sync()
    mql.addEventListener('change', sync)
    onUnmounted(() => mql.removeEventListener('change', sync))
  })
  return compact
}
