/**
 * 甘特图左侧表格宽度、列宽与分隔线拖拽辅助。
 * 标准版 dhtmlx-gantt 无内置 Resizer，此处补充分隔线拖拽、按分辨率列宽、时间轴覆盖等逻辑。
 */
/** 大屏（≥1920）默认左侧表格占容器宽度比例 */
export const GANTT_GRID_PANEL_LARGE_RATIO = 0.4;
/** 大屏时间轴最小占比，保证日期刻度与任务条可读 */
export const GANTT_TIMELINE_MIN_RATIO = 0.52;
/** 大屏左侧在列宽之和上的少量扩展余量（px） */
export const GANTT_GRID_PANEL_LARGE_MAX_EXTRA = 48;
/** 左侧表格列宽之和上的拖拽扩展余量（px） */
export const GANTT_GRID_PANEL_CONTENT_SLACK = 24;
/** 中屏左侧最大占比 */
export const GANTT_GRID_PANEL_MAX_RATIO_MEDIUM = 0.65;
/** 紧凑屏左侧最大占比 */
export const GANTT_GRID_PANEL_MAX_RATIO_COMPACT = 0.72;
/** 小屏 PC 左侧最大占比 */
export const GANTT_GRID_PANEL_MAX_RATIO_SMALL = 0.78;
/** 中屏默认左侧占比 */
export const GANTT_GRID_PANEL_MEDIUM_RATIO = 0.58;
/** 紧凑屏默认左侧占比 */
export const GANTT_GRID_PANEL_COMPACT_RATIO = 0.68;
/** 小屏 PC 默认左侧占比 */
export const GANTT_GRID_PANEL_SMALL_RATIO = 0.74;
/** 左侧面板绝对最小宽度（px），实际下限由各列 min 之和决定 */
export const GANTT_GRID_PANEL_MIN_WIDTH = 0;
/** 为纵向滚动条预留的容器宽度（px） */
export const GANTT_GRID_PANEL_SCROLLBAR_RESERVE = 20;
/** 列宽/分隔线拖拽热区宽度（px，鼠标距边缘） */
export const GANTT_COLUMN_RESIZE_EDGE_PX = 6;
/** 未配置 min_width 时的通用列最小宽（px） */
export const GANTT_COLUMN_MIN_WIDTH = 56;
/** 开始/结束日期列最小宽（px） */
export const GANTT_DATE_COLUMN_MIN_WIDTH = 100;
/** 开始/结束日期列默认宽（px） */
export const GANTT_DATE_COLUMN_WIDTH = 104;
/** @deprecated 请用 getGanttProjectNameMinWidth 按分辨率取值 */
export const GANTT_PROJECT_NAME_MIN_WIDTH = 140;
/** 第二列（订单/任务）默认宽：<1366px */
export const GANTT_PROJECT_NAME_WIDTH_SMALL = 150;
/** 第二列默认宽：1366–1599px */
export const GANTT_PROJECT_NAME_WIDTH_COMPACT = 170;
/** 第二列默认宽：1600–1919px */
export const GANTT_PROJECT_NAME_WIDTH_MEDIUM = 190;
/** 第二列默认宽：≥1920px */
export const GANTT_PROJECT_NAME_WIDTH_LARGE = 210;
/** 第二列拖拽收缩下限：<1366px */
export const GANTT_PROJECT_NAME_MIN_SMALL = 96;
/** 第二列拖拽收缩下限：1366–1599px */
export const GANTT_PROJECT_NAME_MIN_COMPACT = 108;
/** 第二列拖拽收缩下限：1600–1919px */
export const GANTT_PROJECT_NAME_MIN_MEDIUM = 120;
/** 第二列拖拽收缩下限：≥1920px */
export const GANTT_PROJECT_NAME_MIN_LARGE = 132;
/** 按生产订单：第二列最小宽（px），名称 + PO 两行需预留足够横向空间 */
export const GANTT_ORDER_SCHEDULE_NAME_MIN_WIDTH = 240;
/** 项目排程：第二列最小宽（px），树形缩进 + 阶段/工作包名称 */
export const GANTT_PROJECT_SCHEDULE_NAME_MIN_WIDTH = 220;
/** 树形每级缩进（px），用于测算第二列内容宽 */
export const GANTT_PROJECT_NAME_TREE_INDENT_PX = 20;
/** 树形展开图标占位（px） */
export const GANTT_PROJECT_NAME_TREE_ICON_PX = 22;
/** 单元格左右内边距合计（px） */
export const GANTT_PROJECT_NAME_CELL_PAD_PX = 20;
/** 小屏 PC 断点（容器宽度 < 此值为小屏） */
export const GANTT_SMALL_BREAKPOINT = 1366;
/** 紧凑屏断点 */
export const GANTT_COMPACT_BREAKPOINT = 1600;
/** 大屏断点 */
export const GANTT_LARGE_BREAKPOINT = 1920;
/** @deprecated 使用 getDefaultGanttGridPanelWidth 按分辨率计算 */
export const GANTT_GRID_PANEL_DEFAULT_RATIO = GANTT_GRID_PANEL_LARGE_RATIO;

/** 拖拽/监听控制器，组件卸载时调用 destroy */
export interface GanttResizeController {
	destroy: () => void;
}

/** 按分辨率预设的各列宽度与表头高度 */
export interface GanttGridColumnLayout {
	compact: boolean;
	refName: number;
	projectName: number;
	/** 第二列收缩下限（分辨率档位，非默认展示宽） */
	projectNameMin: number;
	startDate: number;
	endDate: number;
	duration: number;
	priority: number;
	status: number;
	ownerName?: number;
	scaleHeight: number;
}

type DragState =
	| { type: 'grid'; startX: number; startWidth: number; startCoverPx: number }
	| { type: 'column'; columnName: string; startX: number; startWidth: number };

const DATE_COLUMN_NAMES = new Set(['start_date', 'end_date']);
const COLUMN_LAYOUT_KEYS: Record<string, keyof GanttGridColumnLayout> = {
	refName: 'refName',
	projectName: 'projectName',
	start_date: 'startDate',
	end_date: 'endDate',
	duration: 'duration',
	priority: 'priority',
	statusType: 'status',
	ownerName: 'ownerName',
};
const FIXED_COLUMN_WIDTHS: Record<string, number> = {
	add_above: 44,
};

