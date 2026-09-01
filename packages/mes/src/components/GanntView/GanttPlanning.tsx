/* eslint-disable vue/no-mutating-props */
import { defineComponent, ref, reactive, h, onBeforeMount, inject, getCurrentInstance } from 'vue';
import type { ApiClient } from '@mmda/core';
import '@/compat/animate.min.css';

export type GanttPlanningFormData = {
	planNo: string | null;
	remark: string | null;
	date: string | null;
	expectedStart: string | null;
	expectedFinish: string | null;
	rangeDate: any[] | null;
	projectID?: string | null;
};

export type GanttPlanningShell = {
	data: GanttPlanningFormData;
	/** 校验通过后由父组件执行提交，返回 true 时关闭弹窗 */
	submitHandler?: () => boolean | Promise<boolean>;
};

/** 打开弹窗前重置表单 */
export function resetGanttPlanningFormData(formData: GanttPlanningFormData, planDate?: any) {
	const today = planDate ? new Date(planDate) : new Date();
	formData.planNo = null;
	formData.remark = null;
	formData.date = null;
	formData.expectedStart = null;
	formData.expectedFinish = null;
	formData.rangeDate = [today, today];
}

export function resetGanttPlanningShell(shell: GanttPlanningShell, planDate?: any) {
	shell.submitHandler = undefined;
	resetGanttPlanningFormData(shell.data, planDate);
}

function computeGanttPlanningErrors(formData: GanttPlanningFormData) {
	return {
		date: !formData.rangeDate || formData.rangeDate.length < 1,
		planNo: !String(formData.planNo ?? '').trim(),
	};
}

