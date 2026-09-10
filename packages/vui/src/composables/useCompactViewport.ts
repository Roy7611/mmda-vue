import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/** 平板竖屏 / 窄桌面常见宽度；更宽时走 Dock / 双栏。 */
export const COMPACT_VIEWPORT_MEDIA = '(max-width: 1024px)'

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
