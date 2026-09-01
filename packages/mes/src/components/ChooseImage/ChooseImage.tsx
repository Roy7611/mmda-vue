import { defineComponent, defineProps, ref, Ref, nextTick, reactive, h, onMounted, getCurrentInstance, watch, onUnmounted, onActivated, onBeforeMount, unref, computed, toRefs } from 'vue';
import { encodeUriAndFix, isRefNone, type ApiClient } from '@mmda/core';
import { useRouter } from 'vue-router';
import { label } from '@mmda/vui';
import { get } from 'http';
import { build } from 'vite';
import '@/compat/animate.min.css';
import { uiBuilder } from '@/mes';
import { emit } from 'process';

import '../ChooseImage/ChooseImage.less';

export default defineComponent({
	name: 'ChooseImage',
	props: {
		selectOption: Array as any,
		selectType: String,
		ctx: Object as any,
	},
	emits: ['selectedData'],
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
		//最终提交前处理的方法

		//选中的图片
		const submitModel = reactive({
			list: [],
		});
		//图片列表
		const options = ref([]);
		//最终提交前处理的方法
		const submitFun = () => {
			ctx.emit('selectedData', submitModel.list);
		};
		//选择图片
		const selectPhoto = (item: any) => {
			//判断模式
			//单选
			if (props.selectType == 'simple') {
				submitModel.list = [];
				//判断 item 是否在 submitModel list 没有添加有就删除
				//const indexNum = submitModel.list.findIndex(item2 => item2.photo == item.photo);
				options.value.map((item2: any) => {
					if (item.photo == item2.photo) {
						item2.selected = true;
					} else {
						item2.selected = false;
					}
					return item2;
				});
				submitModel.list.push(item);
				submitFun();
			}
			//多选
			else if (props.selectType == 'multiple') {
				//判断 item 是否在 submitModel list 没有添加有就删除
				const indexNum = submitModel.list.findIndex(item2 => item2.photo == item.photo);
				if (indexNum < 0) {
					item.selected = true;
					submitModel.list.push(item);
				} else {
					item.selected = false;
					submitModel.list.splice(indexNum, 1);
				}
				submitFun();
			}
		};
		onBeforeMount(async () => {
			submitModel.list = [];
			if (props.selectOption && props.selectOption.length > 0) {
				props.selectOption.map((item: any) => {
					item.selected = false;
					return item;
				});
				options.value = props.selectOption;
			} else {
				options.value = [];
			}
		});
		onMounted(() => {
			// console.log('props', props);
			// console.log(ui, 'ui');
		});
		return () =>
			h(
				'div',
				{
					class: 'imagesWallBox',
				},
				[
					h(
						'div',
						{
							class: 'imagesWallBox2',
						},
						[
							options.value && options.value.length > 0
								? options.value.map((item: any, index: any) =>
										h('div', {
											class: item.selected ? 'imagesBox selected' : 'imagesBox',
											style: {
												backgroundImage: `url(${encodeUriAndFix(item.photo)})`,
											},
											onClick: () => {
												selectPhoto(item);
											},
										})
								  )
								: null,
						]
					),
					h(
						'div',
						{
							style: { width: '100%' },
						},
						[
							$t('auth.chooseImageCount', {
								it: submitModel.list.length ?? 0,
							}),
							// `共选中 ${ props.selectOption.length??0} 张图片`
						]
					),
				]
			);
	},
});
