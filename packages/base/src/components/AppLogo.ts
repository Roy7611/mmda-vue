import { defineComponent, h, inject } from 'vue'
import { useRouter } from 'vue-router'
import { UI_BUILDER_KEY, type UiBuilder } from '@mmda/vui'
import { APP_NAME } from '../keys'

/** Brand mark only; L1 module title is shown by the Syncfusion systems chrome. */
export const AppLogo = defineComponent({
  name: 'AppLogo',
  setup() {
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder
    const router = useRouter()

    return () =>
      h(
        'div',
        {
          class: 'mmda-app-logo',
          role: 'app-logo',
          onClick: () => void router.push(`/${APP_NAME}`),
        },
        [
          builder.factory.image('/logo.png', {
            class: 'mmda-app-logo__img',
            alt: 'logo',
            preview: false,
          }),
        ],
      )
  },
})
