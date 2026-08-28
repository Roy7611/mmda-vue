import { Urgency, UrgencyEnum } from '@mmda/base/src/enums/Urgency';

/** 紧急 → 优先 → 普通（数值越小越靠前） */
const URGENCY_SORT_RANK: Record<string, number> = {
	[Urgency.URGENT]: 0,
	[Urgency.SENIOR]: 1,
	[Urgency.NORMAL]: 2,
};

const URGENCY_LABEL_TO_CODE: Record<string, Urgency> = {
	[UrgencyEnum.URGENT_TEXT]: Urgency.URGENT,
	[UrgencyEnum.SENIOR_TEXT]: Urgency.SENIOR,
	[UrgencyEnum.NORMAL_TEXT]: Urgency.NORMAL,
};

const URGENCY_CODES: Urgency[] = [Urgency.NORMAL, Urgency.SENIOR, Urgency.URGENT];

const normalizeOrderScheduleParentKey = (parent: unknown): string => {
	if (parent === undefined || parent === null || parent === '' || parent === 0 || parent === '0') {
		return '0';
	}
	return String(parent);
};

/** 解析优先级排序权重：紧急(0) < 优先(1) < 普通(2) < 未知(99) */
export const resolveOrderSchedulePriorityRank = (task: any): number => {
	let code: Urgency | undefined;
	const raw = task?.priority;
	if (raw != null && raw !== '') {
		const str = String(raw).trim();
		if ((URGENCY_CODES as string[]).includes(str)) {
			code = str as Urgency;
		} else if (/^-?\d+$/.test(str)) {
			const num = Number(str);
			for (const urgency of URGENCY_CODES) {
				if (UrgencyEnum.valueOf(urgency) === num) {
					code = urgency;
					break;
				}
			}
		}
	}
	if (!code) {
		const label = String(task?.customProperties?.$priority ?? '').trim();
		if (label) {
			code = URGENCY_LABEL_TO_CODE[label];
		}
	}
	if (code != null && URGENCY_SORT_RANK[code] != null) {
		return URGENCY_SORT_RANK[code];
	}
	return 99;
};

/** 同优先级按计划开始时间升序；无开始时间排后 */
export const resolveOrderScheduleSortTime = (task: any): number => {
	const raw = task?.expectedStart ?? task?.start_date;
	if (raw == null || raw === '') {
		return Number.MAX_SAFE_INTEGER;
	}
	const time = new Date(raw).getTime();
	return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
};

export const compareOrderScheduleGanttTasks = (a: any, b: any): number => {
	const priorityDiff = resolveOrderSchedulePriorityRank(a) - resolveOrderSchedulePriorityRank(b);
	if (priorityDiff !== 0) {
		return priorityDiff;
	}
	const timeDiff = resolveOrderScheduleSortTime(a) - resolveOrderScheduleSortTime(b);
	if (timeDiff !== 0) {
		return timeDiff;
	}
	return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
};

const toGanttSortComparator = (a: any, b: any): -1 | 0 | 1 => {
	const diff = compareOrderScheduleGanttTasks(a, b);
	if (diff < 0) {
		return -1;
	}
	if (diff > 0) {
		return 1;
	}
	return 0;
};

/** parse 前：按父子层级重排扁平任务数组（仅重排同级兄弟） */
export const sortOrderScheduleGanttFlatData = (data: any[]): any[] => {
	if (!data?.length) {
		return data;
	}
	const idSet = new Set(data.map((item) => String(item.id)));
	const byParent = new Map<string, any[]>();

	for (const item of data) {
		let parentKey = normalizeOrderScheduleParentKey(item.parent);
		if (parentKey !== '0' && !idSet.has(parentKey)) {
			parentKey = '0';
		}
		if (!byParent.has(parentKey)) {
			byParent.set(parentKey, []);
		}
		byParent.get(parentKey)!.push(item);
	}

	for (const children of byParent.values()) {
		children.sort(compareOrderScheduleGanttTasks);
	}

	const result: any[] = [];
	const visited = new Set<string>();
	const walk = (parentKey: string) => {
		const children = byParent.get(parentKey) ?? [];
		for (const child of children) {
			const id = String(child.id);
			if (visited.has(id)) {
				continue;
			}
			visited.add(id);
			result.push(child);
			walk(id);
		}
	};
	walk('0');

	for (const item of data) {
		const id = String(item.id);
		if (!visited.has(id)) {
			result.push(item);
		}
	}
	return result;
};

/** parse / 增删子任务后：按优先级+时间重排甘特图同级行 */
export const applyOrderScheduleGanttDefaultSort = (ganttInstance: any) => {
	if (!ganttInstance?.sort) {
		return;
	}
	ganttInstance.sort(toGanttSortComparator, false, undefined, true);
};
