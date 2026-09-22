/**
 * 应用壳的注入键（框架中立）。
 *
 * core 只声明「拿哪个 symbol 找应用壳」；包成框架键由视图层做：
 * vui 侧 `as InjectionKey<MmdaApplication>` 后 provide，rui 侧走 context 直传、不需要键。
 * 业务包（base / mes）从这里取键，不 import 任何 UI 运行时。
 */
export const UI_APP_KEY = Symbol('MmdaApplication')
