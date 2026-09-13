import { defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'

export const AppLogo = defineComponent({
  name: 'AppLogo',
  props: {
    src: { type: String, default: '/logo.png' },
    alt: { type: String, default: 'logo' },
    home: { type: String, default: '/BASE/' },
  },
  setup(props) {
    const router = useRouter()
    return () =>
      h(
        'div',
        {
          class: 'mmda-app-logo',
          role: 'app-logo',
          onClick: () => void router.push(props.home),
        },
        [
          // 原生 img 保宽高比；NImage 会强制盒尺寸导致压扁
          h('img', {
            class: 'mmda-app-logo__img',
            src: props.src,
            alt: props.alt,
            draggable: false,
          }),
        ],
      )
  },
})
