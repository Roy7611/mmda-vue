/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2024-12-03 00:45:35
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2024-12-03 11:52:35
 * @FilePath: /mmda-vue/packages/mes/src/components/ConfirmFn.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { h, reactive } from 'vue';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, MetaModel, EntityAction, isNullOrUndefined, ApiClient } from '@mmda/core';
interface PropsData {
	// 弹窗标题
	title?: string;
	// 弹窗类型
	type?: string;
	//提示内容
	message?: string;
	//icon
	icon?: string,
	// path标识
	id?: string
}
/**
 * action弹窗组件调用方法（等封装到框架在修改）
 * @param context 界面上下文
 * @param props  方法配置字段
 * @returns Promise<boolean>context: UiContext, props?: PropsData, repositoryName?: string, p0?: { id: string; title: string; type: string; icon: string; message: string; }
 */
export const ConfirmFn = async (context: UiContext, action: EntityAction, repositoryName: string, props?: PropsData) => {
	const { $t: t, $api: apiBox, $toast: toast } = context.globalProps;
	// pi pi-info-circle //信息
	// pi-check-circle //成功
	// pi-exclamation-circle //警告信息
	// pi-exclamation-triangle //错误
	switch (props.type) {
		case 'info':
			props.icon = "pi pi-info-circle";
			break;
		case 'success':
			props.icon = "pi pi-check-circle";
			break;
		case 'waring':
			props.icon = "pi pi-exclamation-circle";
			break;
		case 'danger':
			props.icon = "pi pi-exclamation-triangle";
			break;
		default:
			break;
	}
	try {
		context.uiBuilder.confirmMessage(context, {
			header: props.title,
			message: props.message,
			icon: props.icon,
			blockScroll: true,
			acceptProps: {
				severity: props.type
			},
			accept: async () => {
				return true
				// try {
				// 	const res: boolean = await apiBox.doAction({
				// 		path: props.id,
				// 		action: action.name,
				// 		repository: repositoryName,
				// 		service: 'mes',
				// 	}, { ...action.param })
				// 	if (res) {
				// 		toast.add({
				// 			severity: 'success',
				// 			detail: t('success.operationSuccessful'),
				// 			summary: t('dialog.success'),
				// 			group: 'br',
				// 			life: 3000,
				// 		})
				// 		context.reload();
				// 		return true;
				// 	}
				// } catch (error: any) {
				// 	toast.add({
				// 		severity: 'error',
				// 		detail: error.message.toString(),
				// 		summary: t('invalid.error'),
				// 		group: 'br',
				// 		life: 3000,
				// 	})
				// 	return false
				// }
			},
			reject: async () => {
				// return false
			}
		})
	} catch (error: any) {
		return false
	}
}