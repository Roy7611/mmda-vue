import { defineComponent, h, reactive } from 'vue'

export const ChangePasswordForm = defineComponent({
  name: 'ChangePasswordForm',
  emits: ['getTepModel'],
  setup(_props, { emit }) {
    const data = reactive({
      userID: '',
      newPwd: '',
      newPwdAgain: '',
    })
    const emitModel = () => emit('getTepModel', data)
    return () =>
      h('div', { class: 'mmda-change-password', style: { display: 'grid', gap: '12px' } }, [
        h('label', [
          '新密码',
          h('input', {
            type: 'password',
            autocomplete: 'new-password',
            onInput: (event: Event) => {
              data.newPwd = (event.target as HTMLInputElement).value
              emitModel()
            },
          }),
        ]),
        h('label', [
          '确认密码',
          h('input', {
            type: 'password',
            autocomplete: 'new-password',
            onInput: (event: Event) => {
              data.newPwdAgain = (event.target as HTMLInputElement).value
              emitModel()
            },
          }),
        ]),
      ])
  },
})

export const changeUsePwd = ChangePasswordForm
