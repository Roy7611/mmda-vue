/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2025-03-26 20:10:42
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2025-04-25 14:44:52
 * @FilePath: /mmda-vue/packages/mes/src/components/ToolsLend.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineComponent, h, getCurrentInstance, unref, ref, onMounted, reactive } from 'vue';
import '@/compat/animate.min.css';
import { isRefNone } from '@mmda/core';
export const ToolsLend = defineComponent({
	name: 'ToolsLend',
	props: {
		ctx: Object as any,
	},
	emits: ['getUserID'],
	setup: (props, { emit }) => {
		const { $ui: ui, $t: t, $toast: toast, $api: apiBox } = props.ctx.globalProps;
		const owner = ref('');
		//人员下拉选择
		const userOptionsAll = ref([]);
		const userPageInfo = reactive({
			searchWord: '',
			status: 'GE NEW',
			// pageSize: 20,
			// pageNo: 1,
		});
		onMounted(() => getUser());
		// 获取用户
		const getUser = async () => {
			try {
				const res = await apiBox.getAll({
					repository: 'Users',
					queryParams: userPageInfo,
					service: 'base',
				});
				userOptionsAll.value = res.list && res.list.length > 0 ? res.list : [];
			} catch (error: any) {
				toast.add({
					severity: 'error',
					detail: error.detail ?? '',
					summary: t('dialog.title.error'),
					// position: 'bottom-right',
					group: 'br',
					life: 3000,
				});
			}
		};
		return () =>
			h('div', { class: 'w-full h-full flex pt-2 pb-2 box-border flex-col items-center justify-center ' }, [
				// ui.factory.formItem(
				// 	{
				//         style:{width:'18rem'},
				// 		name: 'userID',
				// 		label: t('auth.superintendent'),
				// 	},
				// 	{
				// 		default: () =>
				// 			ui.factory.select({
				// 				class: 'w-full',
				// 				placeholder: t('auth.selectASuperintendent'),
				// 				modelValue: unref(owner),
				// 				filter: true,
				// 				options: unref(userOptionsAll),
				// 				showClear: isRefNone(owner.value) ? false : true,
				// 				labelStyle: {
				// 					textAlign: 'left',
				// 				},
				// 				optionLabel: 'username',
				// 				onUpdate: (value: string) => (owner.value = value),
				// 				onChange: (event: any) => {
				// 					if (event) {
				// 						emit('getUserID', event.userID);
				// 					} else {
				// 						emit('getUserID', '');
				// 					}
				// 				},
				// 			}),
				// 	}
				// ),
				ui.factory.select({
					class: 'w-full',
					placeholder: t('auth.selectASuperintendent'),
					modelValue: unref(owner),
					filter: true,
					options: unref(userOptionsAll),
					showClear: isRefNone(owner.value) ? false : true,
					labelStyle: {
						textAlign: 'left',
					},
					optionLabel: 'username',
					onUpdate: (value: string) => (owner.value = value),
					onChange: (event: any) => {
						if (event) {
							emit('getUserID', event.userID);
						} else {
							emit('getUserID', '');
						}
					},
				}),
			]);
	},
});
