import { defineComponent, h, reactive } from 'vue'

export const ChangePasswordForm = defineComponent({
  name: 'ChangePasswordForm',
  emits: ['change'],
  setup(_props, { emit }) {
    const data = reactive({ newPwd: '', newPwdAgain: '' })
    const input = (label: string, key: 'newPwd' | 'newPwdAgain') =>
      h('label', [
        label,
        h('input', {
          type: 'password',
          autocomplete: 'new-password',
          onInput: (event: Event) => {
            data[key] = (event.target as HTMLInputElement).value
            emit('change', data)
          },
        }),
      ])
    return () =>
      h(
        'div',
        {
          class: 'mmda-change-password',
          style: { display: 'grid', gap: '12px' },
        },
        [input('新密码', 'newPwd'), input('确认密码', 'newPwdAgain')],
      )
  },
})
