import { defineComponent, defineProps, ref, Ref, nextTick, reactive, h, onMounted, getCurrentInstance, watch, onUnmounted, onActivated, onBeforeMount, unref, computed, toRefs, Suspense } from 'vue';
import { isRefNone, type ApiClient } from '@mmda/core';
import { useRouter } from 'vue-router';
import { label, UI_CREATE } from '@mmda/vui';
import { get } from 'http';
import { build } from 'vite';
import '@mmda/vui-primevue/src/assets/animate.min.css';
import { uiBuilder } from '@/mes';
import { emit } from 'process';
import ProjectTaskEditor from '@/modules/project_tasks/ProjectTaskEditor';

export default defineComponent({
	name: 'ProjectGanttAdd',
	emits: ['saveUpData', 'cannelUpData'],
	// props: ['dataModel', 'ctx'],
	props: {
		gantt: Object as any,
		ctx: Object as any,
	},

	setup(props, ctx) {
		const apiBox = getCurrentInstance().appContext.app.config.globalProperties.$api as ApiClient;
		const { $ui: ui, $t, appContext } = getCurrentInstance().appContext.app.config.globalProperties;
		const projectTaskCreate = ref();
	
		//最终提交前处理的方法
		const submitUpFun = () => {
			ctx.emit('saveUpData', submitModel);
		};
		const cannelUpFun =  () => {
			ctx.emit('cannelUpData', 'false');
		};

		const submitModel = reactive({
			data: {},
		});
		const display = ref( true )
		

		//获得人员
		// const getUser = async (query: any) => {
		// 	try {
		// 		let res = null;
		// 		if (query) {
		// 			userPageInfo.searchWord = query;
		// 		} else {
		// 			userPageInfo.searchWord = '';
		// 		}
		// 		res = await apiBox.getAll({
		// 			repository: 'Users',
		// 			queryParams: { ...userPageInfo, deptID: "150" },
		// 			service: 'base',
		// 		});
		// 		if (res.list && res.list.length > 0) {
		// 			userOptionsAll.value = [];
		// 			if (!query) {
		// 				userOptionsAll.value = res.list.map((item: any) => {
		// 					return {
		// 						ownerID: `${item.userID}`,
		// 						userName: `${item.username}`,
		// 						label: `姓名:${item.username ?? ''}     部门:${item.customProperties.$deptID ?? ''}     手机:${item.mobile ?? ''}`,
		// 						deptName: `${item.customProperties.$deptID ?? ''}`,
		// 						deptID: `${item.deptID ?? ''}`,
		// 						mobile: `${item.mobile}`,
		// 					};
		// 				});
		// 			}
		// 		} else {
		// 			userOptionsAll.value = [];
		// 		}
		// 	} catch (error: any) {
		// 		appContext.uiBuilder.toast({
		// 			severity: 'error',
		// 			title: $t('dialog.title.error'),
		// 			summary: error.detail ?? '',
		// 			life: 3000,
		// 		});
		// 		return false;
		// 	}
		// };
		onBeforeMount(() => { });
		onMounted(() => {
		});
		let logicData = null as any
		return () =>{
				props.ctx.uiBuilder.confirmDialog(
					h(
						Suspense,
						{},
						{
							default: h(ProjectTaskEditor, {
								id: '_',
								view: UI_CREATE,
								gantt: props.gantt ?? null,
								onChange: (logic:any) => {
									logicData = logic
								}
							}),
						}
					),
					props.ctx,
					{
						title: '创建',
						width: '80%',
						// showFooter: false,
						visible: display.value,
						accept: async () => {
							// console.log(context, '1111');
							submitModel.data = await logicData.getSave()
						}
					}
				);
		}
			
	},
});
