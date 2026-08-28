/** 将「键:值,键:值」类概要拆成多行（如 taskSummary：制品编码:TS0001,制品名称:xx） */
export const splitGanttSummaryValue = (value: string): string[] => {
	const str = String(value ?? '').trim();
	if (!str) {
		return [];
	}
	if (/,.+:/.test(str)) {
		return str.split(/,(?=[^,]+:)/).map(part => part.trim()).filter(Boolean);
	}
	return [str];
};

/** 后端聚合概要（与 listed 字段内容重复） */
export const isAggregatedGanttTaskSummary = (value: unknown): boolean => {
	const str = String(value ?? '').trim();
	return str.length > 0 && /,.+:/.test(str);
};

/** 解析概要单行「键:值」/「键：值」，供 tooltip 用段内键作 label，避免重复外层字段名 */
export const parseGanttSummaryLine = (line: string): { label: string; value: string } | null => {
	const match = String(line ?? '').trim().match(/^([^:：]+)[:：](.+)$/);
	if (!match) {
		return null;
	}
	return { label: match[1].trim(), value: match[2].trim() };
};

const ganttTooltipRowKey = (label: string, value: string) => `${label}\u0001${value}`;

const appendGanttTooltipRowHtml = (
	html: string,
	label: string,
	value: string,
	seen?: Set<string>,
): string => {
	const key = ganttTooltipRowKey(label, value);
	if (seen?.has(key)) {
		return html;
	}
	seen?.add(key);
	return `${html}<div class="gantt-tooltip-row"><span class="gantt-tooltip-label">${label}</span><span class="gantt-tooltip-value">${value}</span></div>`;
};

export const appendGanttTooltipFieldHtml = (
	html: string,
	label: string,
	value: string | number | null | undefined,
	seen?: Set<string>,
): string => {
	if (value === null || value === undefined) {
		return html;
	}
	const str = String(value).trim();
	if (!str) {
		return html;
	}
	const lines = splitGanttSummaryValue(str);
	// 多段概要：每段若是「键:值」则用段内键作 label（否则整段仍用外层 label，如「任务概要」）
	if (lines.length > 1) {
		return lines.reduce((acc, line) => {
			const parsed = parseGanttSummaryLine(line);
			if (parsed) {
				return appendGanttTooltipRowHtml(acc, parsed.label, parsed.value, seen);
			}
			// 无法解析时回退：沿用 metaui 字段 displayLabel
			return appendGanttTooltipRowHtml(acc, label, line, seen);
		}, html);
	}
	return appendGanttTooltipRowHtml(html, label, str, seen);
};

export const wrapGanttTooltipHtml = (inner: string) => (inner ? `<div class="gantt-tooltip-body">${inner}</div>` : '');
