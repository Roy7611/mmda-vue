/**
 * 产量柱状图组件
 * 使用 echarts.init() 渲染双柱对比图，主题颜色跟随 PrimeVue CSS 变量
 */
import { defineComponent, h, onMounted, onUnmounted, watch, getCurrentInstance, ref } from 'vue'
import type { PropType } from 'vue'
import type { ProductionChartData } from '../types'
import { useI18n } from 'vue-i18n'

/* 从 computed style 中解析 CSS 变量色值 */
function resolveColor(varName: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback
}

export const HomeProductionChart = defineComponent({
  name: 'HomeProductionChart',
  props: {
    chartData: { type: Object as PropType<ProductionChartData>, required: true },
  },
  setup(props) {
    const { t } = useI18n()
    const containerRef = ref<HTMLElement | null>(null)
    let chartInstance: any = null

    const $echarts = getCurrentInstance()?.globalProps.$echarts

    const renderChart = () => {
      if (!chartInstance || !$echarts) return
      const data = props.chartData
      if (!data) return
      /* 后端可能返回 ProductionChartData 对象但 labels/actual/plan 字段为 null，
         ECharts setOption 对这些字段传 null 会触发内部 assert 崩溃 */
      if (!data.labels || !data.actual || !data.plan) return

      const textColor = resolveColor('--mmda-text-color', '#333')
      const borderColor = resolveColor('--mmda-content-border-color', '#e5e7eb')
      const primaryColor = resolveColor('--mmda-primary-color', '#3B82F6')

      chartInstance.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 40, right: 8, top: 8, bottom: 24 },
        xAxis: {
          type: 'category',
          data: data.labels,
          axisLine: { lineStyle: { color: borderColor } },
          axisLabel: { color: textColor, fontSize: 10 },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: borderColor } },
          axisLabel: { color: textColor, fontSize: 10 },
        },
        series: [
          {
            name: t('view.actual'),
            type: 'bar',
            data: data.actual,
            itemStyle: { color: primaryColor, borderRadius: [2, 2, 0, 0] },
            barWidth: '30%',
          },
          {
            name: t('view.planned'),
            type: 'bar',
            data: data.plan,
            /* 主色 25% 半透明 */
            itemStyle: { color: primaryColor + '40', borderRadius: [2, 2, 0, 0] },
            barWidth: '30%',
          },
        ],
        animation: true,
      }, true)
    }

    onMounted(() => {
      if (!$echarts || !containerRef.value) return
      chartInstance = $echarts.init(containerRef.value)
      renderChart()
    })

    watch(() => props.chartData, () => { renderChart() }, { deep: true })

    onUnmounted(() => {
      chartInstance?.dispose()
      chartInstance = null
    })

    return () => h('div', {
      style: { padding: '8px 16px', height: '100%', display: 'flex', flexDirection: 'column' },
    }, [
      /* ECharts 容器 — ref 回调拿到 DOM 引用 */
      h('div', {
        ref: (el: any) => { containerRef.value = el as HTMLElement | null },
        style: { flex: 1, minHeight: 0 },
      }),
      /* 图例 */
      h('div', {
        style: {
          display: 'flex', gap: '16px', padding: '2px 0',
          fontSize: '10px', color: 'var(--mmda-text-muted-color)', flexShrink: 0,
        },
      }, [
        h('span', { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, [
          h('span', { style: { width: '8px', height: '8px', borderRadius: '1px', background: 'var(--mmda-primary-color)' } }),
          t('view.actual'),
        ]),
        h('span', { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, [
          h('span', { style: { width: '8px', height: '8px', borderRadius: '1px', background: 'color-mix(in srgb, var(--mmda-primary-color) 25%, transparent)' } }),
          t('view.planned'),
        ]),
      ]),
    ])
  }
})
