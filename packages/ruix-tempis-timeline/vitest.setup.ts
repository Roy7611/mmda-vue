import { installCanvasStub } from './src/__tests__/canvas_stub'

// jsdom 里没有 2D ctx（引擎构造期就要用），挂载测试统一在这里兜底。
installCanvasStub()

// React 19 的 `act()` 要求显式声明测试环境，否则每次 act 都告警。
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true
