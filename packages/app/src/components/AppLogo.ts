import { defineComponent, h, inject } from 'vue'
import { useRouter } from 'vue-router'
import { UI_BUILDER_KEY, type UiBuilder } from '@mmda/vui'

export const AppLogo = defineComponent({
  name: 'AppLogo',
  props: {
    src: { type: String, default: '/logo.png' },
    alt: { type: String, default: 'logo' },
    home: { type: String, default: '/BASE/' },
  },
  setup(props) {
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder
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
          builder.factory.image(props.src, {
            class: 'mmda-app-logo__img',
            alt: props.alt,
            preview: false,
          }),
        ],
      )
  },
})
