import {
  MmdaApplication,
  type MmdaApplicationOptions,
  type TranslateFn,
  type Translatable,
} from '@mmda/core'
import { RuiBuilder } from '../ui/builder'
import { RuiContext } from '../contexts/react_ui_context'
import type { RuiContextOptions } from '../contexts/react_ui_context'

const stubFactory: any = new Proxy({}, {
  get(_t: any, prop: string) {
    return () => { throw new Error(`factory.${prop} requires a skin package`) }
  },
})

const stubFieldFactory: any = new Proxy({}, {
  get(_t: any, prop: string) {
    return () => { throw new Error(`fieldFactory.${prop} requires a skin package`) }
  },
})

/** React 应用壳：组装 builder + createRoot，对标 MmdaVueApp。 */
export class MmdaReactApp extends MmdaApplication {
  declare readonly ui: RuiBuilder
  private _navigate?: (path: string) => void

  constructor(baseUrl: string, service: string, options?: MmdaApplicationOptions) {
    const builder = new RuiBuilder(stubFactory, stubFieldFactory)
    super(baseUrl, service, builder, options)
  }

  /**
   * 文案翻译。React 侧还没接 i18n，先原样返回；接上后覆盖这里
   * （对标 vui 的 `MmdaVueApp.translate`，用的是同一个 core 契约）。
   */
  override translate: TranslateFn = (message) =>
    typeof message === 'string' ? message : message.message

  /** 会话工厂。业务层用 `app.createContext(opts)` 创建会话。 */
  createContext<M extends import('@mmda/core').Entity>(opts: Omit<RuiContextOptions<M>, 'logic'> & { logic?: any; navigate?: any }): RuiContext<M> {
    return new RuiContext({
      ...opts,
      app: this,
      navigate: opts.navigate ?? this._navigate,
    } as any) as RuiContext<M>
  }

  /** 注入 react-router 的 navigate 函数。 */
  setNavigator(navigate: (path: string) => void): void { this._navigate = navigate }
}
