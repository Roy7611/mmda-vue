import { h } from "vue";
import type { PropData } from "@mmda/vui";
import { ChartComponent } from "@syncfusion/ej2-vue-charts";

function chartProps(data: any, props: PropData) {
  return {
    primaryXAxis: { valueType: "Category" },
    series: data?.datasets
      ? data.datasets.map((set: any) => ({
          type: props.type ?? "Column",
          dataSource: (data.labels ?? []).map((label: string, i: number) => ({
            x: label,
            y: set.data?.[i],
          })),
          xName: "x",
          yName: "y",
          name: set.label,
        }))
      : (data?.series ?? []),
    ...props,
  };
}

export function attachChartRenderers(factory: any) {
  factory.chart = (data: any, props: PropData = {}) =>
    h(ChartComponent as any, { ...chartProps(data, props) });
  factory.barChart = (data: any, props: PropData = {}) =>
    h(ChartComponent as any, {
      ...chartProps(data, { ...props, type: "Column" }),
    });
  factory.lineChart = (data: any, props: PropData = {}) =>
    h(ChartComponent as any, {
      ...chartProps(data, { ...props, type: "Line" }),
    });
  factory.pieChart = (data: any, props: PropData = {}) =>
    h(ChartComponent as any, {
      ...chartProps(data, { ...props, type: "Pie" }),
    });
  factory.doughnutChart = (data: any, props: PropData = {}) =>
    h(ChartComponent as any, {
      ...chartProps(data, { ...props, type: "Doughnut" }),
    });
  factory.polarAreaChart = (data: any, props: PropData = {}) =>
    h(ChartComponent as any, {
      ...chartProps(data, { ...props, type: "Polar" }),
    });
  factory.radarChart = (data: any, props: PropData = {}) =>
    h(ChartComponent as any, {
      ...chartProps(data, { ...props, type: "Radar" }),
    });
}
