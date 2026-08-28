import {
	defineComponent,
	defineProps,
	ref,
	Ref,
	nextTick,
	reactive,
	h,
	onMounted,
	getCurrentInstance,
	watch,
	onUnmounted,
	onActivated,
	onBeforeMount,
	unref,
	computed,
	toRefs,
	PropType,
	inject,
} from 'vue';
import { isRefNone, Pagination, type ApiClient } from '@mmda/core';
import { useRouter } from 'vue-router';
import { label, type UiBuildContext } from '@mmda/vui';
import { get } from 'http';
import { build } from 'vite';
import '@mmda/vui-primevue/src/assets/animate.min.css';
import { uiBuilder } from '@/mes';
import { emit } from 'process';
import { MES_KEY } from '@/keys';
interface InvalidProps {
	[index: string]: any;
	ownerInvalid: boolean;
	copyToInvalid: boolean;
}
interface OwnerData {
	ownerID?: string;
	ownerName?: string;
	ownerDeptID?: string;
	ownerDeptName?: string;
}
export default defineComponent({
	name: 'ChoosePerson',
	emits: ['changeData'],
	props: {
		context: { type: Object as PropType<UiBuildContext<any>>, default: null },
		ownerData: { type: Object as PropType<OwnerData>, default: null },
	},
	// props: {
	// 	dataModel: Object as any,
	// 	ctx: Object as any,
	// },
	// emits: {
	// 	changeDateTime: (val: any) => val,
	// },
	setup(props, ctx) {
		// const ganttBox = ref();

		const userObj = ref();
		const apiClient = getCurrentInstance().appContext.app.config.globalProperties.$api as ApiClient;
		const { $t, appGlobal, $toast: toast } = getCurrentInstance().appContext.app.config.globalProperties;
		const { appContext } = getCurrentInstance();

		const mes = inject(MES_KEY);
		const { meta: metaUiService, di, i18n, ui } = mes;

		const invalidProps = reactive<InvalidProps>({
			copyToInvalid: false, //是否选择了 通知给谁。
			ownerInvalid: false, //显示用 是否选择了用户
		});

		//人员下拉选择
		const userOptionsAll = ref([]);
		const userGroupOptions = computed(() => {
			const allDept = userOptionsAll.value.map((item: any) => ({
				deptID: item.deptID,
				deptName: item.customProperties.$deptID ?? '-',
			}));
			const deptList: any[] = [];
			const map = new Map();

			allDept.forEach((item: { deptID: string; deptName: string }) => {
				if (!map.has(item.deptID)) {
					map.set(item.deptID, true);
					deptList.push({ ...item, items: [] });
				}
			});

			userOptionsAll.value.forEach((item: any) => {
				const deptIndex = deptList.findIndex((item2: any) => item2.deptID === item.deptID);
				if (deptIndex != -1) {
					deptList[deptIndex].items.push(item);
				}
			});
			return deptList;
		});

		let userPagination: Pagination = reactive({
			pageSize: 10,
			pageNo: 1,
		});
		const submitModel = reactive({
			data: {
				uid: null,
				userName: null,
				userID: null,
				deptName: null,
				detpID: null,
			},
		});

		//最终提交前处理的方法
		const submitFun = () => {
			ctx.emit('changeData', submitModel);
		};

		// //人员下拉选择
		// const userPageInfo = reactive({
		// 	searchWord: '',
		// });
		const selectedUser = ref();
		//获得项目
		const getUser = async (params?: Object) => {
			try {
				let res = null;
				res = await apiClient.getAll({
					repository: 'Users',
					queryParams: Object.assign(
						{},
						{ pageNo: userPagination.pageNo, pageSize: userPagination.pageSize },
						{
							sort: '',
							status: 'ACTIVATED',
						},
						params
					),
					service: 'base',
				});
				userOptionsAll.value = res.list ?? [];
				userPagination = Object.assign(userPagination, res.pagination);
			} catch (error: any) {
				return false;
			}
		};
		//选中
		const userChange = (value: any) => {
			userObj.value = value;
			submitModel.data.userID = value?.userID ?? '';
			submitModel.data.userName = value?.username ?? '';
			submitModel.data.detpID = value?.deptID ?? '';
			submitModel.data.deptName = value?.customProperties?.$deptID ?? '';
			submitFun();
		};

		onBeforeMount(async () => {
			getUser({
				userID: props.ownerData?.ownerID ?? '',
			});
		});
		let clearTime: any;
		onMounted(async () => {
			submitModel.data.userID = null;
			submitModel.data.userName = null;
			submitModel.data.detpID = null;
			submitModel.data.deptName = null;

			//赋值默认值
			if (props.ownerData?.ownerID ?? null) {
				submitModel.data.userID = props?.ownerData?.ownerID ?? null;
				submitModel.data.userName = props?.ownerData?.ownerName ?? null;
				submitModel.data.detpID = props?.ownerData?.ownerDeptID ?? null;
				submitModel.data.deptName = props?.ownerData?.ownerDeptName ?? null;
				clearTime = setTimeout(() => {
					const defultSelectItem = userOptionsAll.value.find((item: any) => {
						if (item.userID == props.ownerData?.ownerID) {
							return item;
						}
					});

					if (defultSelectItem) {
						selectedUser.value = defultSelectItem;
						userChange(selectedUser.value);
					}
				}, 500);
			}
		});
		onUnmounted(() => {
			clearTimeout(clearTime);
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
							{ui.factory.searchForRelative(
								{
									labelStyle: { textAlign: 'left' },
									id: 'ownerName',
									class: 'w-full',
									// dataKey: `${userMeta.value?.primaryKey}`,
									dataKey: `userID`,
									invalid: invalidProps.ownerInvalid,
									placeholder: $t('auth.selectApersonInCharge'),
									modelValue: userObj.value,
									optionGroupLabel: 'deptName',
									optionGroupChildren: 'items',
									// optionLabel: 'username',
									optionLabel: (data: any) => `${data.username ?? ''}(${data.customProperties.$deptID ?? '-'})`,
									// options: userOptionsAll.value,
									options: userGroupOptions.value,
									onUpdate: (value: any) => {
										if (value.userID) {
											selectedUser.value = {};
											selectedUser.value = value;
											userChange(selectedUser.value);
										}
									},
									toSearch: async (event: Event) => {
										const { metaui } = await props.context.logic.loadMetadata('Users', 'base', true);
										props.context.searchParam.pager = userPagination = {
											pageSize: 10,
											pageNo: 1
										}
										// userMeta.value = metaui
										const columns = await props.context.uiBuilder.buildColumns(metaui, props.context, {
											isSearch: true,
											cacheKey: `ownerName/SearchRelative/${metaui.primaryKey}`,
										});

										return new Promise<any>((resolve, reject) => {
											props.context.uiBuilder.confirmDialog(
											(props.context.uiBuilder as any).buildSearchForRelativeContent(columns, {
													dataKey: `${metaui.primaryKey}`,
													tableId: `${metaui.objName}`,
													onSearch: async ({ searchParams }: any) =>
														await getUser(searchParams).then(() => ({
															list: userOptionsAll.value,
															pager: userPagination,
														})),
													onSelect: (selection: any[], row: any) => {
														selectedUser.value = row;
													},
													onPage: (pager: any) => {
														userPagination.pageNo = pager.pageNo;
														userPagination.pageSize = pager.pageSize;
														props.context.searchParam.pager = userPagination
													},
												}),
												props.context,
												{
													cancelId: `dlg-${metaui.objName}-cancel-button`,
													confirmId: `dlg-${metaui.objName}-confirm-button`,
													name: 'searchForRelative',
													title: metaui.displayLabel,
													style: { width: '80vw', maxHeight: '95%' },
													breakpoints: {
														'960px': '75vw',
														'640px': '90vw',
													},
													modal: true,
													accept: async () => {
														userChange(selectedUser.value);
														return true;
													},
													// reject: props.reject
												}
											);
										});
									},
								},
								{
									option: (scope: {
										/**
										 * Option instance
										 */
										option: any;
										/**
										 * Selection state
										 */
										selected: boolean;
										/**
										 * Index of the option
										 */
										index: number;
									}) => ui.factory.textSpan(`${scope.option.username ?? ''}`),
									//primeVueFactory.textSpan(`姓名：${scope.option.username ?? ''}  部门：${scope.option.customProperties.$deptID ?? ''}  手机：${scope.option.mobile ?? ''}`)
								}
							)}

							{/* {ui.factory.select({
								labelStyle: { textAlign: 'left' },
								id: 'refID',
								class: 'w-full',
								showClear: submitModel.data.uid !== '' ? true : false,
								// filter: true,
								placeholder: $t('auth.selectApersonInCharge'), //$t('auth.selectAUser')
								modelValue: submitModel.data.uid,
								options: userOptionsAll.value,
								// onUpdate: (value: any) => {
								// 	console.log("value",value);
								// 	submitModel.data.userID  = value.userID;
								// },
								//(submitModel.data.refName = value)
								optionLabel: 'username',
								onChange: userChange,
							})} */}
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
