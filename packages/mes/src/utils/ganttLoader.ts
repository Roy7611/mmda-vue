import type * as DhtmlxGantt from 'dhtmlx-gantt';

export type GanttModule = typeof DhtmlxGantt;
export type GanttInstance = DhtmlxGantt.GanttStatic;

/** dhtmlx-gantt 懒加载单例，供甘特图组件在 onBeforeMount 中初始化 */
let ganttModule: typeof DhtmlxGantt | null = null;
let loadingPromise: Promise<typeof DhtmlxGantt> | null = null;

/**
 * 动态加载 dhtmlx-gantt 及其样式，返回与静态 import 等价的模块对象。
 */
export async function loadDhtmlxGantt(): Promise<typeof DhtmlxGantt> {
	if (ganttModule) {
		return ganttModule;
	}
	if (!loadingPromise) {
		loadingPromise = Promise.all([
			import('dhtmlx-gantt'),
			import('dhtmlx-gantt/codebase/dhtmlxgantt.css'),
		]).then(([mod]) => {
			ganttModule = mod;
			return mod;
		});
	}
	return loadingPromise;
}
