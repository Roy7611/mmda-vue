import { MmdaApplication, type MmdaApplicationOptions } from '@mmda/core'
import { ReactUiBuilder } from '../ui/builder'
import { ReactUiContext } from '../contexts/react_ui_context'
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
  declare readonly ui: ReactUiBuilder
  private _navigate?: (path: string) => void

  constructor(baseUrl: string, service: string, options?: MmdaApplicationOptions) {
    const builder = new ReactUiBuilder(stubFactory, stubFieldFactory)
    super(baseUrl, service, builder, options)
  }

  /** 会话工厂。业务层用 `app.createContext(opts)` 创建会话。 */
  createContext<M extends import('@mmda/core').Entity>(opts: Omit<RuiContextOptions<M>, 'logic'> & { logic?: any; navigate?: any }): ReactUiContext<M> {
    return new ReactUiContext({ ...opts, navigate: opts.navigate ?? this._navigate } as any) as ReactUiContext<M>
  }

  /** 注入 react-router 的 navigate 函数。 */
  setNavigator(navigate: (path: string) => void): void { this._navigate = navigate }
}