export default defineComponent({
	name: 'GanttPlanning',
	props: {
		dataModel: Object as any,
		ctx: Object as any,
		planningShell: {
			type: Object as () => GanttPlanningShell,
			required: true,
		},
	},
	setup(props) {
		getCurrentInstance()!.appContext.app.config.globalProperties.$api as ApiClient;
		const { $ui: ui, $t } = getCurrentInstance()!.appContext.app.config.globalProperties;
		const dialogRef: any = inject('dialogRef', null);

		const selectedPreset = ref('day');
		const submitting = ref(false);
		const visibleErrors = reactive({ date: false, planNo: false });
		const dateTypeList = [
			{ id: 0, value: 'day', text: $t('ganttLabel.Daily') },
			{ id: 1, value: 'week', text: $t('ganttLabel.Weekly') },
			{ id: 2, value: 'customize', text: $t('ganttLabel.Customize') },
		];

		const runConfirmValidation = () => {
			const errors = computeGanttPlanningErrors(props.planningShell.data);
			visibleErrors.date = errors.date;
			visibleErrors.planNo = errors.planNo;
			const planNo = String(props.planningShell.data.planNo ?? '').trim();
			props.planningShell.data.planNo = planNo || null;
			return !errors.date && !errors.planNo;
		};

		const handleCancel = () => {
			dialogRef?.value?.close();
		};

		const handleConfirm = async () => {
			if (submitting.value) {
				return;
			}
			if (!runConfirmValidation()) {
				return;
			}
			submitting.value = true;
			try {
				const ok = await props.planningShell.submitHandler?.();
				if (ok) {
					dialogRef?.value?.close();
				}
			} finally {
				submitting.value = false;
			}
		};

		const dateTypeChange = (value: any) => {
			selectedPreset.value = value;
			const today = new Date();
			const fd = props.planningShell.data;
			if (selectedPreset.value == 'day') {
				if (fd.rangeDate && fd.rangeDate.length > 1) {
					const today2 = new Date(fd.rangeDate[0]);
					fd.rangeDate = [today2, today2];
				} else {
					fd.rangeDate = [today, today];
				}
			} else if (selectedPreset.value == 'week') {
				if (fd.rangeDate && fd.rangeDate.length > 1) {
					const today2 = new Date(fd.rangeDate[0]);
					const startDate = new Date(fd.rangeDate[0]);
					const endDate = new Date(startDate);
					endDate.setDate(endDate.getDate() + 6);
					fd.rangeDate = [today2, endDate];
				} else {
					const startDate = new Date(today);
					const endDate = new Date(startDate);
					endDate.setDate(endDate.getDate() + 6);
					fd.rangeDate = [today, endDate];
				}
			} else if (selectedPreset.value == 'customize') {
				if (fd.rangeDate && fd.rangeDate.length > 1) {
					const d = new Date(fd.rangeDate[0]);
					fd.rangeDate = [d, null];
				} else {
					fd.rangeDate = [today, null];
				}
			}
		};

		onBeforeMount(() => {
			// 父组件先调用 create 接口并写入 planNo；这里不能再次清空
			if (!props.planningShell.data.rangeDate?.[0]) {
				resetGanttPlanningFormData(props.planningShell.data, props.dataModel);
			}
		});

		return () => {
			const fd = props.planningShell.data;
			return (
				<div class="w-full box-border pr-28">
					<div class="w-full flex pt-2 pb-2 box-border flex-col">
						<div class="w-full flex items-center box-border ">
							<div class="w-1/3 p-3 box-border text-right">
								<span class="text-red-500">*</span>
								{$t('auth.PlanDate')}:
							</div>
							<div class="w-2/3 p-3 box-border flex justify-start flex-col">
								{ui.factory.datePicker(
									{
										selectionMode: 'range',
										numberOfMonths: '2',
										modelValue: fd.rangeDate ?? '',
										defaultValue: props?.dataModel?.rangeDate ?? null,
										id: 'plan',
										placeholder: $t('ganttLabel.selectDate'),
										showButtonBar: false,
										appendTo: 'body',
										todayButtonProps: {
											hidden: 'hidden',
										},
										onUpdatePicker: (value: any) => {
											if (value) {
												if (selectedPreset.value == 'day') {
													fd.rangeDate = [value[0], value[0]];
												} else if (selectedPreset.value == 'week') {
													if (value[0]) {
														const startDate = new Date(value[0]);
														const endDate = new Date(startDate);
														endDate.setDate(endDate.getDate() + 6);
														fd.rangeDate = [value[0], endDate];
													}
												} else if (selectedPreset.value == 'customize') {
													fd.rangeDate = value;
												}
												if (visibleErrors.date) {
													visibleErrors.date = false;
												}
											} else {
												fd.rangeDate = null;
											}
										},
									},
									{
										footer: ui.factory.radioGroup(selectedPreset.value, {
											id: 'importance',
											class: 'w-full justify-center ',
											options: dateTypeList,
											optionLabel: 'text',
											optionValue: 'value',
											onChange: dateTypeChange,
										}),
									}
								)}
								{visibleErrors.date ? (
									<div class="text-left text-sm text-red-400 p-1">{$t('invalid.requiredDate')}</div>
								) : null}
							</div>
						</div>
						<div class="w-full flex items-center box-border ">
							<div class="w-1/3 p-3 box-border text-right">
								<span class="text-red-500">*</span>
								{$t('auth.planNumber')}:
							</div>
							<div class="w-2/3 p-3 box-border flex justify-start flex-col ">
								{ui.factory.input(fd.planNo ?? '', {
									key: 'gantt-planning-plan-no',
									maxlength: '64',
									placeholder: $t('auth.planNumber'),
									onUpdate: (value: string) => {
										fd.planNo = value;
										if (visibleErrors.planNo) {
											visibleErrors.planNo = false;
										}
									},
								})}
								{visibleErrors.planNo ? (
									<div class="text-left text-sm text-red-400 p-1">{$t('invalid.requiredPlanNo')}</div>
								) : null}
							</div>
						</div>
						<div class="w-full flex box-border items-start">
							<div class="w-1/3 p-3 box-border text-right  flex justify-end">{$t('auth.remark')}:</div>
							<div class="w-2/3 p-3 box-border flex justify-start">
								{ui.factory.textarea(fd.remark, {
									style: {
										width: '100%',
									},
									rows: '5',
									cols: '30',
									placeholder: $t('ganttLabel.RemarkMessage'),
									onUpdate: (value: string) => {
										fd.remark = value;
									},
								})}
							</div>
						</div>
						<div class="w-full flex justify-end gap-2 pt-2 pb-1 pr-3 box-border">
							{ui.factory.button({
								outlined: true,
								label: $t('action.cancel'),
								severity: 'danger',
								icon: 'pi pi-times',
								onAction: handleCancel,
							})}
							{ui.factory.button({
								outlined: true,
								label: $t('action.confirm'),
								icon: 'pi pi-check',
								loading: submitting.value,
								onAction: handleConfirm,
							})}
						</div>
					</div>
				</div>
			);
		};
	},
});
