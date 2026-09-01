import { defineComponent, defineProps, ref, Ref, nextTick, reactive, h, onMounted, getCurrentInstance, watch, onUnmounted, onActivated, onBeforeMount, unref, computed, toRefs } from 'vue';
import { isRefNone, type ApiClient } from '@mmda/core';
import { useRouter } from 'vue-router';
import { label } from '@mmda/vui';
import { get } from 'http';
import { build } from 'vite';
import '@/compat/animate.min.css';
import { uiBuilder } from '@/mes';
import { emit } from 'process';

export default defineComponent({
	name: 'ChooseWbs',
	emits: ['changeData'],
	// props: ['dataModel', 'ctx'],
	// props: {
	// 	dataModel: Object as any,
	// 	ctx: Object as any,
	// },
	// emits: {
	// 	changeDateTime: (val: any) => val,
	// },
	setup(props, ctx) {
		// const ganttBox = ref();

		const apiBox = getCurrentInstance().appContext.app.config.globalProperties.$api as ApiClient;
		const { $ui: ui, $t, appContext } = getCurrentInstance().appContext.app.config.globalProperties;
		// const submitModel = reactive({
		// 	data: {
		// 		refID: '',
		// 		refName: '',
		// 	},
		// });

		const submitModel = reactive({
			refID: '',
			refName: '',
		});
		//最终提交前处理的方法
		const submitFun = () => {
			ctx.emit('changeData', submitModel);
		};

		//人员下拉选择
		const userOptionsAll = ref([]);

		// //搜索人员
		// const remoteUserMethod = (query: string) => {
		// 	if (query != '') {
		// 		getUser(query);
		// 	} else {
		// 		getUser('');
		// 	}
		// };
		const userPageInfo = reactive({
			searchWord: '',
		});
		//获得项目
		const getUser = async (query: any) => {
			try {
				let res = null;
				if (query) {
					userPageInfo.searchWord = query;
				} else {
					userPageInfo.searchWord = '';
				}
				res = await apiBox.getAll({
					repository: 'Wbses',
					queryParams: { ...userPageInfo },
					service: 'mes',
				});
				if (res.list && res.list.length > 0) {
					userOptionsAll.value = [];
					if (!query) {
						userOptionsAll.value = res.list;
						// .map((item: any) => {
						// 	return {
						// 		refID: `${item.wbsID}`,
						// 		refName: `${item.wbsName}`,
						// 		label: `${item.wbsName} `,
						// 	};
						// });
					}
				} else {
					userOptionsAll.value = [];
				}
			} catch (error: any) {
				appContext.uiBuilder.toast({
					severity: 'error',
					title: $t('dialog.title.error'),
					summary: error.detail ?? '',
					group: 'br',
					life: 3000,
				});
				return false;
			}
		};
		const selectModel = ref();
		//选中
		const userChange = (event: any) => {
			submitModel.refID = event.wbsID;
			submitModel.refName = event.refName;
			submitFun();
		};

		onBeforeMount(async () => {
			// submitModel.refID = props.dataModel.refID;
			// submitModel.refName = props.dataModel.refName
			// console.log(' props.dataModel', props.dataModel);
			//获取默认的选择用户列表
			await getUser('');
		});
		onMounted(() => {
			// console.log('props', props);
			// console.log(ui, 'ui');
		});
		return () => (
			<div class="w-full box-border">
				{/*选择 */}
				<div class="w-full flex pt-2 pb-2 box-border">
					<div class="w-full flex items-center box-border">
						{/* <div class="w-1/3 p-1 box-border">
							<span class="text-red-500">*</span>
							{$t('auth.selectAUser')}:
						</div> */}
						<div class="w-full p-1 box-border  flex items-center flex_center ">
							{userOptionsAll.value.length > 0 ? ui.factory.select({
								labelStyle: { textAlign: 'left' },
								id: 'refID',
								class: 'w-full',
								showClear: submitModel.refName !== '' ? true : false,
								// filter: true,
								placeholder: $t('invalid.selectWbs'),
								modelValue: selectModel.value,
								options: userOptionsAll.value,
								onUpdate: (value: any) => {
									selectModel.value = value;
								},
								//(submitModel.data.refName = value)
								optionLabel: 'wbsName',
								onChange: userChange,
							}) : 'loading...'}
							{/* {
								submitModel.data.ownerInvalid ? <div class='text-left text-sm text-red-400'>
									{$t('invalid.requiredSelectAny')}
								</div> : <div></div>
							} */}
						</div>
					</div>
				</div>
			</div>
		);
	},
});
