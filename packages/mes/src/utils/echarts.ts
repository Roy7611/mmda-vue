import type * as EchartsNS from 'echarts';

/** 按需加载 echarts 全量包，避免打入主入口 chunk */
let echartsModule: typeof EchartsNS | null = null;
let loadingPromise: Promise<typeof EchartsNS> | null = null;

/**
 * 获取 echarts 模块（单例懒加载）。
 * 首次调用触发 dynamic import，后续复用同一实例。
 */
export async function getEcharts(): Promise<typeof EchartsNS> {
	if (echartsModule) {
		return echartsModule;
	}
	if (!loadingPromise) {
		loadingPromise = import('echarts').then((mod) => {
			echartsModule = mod;
			return mod;
		});
	}
	return loadingPromise;
}