/** 是否为紧凑屏（宽度 < 1600） */
export function isCompactGanttViewport(containerWidth: number) {
	return containerWidth > 0 && containerWidth < GANTT_COMPACT_BREAKPOINT;
}

/** 是否为小屏 PC（宽度 < 1366） */
export function isSmallGanttViewport(containerWidth: number) {
	return containerWidth > 0 && containerWidth < GANTT_SMALL_BREAKPOINT;
}

/** 订单/任务列默认宽度（按分辨率） */
export function getGanttProjectNameDefaultWidth(containerWidth: number) {
	if (isSmallGanttViewport(containerWidth)) {
		return GANTT_PROJECT_NAME_WIDTH_SMALL;
	}
	if (isCompactGanttViewport(containerWidth)) {
		return GANTT_PROJECT_NAME_WIDTH_COMPACT;
	}
	if (containerWidth > 0 && containerWidth < GANTT_LARGE_BREAKPOINT) {
		return GANTT_PROJECT_NAME_WIDTH_MEDIUM;
	}
	return GANTT_PROJECT_NAME_WIDTH_LARGE;
}

/** 订单/任务列拖拽收缩下限（按分辨率） */
export function getGanttProjectNameMinWidth(containerWidth: number) {
	if (isSmallGanttViewport(containerWidth)) {
		return GANTT_PROJECT_NAME_MIN_SMALL;
	}
	if (isCompactGanttViewport(containerWidth)) {
		return GANTT_PROJECT_NAME_MIN_COMPACT;
	}
	if (containerWidth > 0 && containerWidth < GANTT_LARGE_BREAKPOINT) {
		return GANTT_PROJECT_NAME_MIN_MEDIUM;
	}
	return GANTT_PROJECT_NAME_MIN_LARGE;
}

export const isOrderScheduleGanttContainer = (container?: HTMLElement | null) =>
	!!container?.classList.contains('order-schedule-view');

/** 按生产订单：第二列最小宽（不低于通用分辨率下限） */
export function getGanttOrderScheduleNameMinWidth(containerWidth: number) {
	return Math.max(GANTT_ORDER_SCHEDULE_NAME_MIN_WIDTH, getGanttProjectNameMinWidth(containerWidth));
}

/** 项目排程：第二列最小宽（不低于通用分辨率下限） */
export function getGanttProjectScheduleNameMinWidth(containerWidth: number) {
	return Math.max(GANTT_PROJECT_SCHEDULE_NAME_MIN_WIDTH, getGanttProjectNameMinWidth(containerWidth));
}

/** 按容器宽度返回各列默认宽、第二列 min、表头高度等布局配置 */
export function getGanttGridColumnLayout(containerWidth: number): GanttGridColumnLayout {
	if (isSmallGanttViewport(containerWidth)) {
		return {
			compact: true,
			refName: 52,
			projectName: GANTT_PROJECT_NAME_WIDTH_SMALL,
			projectNameMin: GANTT_PROJECT_NAME_MIN_SMALL,
			startDate: GANTT_DATE_COLUMN_WIDTH,
			endDate: GANTT_DATE_COLUMN_WIDTH,
			duration: 48,
			priority: 52,
			status: 52,
			ownerName: 68,
			scaleHeight: 32,
		};
	}
	if (isCompactGanttViewport(containerWidth)) {
		return {
			compact: true,
			refName: 58,
			projectName: GANTT_PROJECT_NAME_WIDTH_COMPACT,
			projectNameMin: GANTT_PROJECT_NAME_MIN_COMPACT,
			startDate: GANTT_DATE_COLUMN_WIDTH,
			endDate: GANTT_DATE_COLUMN_WIDTH,
			duration: 50,
			priority: 58,
			status: 58,
			ownerName: 72,
			scaleHeight: 32,
		};
	}
	if (containerWidth > 0 && containerWidth < GANTT_LARGE_BREAKPOINT) {
		return {
			compact: false,
			refName: 72,
			projectName: GANTT_PROJECT_NAME_WIDTH_MEDIUM,
			projectNameMin: GANTT_PROJECT_NAME_MIN_MEDIUM,
			startDate: GANTT_DATE_COLUMN_WIDTH,
			endDate: GANTT_DATE_COLUMN_WIDTH,
			duration: 58,
			priority: 64,
			status: 64,
			ownerName: 80,
			scaleHeight: 36,
		};
	}
	return {
		compact: false,
		refName: 88,
		projectName: GANTT_PROJECT_NAME_WIDTH_LARGE,
		projectNameMin: GANTT_PROJECT_NAME_MIN_LARGE,
		startDate: GANTT_DATE_COLUMN_WIDTH,
		endDate: GANTT_DATE_COLUMN_WIDTH,
		duration: 64,
		priority: 72,
		status: 72,
		ownerName: 88,
		scaleHeight: 40,
	};
}

/** 左侧表格固定列 + 任务名列的最小宽度，保证内容完整可见 */
export function getGanttGridMinContentWidth(
	layout: GanttGridColumnLayout,
	options?: { withOwner?: boolean; withAddAbove?: boolean }
) {
	const fixed =
		layout.refName +
		layout.startDate +
		layout.endDate +
		layout.duration +
		layout.priority +
		layout.status +
		(options?.withOwner && layout.ownerName != null ? layout.ownerName : 0) +
		(options?.withAddAbove ? 44 : 0);
	const projectMin = layout.projectNameMin;
	return fixed + projectMin;
}

/** 根据当前 columns 配置估算左侧表格总宽（用于默认/最大宽计算） */
export function estimateGanttGridPanelWidth(columns: any[], fallback = 900) {
	if (!columns?.length) {
		return fallback;
	}
	const total = columns.reduce((sum, col) => {
		if (col.hide) {
			return sum;
		}
		const width = col.width;
		if (width === '*') {
			return sum + Number(col.min_width ?? GANTT_PROJECT_NAME_MIN_WIDTH);
		}
		if (width && width !== '*') {
			return sum + Number(width);
		}
		return sum + GANTT_COLUMN_MIN_WIDTH;
	}, 0);
	return Math.max(GANTT_GRID_PANEL_MIN_WIDTH, total || fallback);
}

