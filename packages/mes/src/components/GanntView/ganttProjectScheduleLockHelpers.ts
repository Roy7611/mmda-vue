import { TaskLevel } from '@mmda/base/src/enums/TaskLevel';
import { ManualTaskStatus, ManualTaskStatusEnum } from '@mmda/base/src/enums/ManualTaskStatus';

const LOCKED_STATUS_LABELS = new Set<string>([
	ManualTaskStatusEnum.FINISHED_TEXT,
	ManualTaskStatusEnum.CANCELLED_TEXT,
]);

/** const enum 不能 Object.values，显式列出用于数值/字符串反查 */
const MANUAL_TASK_STATUS_CODES: ManualTaskStatus[] = [
	ManualTaskStatus.NEW,
	ManualTaskStatus.SUBMITTED,
	ManualTaskStatus.RELEASED,
	ManualTaskStatus.STARTED,
	ManualTaskStatus.PAUSED,
	ManualTaskStatus.REWORKING,
	ManualTaskStatus.FINISHED,
	ManualTaskStatus.REVIEWED,
	ManualTaskStatus.CANCELLED,
];

const normalizeText = (raw: unknown): string | null => {
	if (raw == null || raw === '') {
		return null;
	}
	return String(raw).trim();
};

/** 从 task.status 枚举/数值解析中文状态（每条任务独立字段，可靠） */
const resolveStatusFromTaskStatusField = (rawStatus: unknown): string | null => {
	if (rawStatus == null || rawStatus === '') {
		return null;
	}
	if (typeof rawStatus === 'number' || (typeof rawStatus === 'string' && /^-?\d+$/.test(String(rawStatus).trim()))) {
		const num = Number(rawStatus);
		for (const code of MANUAL_TASK_STATUS_CODES) {
			if (ManualTaskStatusEnum.valueOf(code) === num) {
				return ManualTaskStatusEnum.textOf(code);
			}
		}
		return null;
	}
	const str = String(rawStatus).trim();
	if ((MANUAL_TASK_STATUS_CODES as string[]).includes(str)) {
		return ManualTaskStatusEnum.textOf(str as ManualTaskStatus);
	}
	return null;
};

/**
 * 同步 statusType / $status；两字段不一致时以 statusType（界面列）为准，避免 task.status 污染
 */
export const reconcileProjectScheduleTaskStatus = (task: any): void => {
	const fromStatus = resolveStatusFromTaskStatusField(task?.status);
	const fromType = normalizeText(task?.statusType);

	if (fromType != null && fromStatus != null && fromType !== fromStatus) {
		task.statusType = fromType;
		if (task.customProperties && typeof task.customProperties === 'object') {
			task.customProperties = { ...task.customProperties, $status: fromType };
		}
		return;
	}
	if (fromStatus != null) {
		task.statusType = fromStatus;
		if (task.customProperties && typeof task.customProperties === 'object') {
			task.customProperties = { ...task.customProperties, $status: fromStatus };
		}
		return;
	}
	if (fromType != null) {
		task.statusType = fromType;
		if (task.customProperties && typeof task.customProperties === 'object') {
			task.customProperties = { ...task.customProperties, $status: fromType };
		}
		return;
	}
	const fromCp = normalizeText(task?.customProperties?.$status);
	if (fromCp != null) {
		task.statusType = fromCp;
		if (task.customProperties && typeof task.customProperties === 'object') {
			task.customProperties = { ...task.customProperties, $status: fromCp };
		}
	}
};

/**
 * 界面展示状态（锁定判断、快照）
 * statusType 与 task.status 不一致时，以 statusType（用户所见）为准
 */
export const resolveProjectScheduleTaskDisplayStatus = (task: any): string | null => {
	const fromType = normalizeText(task?.statusType);
	const fromStatus = resolveStatusFromTaskStatusField(task?.status);
	if (fromType != null && fromStatus != null && fromType !== fromStatus) {
		return fromType;
	}
	return fromStatus ?? fromType;
};

