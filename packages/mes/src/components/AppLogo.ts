import { defineComponent, h, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { UI_BUILDER_KEY, type UiBuilder } from '@mmda/vui'
import { APP_NAME } from '../keys'

export const AppLogo = defineComponent({
  name: 'AppLogo',
  setup() {
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder
    const router = useRouter()
    const { t } = useI18n()

    return () =>
      h(
        'div',
        {
          class: 'mmda-app-logo',
          role: 'app-logo',
          onClick: () => void router.push(`/${APP_NAME}`),
        },
        [
          builder.factory.image('/logo.svg', {
            class: 'mmda-app-logo__img',
            alt: 'logo',
            preview: false,
          }),
          h('span', { class: 'mmda-app-logo__title' }, t('mes')),
        ],
      )
  },
})
