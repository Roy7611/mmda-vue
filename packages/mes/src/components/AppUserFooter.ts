import { computed, defineComponent, h, inject, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ColorPalettePicker,
  UI_APP_KEY,
  UI_BUILDER_KEY,
  writeMmdaPref,
  type MmdaApplication,
  type UiBuilder,
} from '@mmda/vui'
import type { UiContext } from '@mmda/core'
import { ChangePasswordForm } from './ChangePasswordForm'
import { APP_NAME } from '../keys'

export const AppUserFooter = defineComponent({
  name: 'AppUserFooter',
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder
    const router = useRouter()
    const route = useRoute()
    const password = reactive({ newPwd: '', newPwdAgain: '' })

    const username = computed(() => app.user?.username || '游客')
    const todoCount = computed(() => Number(app.context.todoCount ?? 0))
    const icon = (name: string) => builder.factory.resolveIcon(name)

    const toast = (
      severity: string,
      summary: string,
      detail: string,
      life = 3000,
    ) => void app.toast({} as any, { severity, summary, detail, life })

    const setDark = (dark: boolean) => {
      app.context.isDark = dark
      builder.setColorScheme(dark)
      writeMmdaPref('isDark', JSON.stringify(dark))
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
              toast('error', '错误', '请填写新密码')
              return false
            }
            if (password.newPwd !== password.newPwdAgain) {
              toast('error', '错误', '两次输入的密码不一致')
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
              toast('success', '成功', '修改密码成功', 2000)
              await signOut()
              return true
            } catch (error) {
              toast(
                'error',
                '错误',
                error instanceof Error ? error.message : String(error),
              )
              return false
            }
          },
        },
      )
    }

    onMounted(() => {
      setDark(Boolean(app.context.isDark))
      void app.getTodoCount()
    })

    return () =>
      h('div', { class: 'mmda-user-footer' }, [
        h('span', { class: 'mmda-user-footer__avatar' }, [
          builder.factory.icon('fas fa-user'),
        ]),
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
              builder.factory.button({
                icon: icon('fas fa-bell'),
                class: 'mmda-user-footer__button',
                buttonType: 'text',
                shape: 'circle',
                tooltip: '待办提醒',
              }),
              todoCount.value > 0
                ? builder.factory.badge({
                    value: todoCount.value > 99 ? '99+' : String(todoCount.value),
                    severity: 'danger',
                    class: 'mmda-user-footer__badge',
                  })
                : null,
            ],
          ),
          builder.factory.button({
            icon: icon(app.context.isDark ? 'fas fa-sun' : 'fas fa-moon'),
            class: 'mmda-user-footer__button',
            buttonType: 'text',
            shape: 'circle',
            tooltip: app.context.isDark ? '切换到明亮模式' : '切换到暗黑模式',
            onClick: () => setDark(!app.context.isDark),
          }),
          h(ColorPalettePicker),
          builder.factory.menuButton(
            {
              icon: icon('more'),
              class: 'mmda-user-footer__button',
              buttonType: 'text',
              shape: 'circle',
              hideCaret: true,
              popupPlacement: 'top-end',
              tooltip: '用户操作',
            },
            [
              {
                name: 'changePassword',
                label: '修改密码',
                icon: icon('fas fa-key'),
                onAction: changePassword,
              },
              {
                name: 'signOut',
                label: '注销',
                icon: icon('fas fa-sign-out-alt'),
                onAction: () => void signOut(),
              },
            ],
          ),
        ]),
      ])
  },
})
