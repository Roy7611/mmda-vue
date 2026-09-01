import { UI_APP_KEY, type MmdaApplication } from '@mmda/vui'
import { defineComponent, h, inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** Root-level sign-out: clear session, then land on `/Signin`. */
export const SignoutView = defineComponent({
  name: 'SignoutView',
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication
    const router = useRouter()
    const route = useRoute()
    onMounted(async () => {
      await app.signOut()
      await router.replace({
        path: '/Signin',
        query: { redirect: String(route.query.redirect ?? '/BASE/') },
      })
    })
    return () => h('div', { class: 'mmda-signout' })
  },
})