export const resolveProjectScheduleTaskStatusType = (task: any): string | null =>
	resolveProjectScheduleTaskDisplayStatus(task);

export const applyProjectScheduleTaskStatusType = (task: any): void => {
	reconcileProjectScheduleTaskStatus(task);
};

export const isProjectScheduleEditableTask = (task: any): boolean => {
	if (task?.refName === 'ProductionTask') {
		return true;
	}
	return task?.refName === 'ProjectTask'
		&& (task.taskLevel === TaskLevel.PHASE
			|| task.taskLevel === TaskLevel.TASK
			|| task.taskLevel === TaskLevel.WORK_PACKAGE);
};

/** dhtmlx select/textarea 不识别 section.readonly，打开后统一禁用表单控件 */
export const lockProjectScheduleLightboxForm = (ganttInstance: any) => {
	const ganttAny = ganttInstance as any;
	// 勿用 _lightbox_root：非 CSP 环境下为 document.body，会误禁用页面上方筛选等控件
	const root = ganttAny.getLightbox?.();
	if (!root?.classList?.contains('gantt_cal_light')) {
		return;
	}
	root.querySelectorAll('select, textarea, input').forEach((el: Element) => {
		const control = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
		control.disabled = true;
		if (control instanceof HTMLTextAreaElement || control instanceof HTMLInputElement) {
			control.readOnly = true;
		}
	});
	root.classList.add('gantt_project_schedule_lightbox_readonly');
};

/** 已完成、已取消（仅以界面 statusType / 可信枚举为准，不用 customProperties.$status） */
export const isProjectScheduleTaskLocked = (task: any): boolean => {
	if (!isProjectScheduleEditableTask(task)) {
		return false;
	}
	const displayStatus = resolveProjectScheduleTaskDisplayStatus(task);
	if (displayStatus == null) {
		return false;
	}
	return LOCKED_STATUS_LABELS.has(displayStatus);
};

export const cloneProjectScheduleCustomProperties = (item: any): void => {
	if (item?.customProperties && typeof item.customProperties === 'object') {
		item.customProperties = { ...item.customProperties };
	}
};

/** 加载子任务：断开共享 customProperties 并以 task.status 同步 statusType */
export const prepareProjectScheduleLoadedTask = (item: any): void => {
	cloneProjectScheduleCustomProperties(item);
	reconcileProjectScheduleTaskStatus(item);
};

/** 清除 dhtmlx readonly（会在 onBeforeTaskDrag 之前拦截拖动，误设后整树不可拖） */
export const clearProjectScheduleTaskReadonly = (gantt: any): void => {
	gantt.eachTask(function (task: any) {
		if (task && task.readonly) {
			delete task.readonly;
		}
	});
};

/** 甘特图内已有数据：按 task.status 重新校正 statusType */
export const healProjectScheduleTaskStatusTypes = (gantt: any): void => {
	gantt.eachTask(function (task: any) {
		if (isProjectScheduleEditableTask(task)) {
			reconcileProjectScheduleTaskStatus(task);
		}
	});
};

export const healProjectScheduleGanttLockState = (gantt: any): void => {
	clearProjectScheduleTaskReadonly(gantt);
	healProjectScheduleTaskStatusTypes(gantt);
};

const snapshotOneTask = (task: any) => {
	const statusType = resolveProjectScheduleTaskDisplayStatus(task);
	return {
		id: task.id,
		taskID: task.taskID,
		projectID: task.projectID,
		start_date: task.start_date,
		end_date: task.end_date,
		duration: task.duration,
		expectedStart: task.expectedStart,
		expectedFinish: task.expectedFinish,
		status: task.status,
		statusType,
		taskColor: task.taskColor,
		customProperties: statusType != null
			? { ...(task.customProperties ?? {}), $status: statusType }
			: (task.customProperties ? { ...task.customProperties } : undefined),
	};
};

