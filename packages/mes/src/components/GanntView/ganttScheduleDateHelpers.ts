/** 排程甘特图日期：统一按当天 00:00:00 处理（含历史 23:59:59 数据归一化） */

export function normalizeScheduleDateTime(value?: string | Date | null): Date | null {
	if (!value) {
		return null;
	}
	const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return null;
	}
	date.setHours(0, 0, 0, 0);
	return date;
}

export function formatScheduleDateTime(value: Date): string {
	return value.toFormat('yyyy-MM-dd HH:mm:ss');
}

export function normalizeScheduleDateTimeString(value?: string | Date | null): string | undefined {
	const date = normalizeScheduleDateTime(value);
	return date ? formatScheduleDateTime(date) : undefined;
}

type GanttDurationCalculator = {
	calculateDuration: (start: Date, end: Date) => number;
};

/** 将 API 任务行的计划起止时间归一化并写入甘特图 start_date / end_date */
export function applyScheduleGanttTaskDates(item: any, ganttRef?: GanttDurationCalculator): void {
	const startDate = normalizeScheduleDateTime(item.expectedStart ?? item.start_date);
	const endDate = normalizeScheduleDateTime(item.expectedFinish ?? item.end_date);

	if (startDate) {
		item.start_date = startDate;
		item.expectedStart = formatScheduleDateTime(startDate);
	}
	if (endDate) {
		item.end_date = endDate;
		item.expectedFinish = formatScheduleDateTime(endDate);
	}
	if (startDate && endDate && ganttRef) {
		item.duration = ganttRef.calculateDuration(startDate, endDate);
	} else if (item.expectedDuration != null && item.duration == null) {
		item.duration = item.expectedDuration;
	}
}

/** 甘特图 parse 后再次归一化全部任务日期（按订单视图兜底） */
export function syncScheduleGanttTaskDates(
	ganttRef: GanttDurationCalculator & { eachTask: (callback: (task: any) => void) => void },
): void {
	ganttRef.eachTask((task: any) => {
		applyScheduleGanttTaskDates(task, ganttRef);
	});
}

/** 将甘特图 start_date/end_date 写回 expectedStart/expectedFinish（00:00:00） */
export function persistScheduleGanttTaskExpectedDates(task: any, ganttRef?: GanttDurationCalculator): void {
	const startDate = normalizeScheduleDateTime(task.start_date);
	const endDate = normalizeScheduleDateTime(task.end_date);
	if (startDate) {
		task.start_date = startDate;
		task.expectedStart = formatScheduleDateTime(startDate);
	}
	if (endDate) {
		task.end_date = endDate;
		task.expectedFinish = formatScheduleDateTime(endDate);
	}
	if (startDate && endDate && ganttRef) {
		task.duration = ganttRef.calculateDuration(startDate, endDate);
	}
}
