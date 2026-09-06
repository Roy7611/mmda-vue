import { h } from 'vue'
import type { UiContext } from '@mmda/core'

const qualityStatusOptions = (t: UiContext['t']) => [
	{ label: t('stationlabel.qualityPending'), value: 'NI', id: 0 },
	{ label: t('stationlabel.qualityGood'), value: 'OK', id: 1 },
	{ label: t('stationlabel.qualityDefective'), value: 'DG', id: 2 },
	{ label: t('stationlabel.qualityConcession'), value: 'AUC', id: 3 },
	{ label: t('stationlabel.qualityBad'), value: 'NG', id: 4 },
	{ label: t('stationlabel.qualityScrap'), value: 'SCRAP', id: 8 },
]

export function stationPortalFormWrap(children: any[]) {
	return h('div', { class: 'flex_wrap' }, children)
}

export function stationPortalColWrap(children: any[]) {
	return h('div', { class: 'flex flex-col' }, children)
}

export function productionLotReportNode(context: UiContext<any>) {
	const factory = context.uiBuilder.factory
	return stationPortalFormWrap([
		factory.formItem?.(
			{
				label: context.t('stationlabel.batchesquantity'),
			},
			{
				default: () =>
					factory.numberInput?.({
						min: 0,
						maxFractionDigits: 3,
						modelValue: context.model.quantity,
						onInput: (e: any) => (context.model.quantity = e.value),
					}),
			},
		),
		factory.formItem?.({
			label: context.t('stationlabel.Batchnumber'),
			placeholder: context.t('action.input'),
			modelValue: context.model.lotNo,
			onUpdate: (val: string) => (context.model.lotNo = val),
		}),
		factory.formItem?.(
			{
				label: context.t('stationlabel.goodsQuality'),
			},
			{
				default: () =>
					factory.numberInput?.({
						min: 0,
						maxFractionDigits: 3,
						modelValue: context.model.goodQuantity,
						placeholder: context.t('action.input'),
						onUpdate: (val: number) => (context.model.goodQuantity = val),
					}),
			},
		),
		factory.formItem?.(
			{
				label: context.t('stationlabel.concessionQuantity'),
			},
			{
				default: () =>
					factory.numberInput?.({
						min: 0,
						maxFractionDigits: 3,
						modelValue: context.model.aucQuantity,
						placeholder: context.t('action.input'),
						onUpdate: (val: number) => (context.model.aucQuantity = val),
					}),
			},
		),
		factory.formItem?.(
			{
				label: context.t('stationlabel.Quantityofdefectivegoods'),
			},
			{
				default: () =>
					factory.numberInput?.({
						min: 0,
						maxFractionDigits: 3,
						modelValue: context.model.defectiveQuantity,
						placeholder: context.t('action.input'),
						onUpdate: (val: number) => (context.model.defectiveQuantity = val),
					}),
			},
		),
		factory.formItem?.(
			{
				label: context.t('stationlabel.Badquantity'),
			},
			{
				default: () =>
					factory.numberInput?.({
						min: 0,
						maxFractionDigits: 3,
						modelValue: context.model.ngQuantity,
						placeholder: context.t('action.input'),
						onUpdate: (val: number) => (context.model.ngQuantity = val),
					}),
			},
		),
		factory.formItem?.(
			{
				label: context.t('stationlabel.Quantityofwasteproducts'),
			},
			{
				default: () =>
					factory.numberInput?.({
						min: 0,
						maxFractionDigits: 3,
						modelValue: context.model.scrapQuantity,
						placeholder: context.t('action.input'),
						onUpdate: (val: number) => (context.model.scrapQuantity = val),
					}),
			},
		),
	])
}

export function productionPlateReportNode(context: UiContext<any>) {
	const factory = context.uiBuilder.factory
	return stationPortalColWrap([
		factory.formItem?.(
			{
				label: context.t('stationlabel.outputQuantity'),
				required: true,
				isEdit: true,
			},
			{
				default: () =>
					factory.numberInput?.({
						modelValue: context.model.quantity,
						min: 0,
						placeholder: context.t('action.input'),
						onUpdate: (val: number) => {
							context.model.quantity = val
							const perPack = Number(context.model.packQuantity) || 0
							if (perPack > 0) context.model.packQty = Math.ceil((Number(val) || 0) / perPack)
						},
					}),
			},
		),
		factory.formItem?.(
			{
				label: context.t('stationlabel.packagingQuantity'),
			},
			{
				default: () =>
					factory.numberInput?.({
						modelValue: context.model.packQty,
						min: 0,
						placeholder: context.t('action.input'),
						onUpdate: (val: number) => {
							context.model.packQty = val
							const perPack = Number(context.model.packQuantity) || 0
							context.model.quantity = (Number(val) || 0) * perPack
						},
					}),
			},
		),
		factory.formItem?.({
			label: context.t('stationlabel.Batchnumber'),
			placeholder: context.t('action.input'),
			modelValue: context.model.lotNo,
			onUpdate: (val: string) => (context.model.lotNo = val),
		}),
		factory.formItem?.(
			{
				label: context.t('stationlabel.Qualityinspectionresults'),
				modelValue: context.model.qcResult,
			},
			{
				default: () =>
					factory.select?.({
						modelValue: context.model.qcResult,
						options: qualityStatusOptions(context.t),
						dataKey: 'id',
						placeholder: context.t('action.select'),
						optionLabel: 'label',
						optionValue: 'value',
						onUpdate: (value: string) => {
							context.model.qcResult = value
						},
					}),
			},
		),
	])
}
