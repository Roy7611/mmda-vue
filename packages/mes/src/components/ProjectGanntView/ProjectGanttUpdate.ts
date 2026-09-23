/*
 * 项目排产甘特「更新后的数据」中转盒子。
 *
 * 同 `GanntView/ganntUpdate.ts`：原先是 Vue 的 `reactive`，页面改框架无关视图后
 * 回落到普通对象（只做 Logic 之间的传值）。
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
		deleteID: null as string | null,
		subList: [] as any[],
		subLinkList: [] as any[],
	},
};

/** 写入子集。 */
export const getProSub = (value: any) => {
	return (proSub.data = value);
};

/** 刷新出的数据。 */
export const reflashData = {
	data: [] as any[],
};

/** 写入刷新出的数据。 */
export const getReflash = (value: any) => {
	return (reflashData.data = value);
};

/** 需要重载的甘特数据。 */
export const reloadData = {
	data: {
		tasks: [] as any[],
		links: [] as any[],
	},
};

/** 写入需要重载的甘特数据。 */
export const getReload = (value: any) => {
	return (reloadData.data = value);
};
