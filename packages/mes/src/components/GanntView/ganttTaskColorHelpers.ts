const normalizeGanttTaskColorKey = (value: unknown): string | null => {
	if (value == null || value === '') {
		return null;
	}
	const normalized = String(value).trim().replace(/^#/, '');
	return normalized || null;
};

/** 从打开 lightbox 前的快照读取 taskColor */
export const resolveGanttTaskColorFromSnapshot = (
	oriDataJson: string,
	taskId: string | number,
): string | null => {
	if (!oriDataJson) {
		return null;
	}
	try {
		const orgList: any[] = JSON.parse(oriDataJson);
		const snap = orgList.find((item: any) => String(item.id) === String(taskId));
		return normalizeGanttTaskColorKey(snap?.taskColor) ?? normalizeGanttTaskColorKey(snap?.color);
	} catch {
		return null;
	}
};

/** 优先快照，其次甘特内尚未写入 lightbox 的 task 数据 */
export const resolveGanttTaskOriginalColor = (
	oriDataJson: string,
	taskId: string | number,
	persistedTask: any | null | undefined,
): string | null => {
	return resolveGanttTaskColorFromSnapshot(oriDataJson, taskId)
		?? normalizeGanttTaskColorKey(persistedTask?.taskColor)
		?? normalizeGanttTaskColorKey(persistedTask?.color);
};

/** lightbox 下拉未匹配到颜色时，保留任务原有颜色，避免保存后覆盖为默认/空值 */
export const preserveGanttTaskColorIfLightboxEmpty = (
	task: any,
	originalTaskColor: string | null | undefined,
): void => {
	if (!task) {
		return;
	}
	const incoming = normalizeGanttTaskColorKey(task.taskColor);
	if (incoming) {
		task.taskColor = incoming;
		task.color = `#${incoming}`;
		return;
	}
	const original = normalizeGanttTaskColorKey(originalTaskColor);
	if (!original) {
		return;
	}
	task.taskColor = original;
	task.color = `#${original}`;
};
