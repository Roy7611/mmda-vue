/**
 * 质量趋势折线图组件
 * 使用 echarts.init() 渲染 7 天合格率走势 + 面积渐变填充
 */
import { defineComponent, h, onMounted, onUnmounted, watch, getCurrentInstance, ref } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'

/* 从 computed style 中解析 CSS 变量色值 */
function resolveColor(varName: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback
}

export const HomeQualityTrend = defineComponent({
  name: 'HomeQualityTrend',
  props: {
    /* 7天合格率百分比数据，如 [98.2, 98.5, 98.0, 99.1, 98.7, 99.3, 98.9] */
    trendData: { type: Array as PropType<number[]>, required: true },
    labels: { type: Array as PropType<string[]>, default: () => [] },
  },
  setup(props) {
    const { t } = useI18n()
    const containerRef = ref<HTMLElement | null>(null)
    let chartInstance: any = null

    const $echarts = getCurrentInstance()?.globalProps.$echarts

    const renderChart = () => {
      if (!chartInstance || !$echarts) return
      const data = props.trendData
      if (!data) return
      /* 空数组 [] 是 truthy，会通过检查传给 ECharts 导致内部 assert；加 length 检查兜底 */
      if (!data.length) return

      const textColor = resolveColor('--mmda-text-color', '#333')
      const borderColor = resolveColor('--mmda-content-border-color', '#e5e7eb')
      const greenColor = resolveColor('--mmda-green-400', '#22C55E')

      chartInstance.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 36, right: 8, top: 8, bottom: 24 },
        xAxis: {
          type: 'category',
          data: props.labels.length ? props.labels : [
            t('view.weekdayMon'),
            t('view.weekdayTue'),
            t('view.weekdayWed'),
            t('view.weekdayThu'),
            t('view.weekdayFri'),
            t('view.weekdaySat'),
            t('view.weekdaySun'),
          ],
          axisLine: { lineStyle: { color: borderColor } },
          axisLabel: { color: textColor, fontSize: 10 },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
          min: 95,
          splitLine: { lineStyle: { color: borderColor } },
          axisLabel: { color: textColor, fontSize: 10, formatter: '{value}%' },
        },
        series: [{
          type: 'line',
          data: data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: greenColor, width: 2 },
          itemStyle: { color: greenColor },
          /* 从绿 30% 透明渐变到完全透明 */
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: greenColor + '4D' },
                { offset: 1, color: greenColor + '00' },
              ],
            },
          },
        }],
        animation: true,
      }, true)
    }

    onMounted(() => {
      if (!$echarts || !containerRef.value) return
      chartInstance = $echarts.init(containerRef.value)
      renderChart()
    })

    watch(() => props.trendData, () => { renderChart() }, { deep: true })

    onUnmounted(() => {
      chartInstance?.dispose()
      chartInstance = null
    })

    /* X 轴标签由 ECharts xAxis 自动渲染，不再手动输出底部标签行 */
    return () => h('div', { style: { padding: '8px 16px', height: '100%', display: 'flex', flexDirection: 'column' } }, [
      h('div', {
        ref: (el: any) => { containerRef.value = el as HTMLElement | null },
        style: { flex: 1, minHeight: 0 },
      }),
    ])
  }
})
