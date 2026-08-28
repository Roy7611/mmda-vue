<template>
	<div>
		<div class="gantt-container" ref="ganttContainer"></div>
	</div>
</template>

<script>
	import { Gantt } from 'dhtmlx-gantt';
	import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

	export default {
		name: 'ProductionScheduleContent',
		mounted() {
			initializeGantt();
		},
		methods: {
			initializeGantt() {
				Gantt.schedules = [
					{
						text: 'Example Task',
						start_date: '2023-04-01',
						duration: 5,
						progress: 0.6,
					},
				];
				Gantt.init(this.$refs.ganttContainer);
			},
		},
	};
</script>

<style>
	.gantt-container {
		height: 500px;
		width: 100%;
	}
</style>
