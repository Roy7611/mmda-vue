import { reactive, ref } from 'vue';
//更新后的taskdata
export const taskData = reactive({
	data: {
		
	} as any,
});
//获取更新的数据
export const getTaskData = (value: any) => {
	return (taskData.data = value);
};

//更新后的taskdata
export const linkRes = reactive({
	data: false as boolean,
});
//获取更新的数据
export const getLinkRes = (value: boolean) => {
	return (linkRes.data = value);
};

//日计划结果
export const planRes = reactive({
	data: false as boolean,
});
//获取更新的数据
export const getPlanRes = (value: boolean) => {
	return (planRes.data = value);
};

//分解
export const breakRes = reactive({
	data: false as boolean,
});
//获取更新的数据
export const getBreaks = (value: boolean) => {
	return (breakRes.data = value);
};

//获取子集
export const proSub = reactive({
	data: {
		deleteID: null,
		subList: [],
		subLinkList:[],
	},
});
//获取更新的数据
export const getProSub = (value: any) => {
	return (proSub.data = value);
};



//获取更新数据
export const reflashData = reactive({
	data: []
});
//获取更新的数据
export const getReflash = (value: any) => {
	return (reflashData.data = value);
};



//获取更新数据
export const reloadData = reactive({
	data: {
		tasks:[],
		links:[],
	}
});
//获取更新的数据
export const getReload = (value: any) => {
	return (reloadData.data = value);
};

