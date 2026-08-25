import { computed, defineComponent, h, inject, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Badge from 'primevue/badge'
import { useToast } from 'primevue/usetoast'
import { UI_APP_KEY, UI_BUILDER_KEY, type MmdaApplication } from '@mmda/vui'
import type { UiContext } from '@mmda/core'
import type { PrimeVueUiBuilder } from '@mmda/vui-primevue'
import { ChangePasswordForm } from './ChangePasswordForm'
import { APP_NAME } from '../keys'

export const AppUserFooter = defineComponent({
  name: 'AppUserFooter',
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication
    const builder = inject(UI_BUILDER_KEY)! as PrimeVueUiBuilder
    const router = useRouter()
    const route = useRoute()
    const toast = useToast()
    const userMenu = ref<InstanceType<typeof Menu>>()
    const password = reactive({ newPwd: '', newPwdAgain: '' })

    const username = computed(() => app.user?.username || '游客')
    const todoCount = computed(() => Number(app.context.todoCount ?? 0))

    const setDark = (dark: boolean) => {
      app.context.isDark = dark
      document.documentElement.classList.toggle('p-dark', dark)
      localStorage.setItem('isDark', JSON.stringify(dark))
    }

    const signOut = async () => {
      const redirect = route.fullPath
      await app.signOut()
      await router.replace({
        path: `/${APP_NAME}/Signin`,
        query: { redirect },
      })
    }

    const changePassword = () => {
      password.newPwd = ''
      password.newPwdAgain = ''
      void builder.confirmDialog(
        h(ChangePasswordForm, {
          onGetTepModel: (value: typeof password) => Object.assign(password, value),
        }),
        {} as UiContext,
        {
          title: '修改密码',
          width: 'min(90vw, 30rem)',
          accept: async () => {
            if (!password.newPwd) {
              toast.add({ severity: 'error', summary: '错误', detail: '请填写新密码', life: 3000 })
              return false
            }
            if (password.newPwd !== password.newPwdAgain) {
              toast.add({
                severity: 'error',
                summary: '错误',
                detail: '两次输入的密码不一致',
                life: 3000,
              })
              return false
            }
            try {
              await app.api.doAction(
                {
                  path: app.user.userId,
                  action: 'changePwd',
                  repository: 'Users',
                  service: 'base',
                },
                { payload: { newPwd: password.newPwd } },
              )
              toast.add({ severity: 'success', summary: '成功', detail: '修改密码成功', life: 2000 })
              await signOut()
              return true
            } catch (error) {
              toast.add({
                severity: 'error',
                summary: '错误',
                detail: error instanceof Error ? error.message : String(error),
                life: 3000,
              })
              return false
            }
          },
        },
      )
    }

    const menuItems = [
      {
        label: '修改密码',
        icon: 'pi pi-key',
        command: changePassword,
      },
      {
        separator: true,
      },
      {
        label: '注销',
        icon: 'pi pi-sign-out',
        command: () => void signOut(),
      },
    ]

    onMounted(() => {
      setDark(Boolean(app.context.isDark))
      void app.getTodoCount()
    })

    return () =>
      h('div', { class: 'mmda-user-footer' }, [
        h('i', { class: 'pi pi-user mmda-user-footer__avatar' }),
        h('span', { class: 'mmda-user-footer__name', title: username.value }, username.value),
        h('div', { class: 'mmda-user-footer__actions' }, [
          h(
            'span',
            {
              class: 'mmda-user-footer__todo',
              title: '待办提醒',
              onClick: () => void router.push(`/${APP_NAME}/Notifications`),
            },
            [
              h(Button, {
                icon: 'pi pi-bell',
                text: true,
                rounded: true,
                ariaLabel: '待办提醒',
              }),
              todoCount.value > 0
                ? h(Badge, {
                    value: todoCount.value > 99 ? '99+' : String(todoCount.value),
                    severity: 'danger',
                  })
                : null,
            ],
          ),
          h(Button, {
            icon: app.context.isDark ? 'pi pi-sun' : 'pi pi-moon',
            text: true,
            rounded: true,
            ariaLabel: '暗黑模式',
            title: app.context.isDark ? '切换到明亮模式' : '切换到暗黑模式',
            onClick: () => setDark(!app.context.isDark),
          }),
          h(Button, {
            icon: 'pi pi-ellipsis-v',
            text: true,
            rounded: true,
            ariaLabel: '用户操作',
            title: '用户操作',
            onClick: (event: Event) => userMenu.value?.toggle(event),
          }),
          h(Menu, {
            ref: userMenu,
            model: menuItems,
            popup: true,
          }),
        ]),
      ])
  },
})
