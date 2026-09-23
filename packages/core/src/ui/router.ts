/**
 * 路由：Context 只拼纯字符串路径；框架相关的 push / resolve 由实现注入。
 */
export interface UiRouter {
  push(path: string): void
  resolve(path: string): string
  /**
   * 把纯字符串路径解析为框架路由对象（query / params / 命中等）。
   * 返回结构框架相关，core 只透传不解释。
   */
  parse(path: string): unknown
  /** 回退一个历史记录。无历史时实现可空转。 */
  back(): void
}
