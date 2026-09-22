import { installCanvasStub } from './src/__tests__/canvas_stub'

// jsdom 里没有 2D ctx（引擎构造期就要用），挂载测试统一在这里兜底。
installCanvasStub()
