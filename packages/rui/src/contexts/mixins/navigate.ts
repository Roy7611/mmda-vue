/**
 * 导航器：react-router 的 navigate 函数，或浏览器的 location.assign。
 * 路由路径由 core `AbstractUiContext.routePath` 生成，这里只保留注入的 navigate 签名。
 */
export type ReactNavigator = (path: string) => void
