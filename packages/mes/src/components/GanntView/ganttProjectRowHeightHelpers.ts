/** 项目排程 / 生产排程(按项目)：行高随内容，上下留白略增（不影响按订单模式） */
export const GANTT_PROJECT_SCHEDULE_DEFAULT_ROW_HEIGHT = 38;
export const GANTT_PROJECT_SCHEDULE_ROW_PAD_Y = 7;
export const GANTT_PROJECT_SCHEDULE_ROW_PADDING = GANTT_PROJECT_SCHEDULE_ROW_PAD_Y * 2;
export const GANTT_PROJECT_SCHEDULE_ROW_MIN = 38;
export const GANTT_PROJECT_SCHEDULE_LINE_HEIGHT = 18;
export const GANTT_PROJECT_SCHEDULE_CHARS_PER_LINE = 34;

export const getGanttProjectTaskDisplayName = (task: any) =>
	task?.projectName ?? task?.productName ?? task?.text ?? '';

export const shouldApplyGanttProjectTaskRowHeight = (task: any) => {
	if (!task) {
		return false;
	}
	if (task.refName === 'loadMore' || task.taskLevel === 'loadMore') {
		return true;
	}
	const id = String(task.id ?? '');
	if (id.endsWith('_1') && task.refName !== 'ProjectTask' && !task.taskID) {
		return false;
	}
	return true;
};

/** 项目排程单行（暂无数据 / 短名称） */
export const isGanttProjectSingleLineRow = (task: any) => {
	if (!task) {
		return false;
	}
	if (task.refName === 'loadMore' || task.taskLevel === 'loadMore') {
		return true;
	}
	const name = getGanttProjectTaskDisplayName(task);
	return name.length <= GANTT_PROJECT_SCHEDULE_CHARS_PER_LINE;
};

export const estimateGanttProjectTaskRowHeight = (task: any) => {
	if (!shouldApplyGanttProjectTaskRowHeight(task)) {
		return null;
	}
	if (isGanttProjectSingleLineRow(task)) {
		return GANTT_PROJECT_SCHEDULE_ROW_MIN;
	}
	const name = getGanttProjectTaskDisplayName(task);
	const lines = Math.max(1, Math.ceil(name.length / GANTT_PROJECT_SCHEDULE_CHARS_PER_LINE));
	const bodyHeight = lines * GANTT_PROJECT_SCHEDULE_LINE_HEIGHT;
	return Math.max(GANTT_PROJECT_SCHEDULE_ROW_MIN, bodyHeight + GANTT_PROJECT_SCHEDULE_ROW_PADDING);
};

export const measureGanttProjectRowHeightFromDom = (row: HTMLElement) => {
	let contentHeight = 0;

	const nameCell =
		(row.querySelector('.gantt_cell[data-column-name="projectName"]') as HTMLElement | null) ??
		(row.querySelector('.gantt_cell:nth-child(2)') as HTMLElement | null);
	if (nameCell) {
		const treeContent = nameCell.querySelector('.gantt_tree_content') as HTMLElement | null;
		if (treeContent) {
			const statusWrap = treeContent.querySelector('.errorImportant, .waringImportant') as HTMLElement | null;
			const measureTarget = statusWrap ?? treeContent;
			contentHeight = Math.max(contentHeight, Math.ceil(measureTarget.offsetHeight));
		}
	}

	const typeBadge = row.querySelector('.gantt_cell:nth-child(1) .gantt_tree_content') as HTMLElement | null;
	if (typeBadge) {
		contentHeight = Math.max(contentHeight, Math.ceil(typeBadge.offsetHeight));
	}

	return contentHeight + GANTT_PROJECT_SCHEDULE_ROW_PADDING;
};

export const applyGanttProjectTaskRowHeight = (task: any) => {
	if (!shouldApplyGanttProjectTaskRowHeight(task)) {
		delete task.row_height;
		return;
	}
	const estimated = estimateGanttProjectTaskRowHeight(task);
	if (estimated != null) {
		task.row_height = estimated;
	}
};

export const measureAndSyncGanttProjectRowHeights = (ganttInstance: any) => {
	let changed = false;
	ganttInstance.eachTask((task: any) => {
		if (!shouldApplyGanttProjectTaskRowHeight(task)) {
			delete task.row_height;
			return;
		}
		const row = ganttInstance.getTaskRowNode(task.id) as HTMLElement | null;
		if (!row) {
			return;
		}
		const measured = measureGanttProjectRowHeightFromDom(row);
		const newHeight = isGanttProjectSingleLineRow(task)
			? GANTT_PROJECT_SCHEDULE_ROW_MIN
			: Math.max(GANTT_PROJECT_SCHEDULE_ROW_MIN, measured);
		const current = task.row_height ?? ganttInstance.config.row_height;
		if (Math.abs(current - newHeight) > 1) {
			task.row_height = newHeight;
			changed = true;
		}
	});
	return changed;
};

export const runGanttProjectRowHeightSync = (
	ganttInstance: any,
	nextTick: (fn: () => void) => void
) => {
	const applyAll = () => {
		ganttInstance.eachTask((task: any) => {
			applyGanttProjectTaskRowHeight(task);
		});
	};
	if (typeof ganttInstance.batchUpdate === 'function') {
		ganttInstance.batchUpdate(applyAll);
	} else {
		applyAll();
	}
	ganttInstance.render();
	nextTick(() => {
		let pass = 0;
		const remeasure = () => {
			if (pass >= 4) {
				return;
			}
			const changed = measureAndSyncGanttProjectRowHeights(ganttInstance);
			if (changed) {
				pass += 1;
				ganttInstance.render();
				nextTick(remeasure);
			}
		};
		remeasure();
	});
};
