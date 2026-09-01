/**
 * 自动滚动表格组件
 * JS setInterval 驱动外层 div scrollTop 实现平滑滚动
 * 表头通过 CSS position: sticky 固定，数据克隆 3 份实现无缝循环
 */
import { defineComponent, h, onMounted, onUnmounted, ref, nextTick, watch } from 'vue';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

export interface ScrollColumn {
	key: string;
	label: string;
	width?: string;
}

export const HomeScrollTable = defineComponent({
	name: 'HomeScrollTable',
	props: {
		columns: { type: Array as PropType<ScrollColumn[]>, required: true },
		data: { type: Array as PropType<any[]>, required: true },
		rowKey: { type: String, default: 'id' },
		renderCell: {
			type: Function as PropType<(row: any, col: ScrollColumn, index: number) => any>,
			required: true,
		},
		height: { type: String, default: '200px' },
		factory: { type: Object as PropType<any>, required: true },
	},
	setup(props) {
		const { t } = useI18n();
		const cloned = ref<any[]>([]);
		const scrollRef = ref<HTMLElement | null>(null);
		let intervalId: number | null = null;
		let autoScrollEnabled = true;
		let cleanupContainer: (() => void) | null = null;
		const { factory } = props;

		/* 启动自动滚动：外层 div 直接作为滚动容器，不依赖 PrimeVue 内部 DOM */
		const setupScroll = () => {
			const container = scrollRef.value;
			if (!container || props.data.length === 0) return;

			/* 自适应步长：目标每份数据副本 ≈20秒滚完，步长钳制在 0.2~1.5 px/帧 */
			const singleCopyHeight = container.scrollHeight / 3;
			const targetStep = singleCopyHeight / (20 * 30); // 20秒 × 30fps
			const step = Math.max(0.2, Math.min(1.5, targetStep));

			/* 30fps 自动滚动，滚到底部时重置到 1/3 位置，利用 3 份克隆数据实现无缝循环 */
			intervalId = window.setInterval(() => {
				if (!autoScrollEnabled || !container) return;
				container.scrollTop += step;
				/* 滚到底部时相对回跳 2/3 高度，利用 3 份克隆数据视觉无缝循环 */
				const maxScrollable = container.scrollHeight - container.clientHeight;
				if (container.scrollTop >= maxScrollable) {
					container.scrollTop -= container.scrollHeight / 3;
				}
			}, 32);

			/* 鼠标悬停/滚轮暂停自动滚动 */
			const onEnter = () => { autoScrollEnabled = false; };
			const onLeave = () => { autoScrollEnabled = true; };
			const onWheel = () => { autoScrollEnabled = false; };
			container.addEventListener('mouseenter', onEnter);
			container.addEventListener('mouseleave', onLeave);
			container.addEventListener('wheel', onWheel, { passive: true });

			cleanupContainer = () => {
				container.removeEventListener('mouseenter', onEnter);
				container.removeEventListener('mouseleave', onLeave);
				container.removeEventListener('wheel', onWheel);
			};
		};

		onMounted(() => {
			/* 数据不足 5 条时不克隆，避免 key 重复导致渲染异常 */
			cloned.value = props.data.length > 4 ? [...props.data, ...props.data, ...props.data] : props.data;
			nextTick(() => setupScroll());
		});

		/* API 数据异步返回后重新初始化 */
		watch(() => props.data, (newData) => {
			cloned.value = newData.length > 4 ? [...newData, ...newData, ...newData] : newData;
			if (intervalId !== null) {
				clearInterval(intervalId);
				intervalId = null;
			}
			cleanupContainer?.();
			cleanupContainer = null;
			nextTick(() => setupScroll());
		});

		onUnmounted(() => {
			if (intervalId !== null) {
				clearInterval(intervalId);
				intervalId = null;
			}
			cleanupContainer?.();
			cleanupContainer = null;
		});

		return () => {
			if (props.data.length === 0) {
				return h('div', {
					style: {
						padding: '12px', textAlign: 'center',
						color: 'var(--mmda-text-muted-color, #6B7280)', fontSize: '12px',
					},
				}, t('view.noData'));
			}

			const cols = props.columns.map(col =>
				factory.column(
					{ header: col.label, field: col.key, ...(col.width ? { style: { width: col.width } } : {}) },
					{ body: (slotProps: any) => props.renderCell(slotProps.data, col, slotProps.index) }
				)
			);

			/* 外层 div 作为滚动容器（ref 指向它），表头通过 CSS sticky 固定 */
			return h('div', {
				ref: scrollRef,
				class: 'home-scroll-table',
				style: { overflowY: 'auto', height: props.height },
			}, [
				factory.primeVueTable(cloned.value, cols, {
					scrollable: false,
					dataKey: props.rowKey,
					showGridlines: false,
					resizableColumns: false,
					reorderableColumns: false,
					removableSort: false,
					rowHover: false,
					tableStyle: { minWidth: 'auto' },
				}),
			]);
		};
	},
});