export const snapshotProjectScheduleOriData = (
	gantt: any,
	rootId: string | number,
	includeRoot = true
): string => {
	const orgList: any[] = [];
	if (!gantt.isTaskExists(rootId)) {
		return JSON.stringify(orgList);
	}
	if (includeRoot) {
		orgList.push(snapshotOneTask(gantt.getTask(rootId)));
	}
	gantt.eachTask(function (child: any) {
		orgList.push(snapshotOneTask(child));
	}, rootId);
	return JSON.stringify(orgList);
};

export const applyProjectScheduleTaskStatusFromSnapshot = (task: any, item: any): void => {
	const statusType = normalizeText(item?.statusType)
		?? resolveStatusFromTaskStatusField(item?.status);
	if (statusType != null) {
		task.statusType = statusType;
		if (task.customProperties) {
			task.customProperties = { ...task.customProperties, $status: statusType };
		}
	}
	const enumFromSnapshot = resolveStatusFromTaskStatusField(item?.status);
	if (enumFromSnapshot != null) {
		task.status = item.status;
	}
};

export const PROJECT_SCHEDULE_TASK_LOCKED_CLASS = 'gantt_task_locked';

const getGanttTasksDnd = (gantt: any): any =>
	gantt?.$ui?.getView?.('timeline')?._tasks_dnd ?? gantt?._tasks_dnd ?? null;

/** drag_project 启动时从 dragMultiple 移除已完成/已取消子任务，避免被 dhtmlx 联动拖动 */
export const removeLockedProjectScheduleTasksFromDragMultiple = (gantt: any): void => {
	const dnd = getGanttTasksDnd(gantt);
	if (!dnd?.dragMultiple) {
		return;
	}
	const dragId = dnd.drag?.id != null ? String(dnd.drag.id) : null;
	for (const taskId of Object.keys(dnd.dragMultiple)) {
		if (dragId != null && taskId === dragId) {
			continue;
		}
		if (!gantt.isTaskExists(taskId)) {
			delete dnd.dragMultiple[taskId];
			continue;
		}
		if (isProjectScheduleTaskLocked(gantt.getTask(taskId))) {
			delete dnd.dragMultiple[taskId];
		}
	}
};

/** onTaskDrag 第三个参数 copy2：锁定任务还原为拖动前日期 */
export const restoreLockedProjectScheduleTaskDragCopy = (
	task: any,
	id: string | number,
	original: any,
	gantt: any,
): void => {
	if (!isProjectScheduleTaskLocked(gantt.getTask(id))) {
		return;
	}
	task.start_date = new Date(original.start_date);
	task.end_date = new Date(original.end_date);
	if (original.duration != null) {
		task.duration = original.duration;
	}
};

/** 父级拖动时，将子树内锁定任务还原为 oriData 快照日期 */
export const restoreLockedProjectScheduleChildrenFromSnapshot = (
	gantt: any,
	rootId: string | number,
	oriDataJson: string,
): void => {
	if (!oriDataJson) {
		return;
	}
	let orgList: any[];
	try {
		orgList = JSON.parse(oriDataJson);
	} catch {
		return;
	}
	const byId = new Map(orgList.map((item: any) => [String(item.id), item]));
	gantt.eachTask(function (child: any) {
		if (!isProjectScheduleTaskLocked(child)) {
			return;
		}
		const snap = byId.get(String(child.id));
		if (!snap) {
			return;
		}
		child.start_date = new Date(snap.start_date);
		child.end_date = new Date(snap.end_date);
		child.duration = gantt.calculateDuration(child.start_date, child.end_date);
		if (snap.expectedStart != null) {
			child.expectedStart = snap.expectedStart;
		}
		if (snap.expectedFinish != null) {
			child.expectedFinish = snap.expectedFinish;
		}
		gantt.refreshTask(child.id, true);
	}, rootId);
};

/** drag_project 已联动子任务时，跳过 onTaskDrag 内二次位移 */
export const shouldSkipProjectScheduleChildCascade = (gantt: any, taskId: string | number): boolean => {
	if (!gantt.config.drag_project || !gantt.isTaskExists(taskId)) {
		return false;
	}
	return gantt.isSummaryTask(gantt.getTask(taskId));
};