/** 左侧表格最大宽度：列内容宽度 + 分辨率上限，拖拽分隔线不超过此值 */
export function getGanttGridPanelMaxWidth(
	containerWidth: number,
	ganttInstance?: any,
	options?: { withOwner?: boolean; withAddAbove?: boolean; columns?: any[] }
) {
	if (!containerWidth) {
		return 900;
	}
	const columns = options?.columns ?? ganttInstance?.config?.columns ?? [];
	const withOwner =
		options?.withOwner ?? columns.some((col: any) => col.name === 'ownerName' && !col.hide);
	const withAddAbove =
		options?.withAddAbove ?? columns.some((col: any) => col.name === 'add_above' && !col.hide);
	const layoutOpts = { withOwner, withAddAbove, columns };
	const layout = getGanttGridColumnLayout(containerWidth);
	const columnSum = columns.length
		? estimateGanttGridPanelWidth(columns, getGanttGridMinContentWidth(layout, layoutOpts))
		: getGanttGridMinContentWidth(layout, layoutOpts);

	const containerMax = containerWidth - GANTT_GRID_PANEL_SCROLLBAR_RESERVE;
	let ratioMax: number;
	if (containerWidth >= GANTT_LARGE_BREAKPOINT) {
		ratioMax = Math.floor(containerWidth * (1 - GANTT_TIMELINE_MIN_RATIO));
	} else if (isSmallGanttViewport(containerWidth)) {
		ratioMax = Math.floor(containerWidth * GANTT_GRID_PANEL_MAX_RATIO_SMALL);
	} else if (isCompactGanttViewport(containerWidth)) {
		ratioMax = Math.floor(containerWidth * GANTT_GRID_PANEL_MAX_RATIO_COMPACT);
	} else {
		ratioMax = Math.floor(containerWidth * GANTT_GRID_PANEL_MAX_RATIO_MEDIUM);
	}

	const contentMax = columnSum + GANTT_GRID_PANEL_CONTENT_SLACK;
	return Math.max(GANTT_GRID_PANEL_MIN_WIDTH, Math.min(containerMax, ratioMax, contentMax));
}

type GanttColumnMinContext = { ganttInstance?: any; container?: HTMLElement };

/** 单列基准最小宽（不用当前 col.width，避免拉宽后 min 跟着涨导致缩不回） */
const getGanttColumnBaselineMinWidth = (
	col: any,
	layout: GanttGridColumnLayout,
	containerWidth: number,
	context?: GanttColumnMinContext
): number => {
	if (col.hide) {
		return 0;
	}
	if (FIXED_COLUMN_WIDTHS[col.name] != null) {
		return FIXED_COLUMN_WIDTHS[col.name];
	}
	if (col.name === 'projectName') {
		if (context?.container && isOrderScheduleGanttContainer(context.container)) {
			return getGanttOrderScheduleNameMinWidth(containerWidth);
		}
		const resolutionMin = getGanttProjectScheduleNameMinWidth(containerWidth);
		if (col.$contentMinWidth != null) {
			return Math.max(resolutionMin, Number(col.$contentMinWidth));
		}
		if (
			context?.ganttInstance &&
			context?.container &&
			(context.ganttInstance.getTaskCount?.() ?? 0) > 0
		) {
			const measured = measureGanttProjectNameContentWidth(context.ganttInstance, context.container);
			col.$contentMinWidth = measured;
			return measured;
		}
		return resolutionMin;
	}
	if (col.min_width != null && col.min_width !== '') {
		return Number(col.min_width);
	}
	const layoutKey = COLUMN_LAYOUT_KEYS[col.name];
	if (layoutKey) {
		const layoutValue = layout[layoutKey];
		if (typeof layoutValue === 'number') {
			return layoutValue;
		}
	}
	if (DATE_COLUMN_NAMES.has(col.name)) {
		return GANTT_DATE_COLUMN_MIN_WIDTH;
	}
	return GANTT_COLUMN_MIN_WIDTH;
};

/** 左侧表格最小宽度：各列基准 min 之和，不随拖拽变宽而升高 */
export function getGanttGridPanelMinWidth(
	containerWidth: number,
	ganttInstance?: any,
	options?: { withOwner?: boolean; withAddAbove?: boolean; columns?: any[]; container?: HTMLElement }
) {
	const layout = getGanttGridColumnLayout(containerWidth);
	const columns = options?.columns ?? ganttInstance?.config?.columns ?? [];
	const minContext: GanttColumnMinContext | undefined =
		ganttInstance && options?.container ? { ganttInstance, container: options.container } : undefined;
	if (columns.length) {
		const sum = columns.reduce(
			(total: number, col: any) =>
				total + getGanttColumnBaselineMinWidth(col, layout, containerWidth, minContext),
			0
		);
		return Math.max(GANTT_GRID_PANEL_MIN_WIDTH, sum);
	}
	const withOwner = options?.withOwner ?? false;
	const withAddAbove = options?.withAddAbove ?? false;
	return getGanttGridMinContentWidth(layout, { withOwner, withAddAbove });
}

/**
 * 默认左侧表格宽度（按分辨率）：
 * - 大屏：左侧约 40%，时间轴至少 52%；优先保证列内容完整显示
 * - 中屏：约 58%
 * - 紧凑屏：约 68%
 * - 小屏 PC：约 74%，且不小于列内容最小宽度
 */
