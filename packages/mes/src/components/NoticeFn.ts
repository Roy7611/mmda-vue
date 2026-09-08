import { h, reactive } from 'vue';
import Notice from './Notice/Notice';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, MetaModel, EntityAction, isNullOrUndefined, ApiClient } from '@mmda/core';
interface PropsData {
	// 弹窗标题
	title?: string;
	// notice 数据
	data?: Object | any;
	// 接口 path 字段
	id?: string;
	// 接口 action 字段
	action?: string;
	// 接口 repository 字段
	repository?: string;
	// 成功后提示信�?
	detail?: string;
}

const notice = reactive({
	data: {
		ownerID: '',
		ownerName: '',
		ownerInvalid: false, //显示�?是否选择了用�?
		ownerDeptID: '',
		ownerDeptName: '',
		importance: 'UNKNOWN', //重要�?
		urgency: 'NORMAL', //紧急�?
		notification: '', //待办事宜
		copyTo: [], //通知�?
		copyToInvalid: false, //是否选择�?通知给谁�?
	},
});

/**
 * 通知组件调用方法（等封装到框架在修改�?
 * @param context 界面上下�?
 * @param props  方法配置字段
 * @returns Promise<boolean>
 */

export const NoticeFn = async (
	context: UiContext & Required<Pick<UiContext, 'reload'>>,
	props?: PropsData,
): Promise<boolean> => {
	const {$t: t} = context.globalProps;
	props.data = notice.data;
	try {
		context.uiBuilder.dialog(
			h(Notice, {
				dataModel: props.data,
				ctx: context,
				onChangeData(val: any) {
					props.data = val.data;
				},
			}),
			context,
			{
				title: props.title,
				onAccept: async () => {
					//选中人必�?
					if (!props.data.ownerID) {
						props.data.ownerInvalid = true;
						return false;
					}
					//通知人必�?
					if (isNullOrUndefined(props.data.copyTo) || props.data.copyTo.length <= 0) {
						props.data.copyToInvalid = true;
						return false;
					}
					//调用接口
					try {
						const res: boolean = await (context as any).logic.apiClient.doAction(
							{
								path: props.id ?? '',
								action: props.action,
								repository: props.repository,
								service: 'mes',
							},
							{ ...props.data, payload: {} }
						);
						//关闭窗口
						if (res) {
							context.uiBuilder.toast(context, {
								severity: 'success',
								message: props.detail ?? `${props.title}${t('dialog.success')}`,
								title: t('dialog.success'),
								life: 3000,
							});
							context.reload();
						}
						return true;
					} catch (error: any) {
						context.uiBuilder.toast(context, {
							severity: 'error',
							message: error.message ?? `${props.title}${t('invalid.error')}`,
							title: t('invalid.error'),
							life: 3000,
						});
						return false;
					}
				},
			}
		);
	} catch (error) {
		return false;
	}
};
