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
	name: 'Notice',
	emits: ['changeData'],
	// props: ['dataModel', 'ctx'],
	props: {
		dataModel: Object as any,
		ctx: Object as any
	},
	// emits: {
	// 	changeDateTime: (val: any) => val,
	// },
	setup(props, ctx) {
		// const ganttBox = ref();

		const apiBox = getCurrentInstance().appContext.app.config.globalProperties.$api as ApiClient;
		const { $ui: ui, $t, appContext } = getCurrentInstance().appContext.app.config.globalProperties;

		//最终提交前处理的方法
		const submitFun = () => {
			ctx.emit('changeData', submitModel);
		};
		const submitModel = reactive({
			data: {
				ownerID: '',
				ownerName: '',
				ownerInvalid: false, //显示用 是否选择了用户
				ownerDeptID: '',
				ownerDeptName: '',
				importance: 'UNKNOWN', //重要性
				urgency: 'NORMAL', //紧急性
				notification: '', //待办事宜
				copyTo: [], //通知给
				copyToInvalid: false, //是否选择了 通知给谁。
			},
		});
		//重要性
		const inspectedList = [
			{
				id: 0,
				value: 'UNKNOWN',
				text: '-',
			},
			{
				id: 1,
				value: 'IMPORTANT',
				text: $t('notice.important'),
			},
			{
				id: 2,
				value: 'VERY_IMPORTANT',
				text: $t('notice.veryImportant'),
			},
		];
		//紧急性
		const emergencyList = [
			{
				id: 0,
				value: 'NORMAL',
				text: $t('notice.normal'),
			},
			{
				id: 1,
				value: 'SENIOR',
				text: $t('notice.priority'),
			},
			{
				id: 2,
				value: 'URGENT',
				text: $t('notice.urgent'),
			},
		];
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
			status: 'GTEQ NEW',
		});
		//获得人员
		const getUser = async (query: any) => {
			try {
				let res = null;
				if (query) {
					userPageInfo.searchWord = query;
				} else {
					userPageInfo.searchWord = '';
				}
				res = await apiBox.getAll({
					repository: 'Users',
					queryParams: { ...userPageInfo, deptID: "150" },
					service: 'base',
				});
				if (res.list && res.list.length > 0) {
					userOptionsAll.value = [];
					if (!query) {
						userOptionsAll.value = res.list.map((item: any) => {
							return {
								ownerID: `${item.userID}`,
								userName: `${item.username}`,
								label: $t('notice.personDetail', {
									name: item.username ?? '',
									department: item.customProperties.$deptID ?? '',
									mobile: item.mobile ?? '',
								}),
								deptName: `${item.customProperties.$deptID ?? ''}`,
								deptID: `${item.deptID ?? ''}`,
								mobile: `${item.mobile}`,
							};
						});
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
		//人员选中
		const userChange = (event: any) => {
			submitModel.data.ownerDeptName = isRefNone(event.value) ? '' : event.value.deptName;
			submitModel.data.ownerID = isRefNone(event.value) ? '' : event.value.ownerID;
			submitModel.data.ownerDeptID = isRefNone(event.value) ? '' : event.value.deptID;
			if (submitModel.data.ownerID) {
				submitModel.data.ownerInvalid = false;
			}
			else {
				submitModel.data.ownerInvalid = true;
			}
			submitFun();
		};
		//重要性
		const importanceChange = (event: any) => {
			console.log('event', event);
			submitModel.data.importance = isRefNone(event.value) ? '' : event.value;
			submitFun();
		};
		//紧急性
		const urgencyChange = (event: any) => {
			console.log('event', event);
			submitModel.data.urgency = isRefNone(event.value) ? '' : event.value;
			submitFun();
		};

		onBeforeMount(() => {
			submitModel.data = props.dataModel;
			console.log('submitModel.data', submitModel.data);
			//获取默认的选择用户列表
			getUser('');
		});
		onMounted(() => {
			console.log('props', props);
			console.log(ui, 'ui');

		});
		return () => (
			<div class="w-full box-border">
				{/*选择用户 人员 */}
				<div class="w-full flex pt-2 pb-2 box-border">
					<div class="w-1/2 flex items-center box-border">
						<div class="w-1/3 p-1 box-border">
							<span class="text-red-500">*</span>
							{$t('auth.selectAUser')}:
						</div>
						<div class="w-2/3 p-1 box-border">
							{ui.factory.select({
								labelStyle: { textAlign: 'left' },
								id: 'ownerName',
								class: 'w-full',
								invalid: submitModel.data.ownerInvalid,
								showClear: submitModel.data.ownerName !== '' ? true : false,
								filter: true,
								placeholder: $t('auth.selectAUser'),
								modelValue: submitModel.data.ownerName,
								options: userOptionsAll.value,
								onUpdate: (value: string) => (submitModel.data.ownerName = value),
								optionLabel: 'label',
								onChange: userChange,
							})}
							{
								submitModel.data.ownerInvalid ? <div class='text-left text-sm text-red-400'>
									{$t('invalid.requiredSelectAny')}
								</div> : <div></div>
							}
						</div>
					</div>
					<div class="w-1/2 flex items-center box-border">
						<div class="w-1/3 p-1 box-border">
							<span class="text-red-500">*</span>
							{$t('auth.department')}:
						</div>
						<div class="w-2/3 p-1 box-border flex justify-start">{submitModel.data.ownerDeptName}</div>
					</div>
				</div>
				{/*重要性  普通型 */}
				<div class="w-full flex pt-2 pb-2 box-border">
					<div class="w-1/2 flex items-center box-border">
						<div class="w-1/3 p-1 box-border">
							<span class="text-red-500">*</span>
							{$t('auth.importance')}:
						</div>
						<div class="w-2/3 p-1 box-border">
							{ui.factory.select({
								labelStyle: { textAlign: 'left' },
								id: 'importance',
								class: 'w-full',
								modelValue: submitModel.data.importance,
								options: inspectedList,
								onUpdate: (value: string) => {
									submitModel.data.importance = value;
								},
								optionLabel: 'text',
								optionValue: 'value',
								onChange: importanceChange,
							})}
						</div>
					</div>
					<div class="w-1/2 flex items-center box-border">
						<div class="w-1/3 p-1 box-border">
							<span class="text-red-500">*</span>
							{$t('auth.urgency')}:
						</div>
						<div class="w-2/3 p-1 flex justify-start box-border">
							{ui.factory.select({
								labelStyle: { textAlign: 'left' },
								id: 'urgency',
								class: 'w-full',
								modelValue: submitModel.data.urgency,
								options: emergencyList,
								onUpdate: (value: string) => {
									submitModel.data.urgency = value;
								},
								optionLabel: 'text',
								optionValue: 'value',
								onChange: urgencyChange,
							})}
						</div>
					</div>
				</div>

				{/*通知给  待办事宜*/}
				<div class="w-full flex pt-2 pb-2 box-border">
					<div class="w-1/2 flex items-center box-border">
						<div class="w-1/3 p-1 box-border">
							<span class="text-red-500">*</span>
							{$t('auth.copyTo')}:
						</div>
						<div class="w-2/3 p-1 box-border">
							{ui.factory.multiSelect({
								labelStyle: { textAlign: 'left' },
								showClear: true,
								editable: true,
								filter: true,
								invalid: submitModel.data.copyToInvalid,
								display: 'chip',
								placeholder: $t('auth.copyTo'),
								optionLabel: 'label',
								optionValue: 'ownerID',
								class: 'w-full',
								options: userOptionsAll.value,
								modelValue: submitModel.data.copyTo,
								maxSelectedLabels: 3,
								onUpdate: (value: any) => {
									submitModel.data.copyTo = value;
									if (submitModel.data.copyTo && submitModel.data.copyTo.length > 0) {
										submitModel.data.copyToInvalid = false;
									}
									else {
										submitModel.data.copyToInvalid = true;
									}
									submitFun();
								},
							})}
							{
								submitModel.data.copyToInvalid ? <div class='text-left text-sm text-red-400'>
									{$t('invalid.requiredSelectAny')}
								</div> : <div></div>
							}
						</div>
					</div>
					<div class="w-1/2 flex items-center box-border">
						<div class="w-1/3 p-1 box-border">{$t('auth.notification')}:</div>
						<div class="w-2/3 p-1 flex justify-start box-border">
							{ui.factory.textarea(submitModel.data.notification, {
								class: 'w-full',
								autoResize: true,
								'onUpdate:modelValue': (value: any) => {
									submitModel.data.notification = value;
									submitFun();
								},
							})}
						</div>
					</div>
				</div>
			</div>
		);
	},
});