export function getDefaultGanttGridPanelWidth(
	containerWidth: number,
	columnLayout?: GanttGridColumnLayout,
	options?: { withOwner?: boolean; withAddAbove?: boolean; columns?: any[]; fallback?: number }
) {
	const fallback = options?.fallback ?? 600;
	if (!containerWidth) {
		return fallback;
	}
	const layout = columnLayout ?? getGanttGridColumnLayout(containerWidth);
	const minContent = options?.columns?.length
		? estimateGanttGridPanelWidth(options.columns, getGanttGridMinContentWidth(layout, options))
		: getGanttGridMinContentWidth(layout, options);
	const maxWidth = Math.max(GANTT_GRID_PANEL_MIN_WIDTH, containerWidth - GANTT_GRID_PANEL_SCROLLBAR_RESERVE);

	if (containerWidth >= GANTT_LARGE_BREAKPOINT) {
		const byRatio = Math.floor(containerWidth * GANTT_GRID_PANEL_LARGE_RATIO);
		const maxForTimeline = Math.floor(containerWidth * (1 - GANTT_TIMELINE_MIN_RATIO));
		const comfortCap = minContent + GANTT_GRID_PANEL_LARGE_MAX_EXTRA;
		const width = Math.min(maxForTimeline, comfortCap, Math.max(minContent, byRatio));
		const panelMax = getGanttGridPanelMaxWidth(containerWidth, undefined, options);
		return Math.min(maxWidth, panelMax, Math.max(GANTT_GRID_PANEL_MIN_WIDTH, width));
	}

	let ratio = GANTT_GRID_PANEL_MEDIUM_RATIO;
	if (isSmallGanttViewport(containerWidth)) {
		ratio = GANTT_GRID_PANEL_SMALL_RATIO;
	} else if (containerWidth < GANTT_COMPACT_BREAKPOINT) {
		ratio = GANTT_GRID_PANEL_COMPACT_RATIO;
	} else if (containerWidth < GANTT_LARGE_BREAKPOINT) {
		ratio = GANTT_GRID_PANEL_MEDIUM_RATIO;
	}

	const width = Math.min(maxWidth, Math.max(minContent, Math.floor(containerWidth * ratio)));
	const panelMax = getGanttGridPanelMaxWidth(containerWidth, undefined, options);
	return Math.min(width, panelMax);
}

/** 网格日期列统一格式化为 YYYY-MM-DD */
export function formatGanttGridDate(value: any, _compact?: boolean) {
	if (value == null || value === '') {
		return '';
	}
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return String(value);
	}
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

const stripHtmlForMeasure = (html: string) =>
	html
		.replace(/<br\s*\/?>/gi, ' ')
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();

const getGanttMeasureFont = (container?: HTMLElement | null) => {
	const ref =
		(container?.querySelector('.gantt_grid_data .gantt_cell .gantt_tree_content') as HTMLElement | null) ??
		(container?.querySelector('.gantt_grid') as HTMLElement | null);
	return ref ? getComputedStyle(ref).font : '12px Arial, sans-serif';
};

const getProjectNameCellText = (ganttInstance: any, col: any, task: any) => {
	if (typeof col.template === 'function') {
		return stripHtmlForMeasure(String(col.template(task) ?? ''));
	}
	return stripHtmlForMeasure(String(task.projectName ?? task.productName ?? ''));
};

/** 测算订单/任务列文字+树形缩进所需像素（不含分辨率下限与默认上限） */
const computeGanttProjectNameRawContentWidth = (ganttInstance: any, container: HTMLElement) => {
	const col = ganttInstance.getGridColumn?.('projectName');
	if (!col || col.hide || (ganttInstance.getTaskCount?.() ?? 0) === 0) {
		return 0;
	}
	const ctx = document.createElement('canvas').getContext('2d');
	if (!ctx) {
		return 0;
	}
	ctx.font = getGanttMeasureFont(container);

	let maxText = ctx.measureText(String(col.label ?? '')).width;
	let maxTreeLevel = 0;
	ganttInstance.eachTask((task: any) => {
		if (task?.refName === 'loadMore') {
			return;
		}
		const text = getProjectNameCellText(ganttInstance, col, task);
		for (const line of text.split(/\s+/).filter(Boolean)) {
			maxText = Math.max(maxText, ctx.measureText(line).width);
		}
		maxText = Math.max(maxText, ctx.measureText(text).width);
		if (col.tree) {
			maxTreeLevel = Math.max(maxTreeLevel, ganttInstance.getTaskLevel?.(task.id) ?? 0);
		}
	});

	return (
		Math.ceil(maxText) +
		GANTT_PROJECT_NAME_CELL_PAD_PX +
		maxTreeLevel * GANTT_PROJECT_NAME_TREE_INDENT_PX +
		GANTT_PROJECT_NAME_TREE_ICON_PX
	);
};

/** 将内容测算结果限制在 [分辨率最小宽, 分辨率默认宽] */
const clampGanttProjectNameWidthByResolution = (
	containerWidth: number,
	rawContentWidth: number
) => {
	const resolutionMin = getGanttProjectNameMinWidth(containerWidth);
	const resolutionMax = getGanttProjectNameDefaultWidth(containerWidth);
	if (!rawContentWidth) {
		return resolutionMin;
	}
	return Math.max(resolutionMin, Math.min(resolutionMax, rawContentWidth));
};

/** 按数据测算订单/任务列宽度（含树形缩进，受分辨率 min/max 约束） */
export function measureGanttProjectNameContentWidth(ganttInstance: any, container: HTMLElement) {
	const col = ganttInstance.getGridColumn?.('projectName');
	if (!col || col.hide) {
		return getGanttProjectNameMinWidth(container.clientWidth);
	}
	const raw = computeGanttProjectNameRawContentWidth(ganttInstance, container);
	return clampGanttProjectNameWidthByResolution(container.clientWidth, raw);
}

/**
 * 按数据内容在分辨率 [min, 默认宽] 之间收紧订单/任务列，避免第二列过宽或大片留白。
 * 手动拖拽列宽时不调用（由 min_width 限制下限）。
 */
export function fitGanttProjectNameColumnWidth(ganttInstance: any, container: HTMLElement) {
	const col = ganttInstance.getGridColumn?.('projectName');
	if (!col || col.hide) {
		return;
	}
	if (isOrderScheduleGanttContainer(container)) {
		const minWidth = getGanttOrderScheduleNameMinWidth(container.clientWidth);
		col.min_width = minWidth;
		delete col.$contentMinWidth;
		if (Number(col.width) < minWidth) {
			col.width = minWidth;
		}
		return;
	}
	const containerWidth = container.clientWidth;
	const floor = getGanttProjectScheduleNameMinWidth(containerWidth);
	const raw = computeGanttProjectNameRawContentWidth(ganttInstance, container);
	const fitted = Math.max(floor, clampGanttProjectNameWidthByResolution(containerWidth, raw));
	col.$contentMinWidth = fitted;
	col.min_width = floor;
	col.width = fitted;
}

