import { isObject } from '@mmda/core'
import type { ExtractPropTypes, PropType, Slot, VNode } from 'vue'

export type SigninMode = 'password' | 'sms' | 'qrCode' | 'thirdParty'

export interface SigninUser {
  signinMode: SigninMode
  username: string
  password: string
  agreed: boolean
}

export const signinFormProps = {
  mode: String as PropType<SigninMode>,
  context: Object as any,
}

export interface SigninFormSlots {
  [name: string]: unknown
  header?: Slot
  title?: Slot
  bottomNav?: Slot
  thirdParty?: Slot
}

export const signinFormEmits = {
  signin: (user: SigninUser) => isObject(user),
  changeMode: () => true,
  sendVCode: (mobile: string) => typeof mobile === 'string',
  getQrCode: () => true,
}

export type SigninFormEmits = typeof signinFormEmits

/**
 * 登录表单对外类型：`signinFormProps` 声明字段 + emit 对应的 onXxx listener。
 * 组件 `defineComponent({ props: signinFormProps })` 只吃声明字段；
 * `buildSigninForm` / `h()` 可同时带 `onSignin` 等 listener。
 */
export type SigninFormProps = ExtractPropTypes<typeof signinFormProps> & {
  onSignin?: (user: SigninUser) => void | Promise<void>
  onChangeMode?: () => void
  onSendVCode?: (mobile: string) => void
  onGetQrCode?: () => void
}

export interface SignupUser {
  mobile: string
  username?: string
  password: string
  vcode: string
  agreed: boolean
}

export const signupFormProps = {
  toSignin: { type: String, default: '/signin' },
}

export interface SignupFormSlots {
  header?: () => VNode[]
  footer?: () => VNode[]
}

export const signupFormEmits = {
  signup: (user: SignupUser) => isObject(user),
}

export type SignupCardEmits = typeof signupFormEmits

/** 注册表单对外类型：声明 props + `onSignup` listener。 */
export type SignupFormProps = ExtractPropTypes<typeof signupFormProps> & {
  onSignup?: (user: SignupUser) => void | Promise<void>
}
