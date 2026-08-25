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
  onChangeMode: Function as PropType<() => void>,
  onSendVCode: Function as PropType<(mobile: string) => void>,
  onGetQrCode: Function as PropType<() => void>,
  onSubmit: Function as PropType<(user: SigninUser, callbackFn?: Function) => void>,
  context: Object as any,
}

export interface SigninFormSlots {
  [name: string]: unknown
  header?: Slot
  title?: Slot
  bottomNav?: Slot
  thirdParty?: Slot
}

export type SigninFormProps = ExtractPropTypes<typeof signinFormProps>

export const signinFormEmits = {
  submit: (user: SigninUser) => isObject(user),
  play: () => true,
}

export type SigninFormEmits = ExtractPropTypes<typeof signinFormEmits>

export interface SignupUser {
  mobile: string
  username?: string
  password: string
  vcode: string
  agreed: boolean
}

export const signupFormProps = {
  toSignin: { type: String, default: '/signin' },
  onSubmit: Function as PropType<(user: SignupUser) => void>,
}

export type SignupFormProps = ExtractPropTypes<typeof signupFormProps>

export interface SignupFormSlots {
  header?: () => VNode[]
  footer?: () => VNode[]
}

export const signupFormEmits = {
  signup: (user: SignupUser) => isObject(user),
}

export type SignupCardEmits = ExtractPropTypes<typeof signupFormEmits>