/** 按容器宽度调整列宽、表头高度与紧凑样式类 */
export function applyGanttResponsiveLayout(ganttInstance: any, container: HTMLElement | null | undefined) {
	if (!container) {
		return getGanttGridColumnLayout(0);
	}
	const layout = getGanttGridColumnLayout(container.clientWidth);
	container.classList.toggle('gantt-compact-view', layout.compact);
	container.classList.toggle('gantt-small-pc-view', isSmallGanttViewport(container.clientWidth));
	ganttInstance.config.scale_height = layout.scaleHeight;

	const columns = ganttInstance.config.columns ?? [];
	for (const col of columns) {
		if (col.hide) {
			continue;
		}
		if (FIXED_COLUMN_WIDTHS[col.name] != null) {
			col.width = FIXED_COLUMN_WIDTHS[col.name];
			continue;
		}
		const layoutKey = COLUMN_LAYOUT_KEYS[col.name];
		if (!layoutKey) {
			continue;
		}
		const width = layout[layoutKey];
		if (col.name === 'projectName') {
			col.width = layout.projectName;
			col.min_width = isOrderScheduleGanttContainer(container)
				? getGanttOrderScheduleNameMinWidth(container.clientWidth)
				: getGanttProjectScheduleNameMinWidth(container.clientWidth);
			delete col.$contentMinWidth;
		} else if (typeof width === 'number') {
			col.width = width;
			if (DATE_COLUMN_NAMES.has(col.name)) {
				col.min_width = GANTT_DATE_COLUMN_MIN_WIDTH;
			}
		}
		if (DATE_COLUMN_NAMES.has(col.name)) {
			const prevTemplate = col.template;
			col.template = (task: any) => {
				if (typeof prevTemplate === 'function') {
					const rendered = prevTemplate(task);
					if (rendered != null && rendered !== '') {
						return rendered;
					}
				}
				return formatGanttGridDate(task[col.name], layout.compact);
			};
		}
	}
	return layout;
}

/** 左侧表格 + 横向滚动条 + 中间分隔 + 时间轴（标准版 dhtmlx-gantt 无内置 Resizer） */
export function buildGanttScrollableLayout(
	gridPanelWidth: number,
	maxGridPanelWidth?: number,
	minGridPanelWidth?: number
) {
	const panelMin = Math.max(GANTT_GRID_PANEL_MIN_WIDTH, minGridPanelWidth ?? GANTT_GRID_PANEL_MIN_WIDTH);
	const panelMax = Math.max(panelMin, maxGridPanelWidth ?? gridPanelWidth);
	const width = Math.max(panelMin, Math.min(panelMax, gridPanelWidth));
	return {
		css: 'gantt_container',
		cols: [
			{
				width,
				minWidth: panelMin,
				maxWidth: panelMax,
				rows: [
					{
						view: 'grid',
						scrollable: true,
						scrollX: 'scrollHor1',
						scrollY: 'scrollVer',
					},
					{
						view: 'scrollbar',
						id: 'scrollHor1',
						scroll: 'x',
						group: 'hor',
					},
				],
			},
			{ resizer: true, width: 1 },
			{
				rows: [
					{
						view: 'timeline',
						scrollX: 'scrollHor',
						scrollY: 'scrollVer',
					},
					{
						view: 'scrollbar',
						id: 'scrollHor',
						scroll: 'x',
						group: 'hor',
					},
				],
			},
			{
				view: 'scrollbar',
				id: 'scrollVer',
			},
		],
	};
}

/** 向上查找带 minWidth/maxWidth 的 layout 单元格（左侧面板外层） */
const getGridPanelLayoutCell = (ganttInstance: any) => {
	const gridView = ganttInstance.$ui?.getView('grid') as any;
	if (!gridView) {
		return null;
	}
	let cell = gridView.$parent;
	while (cell) {
		const cfg = cell.$config;
		if (cfg && (cfg.minWidth != null || cfg.maxWidth != null)) {
			return cell;
		}
		cell = cell.$parent;
	}
	return gridView.$parent?.$parent ?? gridView.$parent ?? null;
};

/** 锁定各列 min_width 为基准值，避免 dhtmlx 弹性列把下限抬到当前列宽 */
const pinGridColumnBaselineMinWidths = (ganttInstance: any, container: HTMLElement) => {
	const containerWidth = container.clientWidth;
	const layout = getGanttGridColumnLayout(containerWidth);
	const context: GanttColumnMinContext = { ganttInstance, container };
	for (const col of ganttInstance.config.columns ?? []) {
		if (col.hide) {
			continue;
		}
		col.min_width = getGanttColumnBaselineMinWidth(col, layout, containerWidth, context);
	}
};

const getRenderedGridColumnWidth = (container: HTMLElement, columnName: string): number | null => {
	const cell = container.querySelector(
		`.gantt_grid_scale .gantt_grid_head_cell[data-column-name="${columnName}"]`
	) as HTMLElement | null;
	if (!cell) {
		return null;
	}
	const width = cell.getBoundingClientRect().width;
	return width > 0 ? Math.round(width) : null;
};

const sumVisibleColumnConfigWidths = (ganttInstance: any) =>
	(ganttInstance.config.columns ?? []).reduce((sum: number, col: any) => {
		if (col.hide) {
			return sum;
		}
		return sum + (Number(col.width) || Number(col.min_width) || GANTT_COLUMN_MIN_WIDTH);
	}, 0);

/**
 * dhtmlx _setColumnsWidth 按比例缩小面板后，部分列 DOM 宽可能低于 min_width。
 * 仅抬升低于下限的列，不回写 DOM 宽到 config（避免打断表头列宽拖拽）。
 */
