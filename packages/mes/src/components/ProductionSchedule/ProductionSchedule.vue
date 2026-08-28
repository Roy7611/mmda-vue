<template>
	<div style="width: 100%; height: 100%; overflow: hidden">
		<div class="gantt-container" ref="ganttBox"></div>
	</div>
</template>

<script lang="ts" setup>
	import { onMounted, ref, reactive, getCurrentInstance, onBeforeMount, toRaw } from 'vue';
	import { gantt, Gantt } from 'dhtmlx-gantt';
	import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
	const ganttBox = ref();
	const tasks = {
		data: [
			{ id: 1, text: 'Task #1', start_date: '15-04-2017', personName: '张总', duration: 3, progress: 0.6 },
			{ id: 2, text: 'Task #2', start_date: '18-04-2017', personName: '李总', duration: 3, progress: 0.4 },
			{ id: 3, text: 'Task #2-1', start_date: '20-04-2017', personName: '赵总', duration: 3, progress: 0.4, parent: 2 },
		],
		links: [{ id: 1, source: 1, target: 2, type: '0' }],
	};
	const getGannt = () => {
      gantt.i18n.setLocale('cn') // 国际化
      gantt.config.xml_date = "%Y-%m";  //日期格式化
      gantt.config.scale_unit = "year";	//按月显示
      gantt.config.date_scale = "%Y"; //右侧一栏显示列名
      
      gantt.config.scale_height = 50; //设置时间刻度的高度和网格的标题
      gantt.config.row_height = 50;   //进度条容器高
      gantt.config.grid_width = 500;  //左侧宽
      gantt.config.autofit = true;  //左侧是否自适应

      gantt.config.details_on_dblclick = true;  // 开启双击表格启动弹出窗
      gantt.config.autosize = "y";  // y轴自适应高度
      gantt.config.subscales = [ { unit: "month", step: 1, date: "%M" } ];	//指定第二个时间刻度
      gantt.config.drag_links = false;  //取消连线
      gantt.config.drag_progress = false; // 取消进度条
      gantt.config.readonly = false;  //只读
      gantt.config.fit_tasks = true;  //自动调整图表坐标轴区间用于适配task的长度
      gantt.config.wide_form = false; //  弹窗宽

      gantt.plugins({ // 提示信息
        tooltip: true// 启用 tooltip 插件
      })

      //左侧显示列名
      gantt.config.columns = [
        { name: "text", label: "任务名称", tree: true, align: "center",resize: true},
        { name: "start_date", label: "开始时间" , align: "center",resize: true},
        { name: "end_date", label: "结束时间", align: "center",resize: true},
        {name:"add",label:"", align: "center"},
      ];
      gantt.config.tooltip_hide_timeout = 2000;
      gantt.init(ganttBox.value);
      gantt.parse(tasks);
	};
	onBeforeMount(() => {
		//getGannt();
		// gantt.parse(tasks);
	});
	onMounted(() => {
		getGannt();
		// console.log('22222', ganttBox.value);
		// nextTick(() => {
		// 	// console.log('3333', ganttBox.value);
		// });
		// gantt.init(ganttBox.value);
		// gantt.parse(tasks);
	});
</script>

<style lang="less" scoped>
	.ganttBoxStyle {
		margin-top: 1rem;
		width: 100%;
		height: 80%;
		overflow: hidden;
	}
</style>
