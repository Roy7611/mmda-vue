/**
 * 路由：Context 只拼纯字符串路径；框架相关的 push / resolve 由实现注入。
 */
export interface UiRouter {
  push(path: string): void
  resolve(path: string): string
}