const enforceGridColumnMinWidths = (
	ganttInstance: any,
	container: HTMLElement,
	panelTargetWidth: number
): number => {
	const gridView = ganttInstance.$ui?.getView('grid') as any;
	const containerWidth = container.clientWidth;
	const layout = getGanttGridColumnLayout(containerWidth);
	const context: GanttColumnMinContext = { ganttInstance, container };
	let raised = false;

	for (const col of ganttInstance.config.columns ?? []) {
		if (col.hide) {
			continue;
		}
		const minW = getGanttColumnBaselineMinWidth(col, layout, containerWidth, context);
		col.min_width = minW;
		const configW = Number(col.width);
		const rendered = getRenderedGridColumnWidth(container, col.name);
		const effective = rendered ?? (Number.isFinite(configW) ? configW : minW);
		if (Number.isFinite(effective) && effective < minW) {
			col.width = minW;
			raised = true;
		}
	}

	if (!raised) {
		return panelTargetWidth;
	}

	const widthSum = sumVisibleColumnConfigWidths(ganttInstance);
	const nextPanel = Math.max(panelTargetWidth, widthSum);
	if (gridView?._setColumnsWidth) {
		gridView._setColumnsWidth(Math.round(nextPanel));
	}
	return nextPanel;
};

/** 将列宽总和缩放到目标面板宽（dhtmlx 弹性列在列宽总和 > 面板宽时不会收缩） */
const scaleGridColumnsToPanelWidth = (
	ganttInstance: any,
	targetWidth: number,
	container?: HTMLElement
) => {
	const gridView = ganttInstance.$ui?.getView('grid') as any;
	const rounded = Math.round(targetWidth);
	if (!gridView?._setColumnsWidth) {
		if (container) {
			return enforceGridColumnMinWidths(ganttInstance, container, rounded);
		}
		return rounded;
	}
	const total = gridView._getColsTotalWidth?.();
	const needsScale = total !== false && total != null && Math.abs(total - rounded) >= 1;
	const scaledDown = total !== false && total != null && total > rounded + 1;
	if (needsScale) {
		gridView._setColumnsWidth(rounded);
	}
	// 仅在面板被按比例缩小后校正列下限，列宽拖拽/放大时不介入
	if (container && scaledDown) {
		return enforceGridColumnMinWidths(ganttInstance, container, rounded);
	}
	const applied = gridView._getColsTotalWidth?.();
	return typeof applied === 'number' && Number.isFinite(applied) ? applied : rounded;
};

/** 同步 dhtmlx layout 单元格 width 与 grid_width，使左侧面板视觉宽度生效 */
const syncGridPanelLayoutGeometry = (
	ganttInstance: any,
	nextWidth: number,
	hidden: boolean
) => {
	const gridPanel = getGridPanelLayoutCell(ganttInstance);
	const gridView = ganttInstance.$ui?.getView('grid') as any;
	if (gridPanel?.$config) {
		gridPanel.$config.width = nextWidth;
		gridPanel.$config.hidden = hidden;
		if (gridPanel.$parent?.$config) {
			gridPanel.$parent.$config.hidden = hidden;
		}
	}
	if (gridView?.$parent?.$config && gridView.$parent !== gridPanel) {
		gridView.$parent.$config.width = nextWidth;
	}
	if (gridView?.$config) {
		gridView.$config.width = Math.max(0, nextWidth - 1);
	}
	const group = gridPanel?.$config?.group ?? gridView?.$parent?.$config?.group;
	if (group && ganttInstance.$layout?._syncCellSizes) {
		ganttInstance.$layout._syncCellSizes(group, { value: nextWidth, isGravity: false });
	}
};

/** grid.setSize + layout.resize，避免仅 render 被弹性列逻辑打回 */
const refreshGridPanelLayout = (ganttInstance: any, panelWidth: number) => {
	const gridView = ganttInstance.$ui?.getView('grid') as any;
	const height = gridView?.$state?.height ?? gridView?.$config?.height;
	if (gridView?.setSize && height != null) {
		gridView.setSize(Math.max(0, panelWidth - 1), height);
	}
	ganttInstance.$layout?.resize?.();
};

const getCurrentGridPanelWidth = (ganttInstance: any, container: HTMLElement) => {
	const gridPanel = getGridPanelLayoutCell(ganttInstance);
	if (gridPanel?.$config?.width != null) {
		return Number(gridPanel.$config.width);
	}
	const gridEl = container.querySelector('.gantt_grid') as HTMLElement | null;
	return gridEl?.getBoundingClientRect().width ?? 0;
};

const syncGridPanelMaxWidth = (ganttInstance: any, container: HTMLElement) => {
	const panelMax = getGanttGridPanelMaxWidth(container.clientWidth, ganttInstance);
	const gridPanel = getGridPanelLayoutCell(ganttInstance);
	if (gridPanel?.$config) {
		gridPanel.$config.maxWidth = panelMax;
	}
	return panelMax;
};

const syncGridPanelMinWidth = (ganttInstance: any, container: HTMLElement) => {
	const panelMin = getGanttGridPanelMinWidth(container.clientWidth, ganttInstance, { container });
	const gridPanel = getGridPanelLayoutCell(ganttInstance);
	if (gridPanel?.$config) {
		gridPanel.$config.minWidth = panelMin;
	}
	return panelMin;
};

const getTimelineLayoutCell = (container: HTMLElement) => {
	const task = container.querySelector('.gantt_task') as HTMLElement | null;
	if (!task) {
		return null;
	}
	return (
		(task.closest('.gantt_layout_cell') as HTMLElement | null) ??
		(task.closest('.gantt_layout_content') as HTMLElement | null) ??
		task.parentElement
	);
};

const getTimelineCoverPx = (container: HTMLElement) => {
	const raw = container.style.getPropertyValue('--gantt-timeline-cover-px');
	const parsed = Number.parseInt(raw, 10);
	return Number.isFinite(parsed) ? parsed : 0;
};

const resetTimelineCover = (container: HTMLElement) => {
	container.classList.remove('gantt-timeline-cover-mode');
	container.style.removeProperty('--gantt-timeline-cover-px');
	const timelineCell = getTimelineLayoutCell(container);
	if (timelineCell) {
		timelineCell.style.marginLeft = '';
		timelineCell.style.width = '';
		timelineCell.style.zIndex = '';
		timelineCell.style.position = '';
	}
};

