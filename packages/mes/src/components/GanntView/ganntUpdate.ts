/*
 * 甘特「更新后的数据」中转盒子。
 *
 * 原先是 Vue 的 `reactive`（给旧甘特组件当响应式源）；甘特页已改成框架无关视图 +
 * 命令式 `UiGanttController`，这里回落到普通对象 —— 只是 Logic 之间传值，无响应式需求。
 */

/** 更新后的 task 数据。 */
export const taskData = {
	data: {} as any,
};

/** 写入更新后的 task 数据。 */
export const getTaskData = (value: any) => {
	return (taskData.data = value);
};

/** 更新后的 link 结果。 */
export const linkRes = {
	data: false as boolean,
};

/** 写入更新后的 link 结果。 */
export const getLinkRes = (value: boolean) => {
	return (linkRes.data = value);
};

/** 日计划结果。 */
export const planRes = {
	data: false as boolean,
};

/** 写入日计划结果。 */
export const getPlanRes = (value: boolean) => {
	return (planRes.data = value);
};

/** 分解结果。 */
export const breakRes = {
	data: false as boolean,
};

/** 写入分解结果。 */
export const getBreaks = (value: boolean) => {
	return (breakRes.data = value);
};

/** 子集（分解出来的子任务）。 */
export const proSub = {
	data: {
		subList: [] as any[],
		subLinkList: [] as any[],
	},
};

/** 写入子集。 */
export const getProSub = (value: any) => {
	return (proSub.data = value);
};
