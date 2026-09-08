import { defineComponent, defineProps, ref, Ref, nextTick, reactive, h, onMounted, getCurrentInstance, watch, onUnmounted, onActivated, onBeforeMount, unref, computed, toRefs } from 'vue';
import { isRefNone } from '@mmda/core';
import { useRouter } from 'vue-router';
import { label } from '@mmda/vui';
import { get } from 'http';
import { build } from 'vite';
import '@/compat/animate.min.css';
import { uiBuilder } from '@/mes';
import { emit } from 'process';

const ProjectGanttPlanning = defineComponent({
	name: 'ProjectGanttPlanning',
	emits: ['changePlanningData'],
	// props: ['dataModel', 'ctx'],
	props: {
		dataModel: Object as any,
		ctx: Object as any,
	},
	// emits: {
	// 	changeDateTime: (val: any) => val,
	// },
	setup(props, ctx) {
		// const ganttBox = ref();

		const { $ui: ui, $t, appContext } = getCurrentInstance().appContext.app.config.globalProperties;

		//最终提交前处理的方法
		const submitFun = () => {
			ctx.emit('changePlanningData', submitModel);
		};
		const submitModel = reactive({
			data: {
				planNo: null,
				planNoInvalid: false,
				remark: null,
				date: null,
			},
		});

		//计划数据change改变后
		const planNoChange = () => {
			if (submitModel.data.planNo) {
				submitModel.data.planNoInvalid = false;
			}
			else {
				submitModel.data.planNoInvalid = true;
			}
			submitFun();
		};
		onBeforeMount(() => {
			submitModel.data = props.dataModel;
		});
		onMounted(() => {
			console.log('props', props);
			console.log(ui, 'ui');
		});

		return () => (
			<div class="w-full box-border">
				<div class="w-full flex pt-2 pb-2 box-border flex-col">
					<div class="w-full flex items-center box-border ">
						<div class="w-1/3 p-3 box-border text-right">
							<span class="text-red-500">*</span>
							{$t('auth.PlanDate')}:
						</div>
						<div class="w-2/3 p-3 box-border flex justify-start">{submitModel.data.date ?? ''}</div>
					</div>
					<div class="w-full flex items-center box-border ">
						<div class="w-1/3 p-3 box-border text-right">
							<span class="text-red-500">*</span>
							{$t('auth.planNumber')}:
						</div>
						<div class="w-2/3 p-3 box-border flex justify-start flex-col ">
							{ui.factory.textInput({
								value: submitModel.data.planNo,
								placeholder: $t('auth.planNumber'),
								onChange: (value: string) => {
									submitModel.data.planNo = value;
									planNoChange();
								},
							})}
							{submitModel.data.planNoInvalid ?
								<div class="text-left text-sm text-red-400 p-1">{$t('invalid.requiredPlanNo')}</div> : <div></div>}
						</div>

					</div>
					<div class="w-full flex items-center box-border">
						<div class="w-1/3 p-3 box-border text-right">{$t('auth.remark')}:</div>
						<div class="w-2/3 p-3 box-border flex justify-start">
							{ui.factory.textArea({
								value: submitModel.data.remark,
								style: {
									width: '100%'
								},
								rows: 5,
								cols: 30,
								placeholder: $t('auth.remark'),
								onChange: (value: string) => {
									submitModel.data.remark = value;
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

export default ProjectGanttPlanning

export function projectGanttPlanningNode(props?: Record<string, any>) {
	return h(ProjectGanttPlanning, props as any)
}