/** 左侧已到最小宽后继续左拖：时间轴左扩覆盖 */
const applyTimelineCover = (container: HTMLElement, coverPx: number, panelMin: number) => {
	const cover = Math.min(panelMin, Math.max(0, Math.round(coverPx)));
	if (cover <= 0) {
		resetTimelineCover(container);
		return;
	}
	container.classList.add('gantt-timeline-cover-mode');
	container.style.setProperty('--gantt-timeline-cover-px', `${cover}px`);
	const timelineCell = getTimelineLayoutCell(container);
	if (timelineCell) {
		timelineCell.style.position = 'relative';
		timelineCell.style.zIndex = '5';
		timelineCell.style.marginLeft = `-${cover}px`;
		timelineCell.style.width = `calc(100% + ${cover}px)`;
	}
};

/** 左侧宽度限制在 [最小宽, 最大宽] */
const clampGridPanelWidth = (ganttInstance: any, container: HTMLElement, width: number) => {
	const containerMax = Math.max(
		GANTT_GRID_PANEL_MIN_WIDTH,
		container.clientWidth - GANTT_GRID_PANEL_SCROLLBAR_RESERVE
	);
	const panelMin = Math.min(
		getGanttGridPanelMinWidth(container.clientWidth, ganttInstance, { container }),
		containerMax
	);
	const panelMax = Math.min(getGanttGridPanelMaxWidth(container.clientWidth, ganttInstance), containerMax);
	return Math.max(panelMin, Math.min(width, panelMax));
};

/** 写入左侧表格实际宽度：缩放各列宽、更新 layout、刷新 grid */
const applyGridPanelWidth = (
	ganttInstance: any,
	container: HTMLElement,
	width: number,
	options?: { resetCover?: boolean }
) => {
	if (options?.resetCover !== false) {
		resetTimelineCover(container);
	}
	pinGridColumnBaselineMinWidths(ganttInstance, container);
	syncGridPanelMinWidth(ganttInstance, container);
	syncGridPanelMaxWidth(ganttInstance, container);
	const nextWidth = clampGridPanelWidth(ganttInstance, container, width);
	const hidden = nextWidth <= 0;

	const scaledWidth = scaleGridColumnsToPanelWidth(ganttInstance, nextWidth, container);
	const finalWidth = clampGridPanelWidth(ganttInstance, container, scaledWidth);

	const gridPanel = getGridPanelLayoutCell(ganttInstance);
	if (gridPanel?.$config) {
		gridPanel.$config.hidden = hidden;
		if (gridPanel.$parent?.$config) {
			gridPanel.$parent.$config.hidden = hidden;
		}
	}
	ganttInstance.config.show_grid = !hidden;
	ganttInstance.config.grid_width = finalWidth;
	syncGridPanelLayoutGeometry(ganttInstance, finalWidth, hidden);
	refreshGridPanelLayout(ganttInstance, finalWidth);
};

/**
 * 分隔线拖拽（左/右缘相同）：
 * - 目标宽 > 最小宽：左侧同步收拢/放大，清除覆盖
 * - 目标宽 <= 最小宽：左侧锁定最小宽，时间轴继续左扩覆盖
 */
const applyGridSplitterDrag = (
	ganttInstance: any,
	container: HTMLElement,
	requestedWidth: number,
	startCoverPx = 0,
	delta = 0
) => {
	const panelMin = getGanttGridPanelMinWidth(container.clientWidth, ganttInstance, { container });

	// 覆盖模式下先向右拖：优先减少覆盖，再放大左侧
	if (startCoverPx > 0 && delta > 0) {
		const coverReduce = Math.min(startCoverPx, delta);
		const nextCover = startCoverPx - coverReduce;
		if (nextCover > 0 && requestedWidth <= panelMin) {
			applyGridPanelWidth(ganttInstance, container, panelMin, { resetCover: false });
			applyTimelineCover(container, nextCover, panelMin);
			return;
		}
	}

	if (requestedWidth > panelMin) {
		resetTimelineCover(container);
		applyGridPanelWidth(ganttInstance, container, requestedWidth, { resetCover: false });
		return;
	}

	applyGridPanelWidth(ganttInstance, container, panelMin, { resetCover: false });
	applyTimelineCover(container, panelMin - requestedWidth, panelMin);
};

const sumColumnWidths = (ganttInstance: any) =>
	(ganttInstance.config.columns ?? []).reduce((sum: number, col: any) => {
		if (col.hide) {
			return sum;
		}
		const width = col.width;
		if (width === '*') {
			return sum + Number(col.min_width ?? GANTT_PROJECT_NAME_MIN_WIDTH);
		}
		if (width && width !== '*') {
			return sum + Number(width);
		}
		return sum + GANTT_COLUMN_MIN_WIDTH;
	}, 0);

const applyColumnWidth = (ganttInstance: any, container: HTMLElement, columnName: string, width: number) => {
	const column = ganttInstance.getGridColumn?.(columnName);
	if (!column) {
		return;
	}
	const layout = getGanttGridColumnLayout(container.clientWidth);
	const context: GanttColumnMinContext = { ganttInstance, container };
	const minW = getGanttColumnBaselineMinWidth(column, layout, container.clientWidth, context);
	column.min_width = minW;
	column.width = Math.max(minW, Math.round(width));
	const totalWidth = sumColumnWidths(ganttInstance);
	applyGridPanelWidth(ganttInstance, container, totalWidth);
};

const detectGridSplitterHit = (
	ganttInstance: any,
	container: HTMLElement,
	clientX: number
): Pick<DragState, 'type' | 'startWidth'> | null => {
	const edge = GANTT_COLUMN_RESIZE_EDGE_PX;
	const gridEl = container.querySelector('.gantt_grid') as HTMLElement | null;
	if (gridEl && gridEl.offsetWidth > 0) {
		const rect = gridEl.getBoundingClientRect();
		if (clientX >= rect.right - edge && clientX <= rect.right + edge) {
			return { type: 'grid', startWidth: getCurrentGridPanelWidth(ganttInstance, container) };
		}
	}

	const taskEl = container.querySelector('.gantt_task') as HTMLElement | null;
	if (taskEl) {
		const rect = taskEl.getBoundingClientRect();
		if (clientX >= rect.left - edge && clientX <= rect.left + edge) {
			return { type: 'grid', startWidth: getCurrentGridPanelWidth(ganttInstance, container) };
		}
	}
	return null;
};

