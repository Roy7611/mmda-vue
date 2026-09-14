import { isObject } from '@mmda/core'
import { getCurrentInstance, type ExtractPropTypes, type PropType, type Slot, type VNode } from 'vue'

/** 登录方式。 */
export type SigninMode = 'password' | 'sms' | 'qrCode' | 'thirdParty'

/** 登录提交载荷。 */
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

type SigninHandler = (user: SigninUser) => void | Promise<void>

/**
 * 在任何 await 之前调用：yield 后 getCurrentInstance() 为空。
 */
export function resolveSigninHandlers(
  emit: (event: 'signin', user: SigninUser) => unknown,
): SigninHandler[] {
  const raw = getCurrentInstance()?.vnode.props?.onSignin as
    | SigninHandler
    | SigninHandler[]
    | undefined
  if (raw) return Array.isArray(raw) ? raw : [raw]
  return [
    (user) => {
      const result = emit('signin', user)
      if (Array.isArray(result)) {
        return Promise.all(
          result.map((item) =>
            item != null && typeof (item as Promise<unknown>).then === 'function'
              ? (item as Promise<unknown>)
              : Promise.resolve(item),
          ),
        ).then(() => undefined)
      }
      if (
        result != null &&
        typeof (result as Promise<unknown>).then === 'function'
      ) {
        return result as Promise<void>
      }
    },
  ]
}

export async function invokeSignin(
  emit: (event: 'signin', user: SigninUser) => unknown,
  payload: SigninUser,
  handlers = resolveSigninHandlers(emit),
) {
  await Promise.all(handlers.map((fn) => Promise.resolve(fn(payload))))
}

/**
 * 登录表单对外类型：`signinFormProps` 声明字段 + emit 对应的 onXxx listener。
 * 组件 `defineComponent({ props: signinFormProps })` 只吃声明字段；
 * `buildSigninForm` / `h()` 可同时带 `onSignin` 等 listener。
 * 对齐 core {@link import('@mmda/core').UiSigninFormProps}。
 */
export type SigninFormProps = ExtractPropTypes<typeof signinFormProps> & {
  onSignin?: (user: SigninUser) => void | Promise<void>
  onChangeMode?: () => void
  onSendVCode?: (mobile: string) => void
  onGetQrCode?: () => void
}

/** 注册提交载荷。 */
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

/**
 * 注册表单对外类型：声明 props + `onSignup` listener。
 * 对齐 core {@link import('@mmda/core').UiSignupFormProps}。
 */
export type SignupFormProps = ExtractPropTypes<typeof signupFormProps> & {
  onSignup?: (user: SignupUser) => void | Promise<void>
}
