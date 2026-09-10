import type { UiProps } from '../props'

/** 登录方式。 */
export type UiSigninMode = 'password' | 'sms' | 'qrCode' | 'thirdParty'

/** 登录提交载荷。 */
export interface UiSigninUser {
  signinMode: UiSigninMode
  username: string
  password: string
  agreed: boolean
}

/**
 * 登录表单 props（`builder.buildSigninForm`）。
 */
export interface UiSigninFormProps extends UiProps {
  mode?: UiSigninMode
  /** 会话；可选，皮肤组件需要时透传。 */
  context?: unknown
  onSignin?: (user: UiSigninUser) => void | Promise<void>
  onChangeMode?: () => void
  onSendVCode?: (mobile: string) => void
  onGetQrCode?: () => void
}

/** 登录表单插槽名（框架无关描述；vui 再钉成 Slot）。 */
export interface UiSigninFormSlots<TNode = any> {
  header?: () => TNode
  title?: () => TNode
  bottomNav?: () => TNode
  thirdParty?: () => TNode
}

/** 注册提交载荷。 */
export interface UiSignupUser {
  mobile: string
  username?: string
  password: string
  vcode: string
  agreed: boolean
}

/**
 * 注册表单 props（`builder.buildSignupForm`）。
 */
export interface UiSignupFormProps extends UiProps {
  /** 回登录页路径。缺省 `/signin`。 */
  toSignin?: string
  onSignup?: (user: UiSignupUser) => void | Promise<void>
}

export interface UiSignupFormSlots<TNode = any> {
  header?: () => TNode
  footer?: () => TNode
}