/** 数据加载或窗口变化后：收紧第二列并按分辨率同步左侧表格默认宽度 */
export function syncGanttDefaultGridPanelWidth(ganttInstance: any, container: HTMLElement) {
	const layout = getGanttGridColumnLayout(container.clientWidth);
	const columns = ganttInstance.config.columns ?? [];
	const withOwner = columns.some((col: any) => col.name === 'ownerName' && !col.hide);
	const withAddAbove = columns.some((col: any) => col.name === 'add_above' && !col.hide);
	if (ganttInstance.getTaskCount?.() > 0) {
		fitGanttProjectNameColumnWidth(ganttInstance, container);
	}
	const width = getDefaultGanttGridPanelWidth(container.clientWidth, layout, {
		withOwner,
		withAddAbove,
		columns,
	});
	applyGridPanelWidth(ganttInstance, container, width);
}

/**
 * 绑定分隔线与表头列宽拖拽（mousedown/move/up）。
 * 分隔线：左侧面板与时间轴之间；列宽：表头列 resize 手柄。
 */
export function setupGanttManualResize(
	ganttInstance: any,
	container: HTMLElement,
	options?: { lockLayoutSync?: { active: boolean } }
): GanttResizeController {
	let dragState: DragState | null = null;

	const detectHit = (e: MouseEvent): DragState | null => {
		// 表格右缘 = 中间分隔线，优先于最后一列表头列宽拖拽（生产排程无 add_above 列时二者重合）
		const gridHit = detectGridSplitterHit(ganttInstance, container, e.clientX);
		if (gridHit) {
			return {
				...gridHit,
				startX: e.clientX,
				startCoverPx: getTimelineCoverPx(container),
			} as DragState;
		}

		const gridScale = container.querySelector('.gantt_grid_scale');
		if (gridScale) {
			const headerCells = gridScale.querySelectorAll('.gantt_grid_head_cell');
			for (const cell of headerCells) {
				const el = cell as HTMLElement;
				const columnName = el.dataset.columnName;
				if (!columnName) {
					continue;
				}
				const column = ganttInstance.getGridColumn?.(columnName);
				if (!column?.resize) {
					continue;
				}
				const rect = el.getBoundingClientRect();
				if (
					e.clientX >= rect.right - GANTT_COLUMN_RESIZE_EDGE_PX &&
					e.clientX <= rect.right + GANTT_COLUMN_RESIZE_EDGE_PX
				) {
					return {
						type: 'column',
						columnName,
						startX: e.clientX,
						startWidth: rect.width,
					};
				}
			}
		}

		return null;
	};

	const setResizeCursor = (active: boolean) => {
		const gridScale = container.querySelector('.gantt_grid_scale') as HTMLElement | null;
		const gridEl = container.querySelector('.gantt_grid') as HTMLElement | null;
		const taskEl = container.querySelector('.gantt_task') as HTMLElement | null;
		const cursor = active ? 'col-resize' : '';
		if (gridScale) {
			gridScale.style.cursor = cursor;
		}
		if (gridEl) {
			gridEl.style.cursor = cursor;
		}
		if (taskEl && (!gridEl || gridEl.offsetWidth <= 0)) {
			taskEl.style.cursor = cursor;
		}
	};

	const onMouseDown = (e: MouseEvent) => {
		if (e.button !== 0) {
			return;
		}
		const hit = detectHit(e);
		if (!hit) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		dragState = hit;
		if (options?.lockLayoutSync) {
			options.lockLayoutSync.active = true;
		}
		document.body.classList.add('gantt-resize-dragging');
		setResizeCursor(true);
	};

	const onMouseMove = (e: MouseEvent) => {
		if (dragState) {
			const delta = e.clientX - dragState.startX;
			if (dragState.type === 'grid') {
				const requestedWidth = dragState.startWidth + delta;
				applyGridSplitterDrag(ganttInstance, container, requestedWidth, dragState.startCoverPx, delta);
			} else {
				applyColumnWidth(ganttInstance, container, dragState.columnName, dragState.startWidth + delta);
			}
			return;
		}
		setResizeCursor(!!detectHit(e));
	};

	const onMouseUp = () => {
		if (!dragState) {
			return;
		}
		dragState = null;
		if (options?.lockLayoutSync) {
			options.lockLayoutSync.active = false;
		}
		document.body.classList.remove('gantt-resize-dragging');
		setResizeCursor(false);
	};

	container.addEventListener('mousedown', onMouseDown);
	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mouseup', onMouseUp);

	return {
		destroy: () => {
			onMouseUp();
			container.removeEventListener('mousedown', onMouseDown);
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			setResizeCursor(false);
		},
	};
}

/** 响应式列宽 + 分隔线拖拽 + 容器 ResizeObserver，生产/项目排程 init 后调用 */
export function setupGanttViewportControls(ganttInstance: any, container: HTMLElement): GanttResizeController {
	let resizeTimer: ReturnType<typeof setTimeout> | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let useWindowResize = false;
	const dragLock = { active: false };

	const refreshLayout = () => {
		if (dragLock.active) {
			return;
		}
		applyGanttResponsiveLayout(ganttInstance, container);
		syncGanttDefaultGridPanelWidth(ganttInstance, container);
	};

	const onContainerResize = () => {
		if (dragLock.active) {
			return;
		}
		if (resizeTimer) {
			clearTimeout(resizeTimer);
		}
		resizeTimer = setTimeout(refreshLayout, 150);
	};

	const manualController = setupGanttManualResize(ganttInstance, container, { lockLayoutSync: dragLock });

	if (typeof ResizeObserver !== 'undefined') {
		resizeObserver = new ResizeObserver(onContainerResize);
		resizeObserver.observe(container);
	} else {
		useWindowResize = true;
		window.addEventListener('resize', onContainerResize);
	}

	return {
		destroy: () => {
			if (resizeTimer) {
				clearTimeout(resizeTimer);
			}
			resizeObserver?.disconnect();
			if (useWindowResize) {
				window.removeEventListener('resize', onContainerResize);
			}
			manualController.destroy();
		},
	};
}
