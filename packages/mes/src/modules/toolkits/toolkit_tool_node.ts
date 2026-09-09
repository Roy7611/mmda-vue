import { h } from 'vue'
import type { MetaUiGroup, UiProps } from '@mmda/core'
import { MetaModel } from '@mmda/core'
import { UiViewOne, type UiViewContext } from '@mmda/vui'
import type { Tool } from '@/models/Tool'

function callBagHandler(
	props: UiProps,
	key: string,
	...args: unknown[]
): void {
	const fn = props[key]
	if (typeof fn === 'function') {
		;(fn as (...a: unknown[]) => void)(...args)
	}
}

export function toolkitEmptyNode(context: UiViewContext<any>) {
	return h('div', {
		class: 'flex-1 overflow-y-auto p-4! col-span-full flex items-center justify-center text-gray-500',
		id: 'tool-list-empty',
	}, context.t('empty.select'))
}

export function toolkitToolCardNode(
	item: Tool,
	group: MetaUiGroup,
	context: UiViewContext<any>,
	props: UiProps,
	dimmed: boolean,
) {
	const { uiBuilder } = context
	return h('div', {
		class: `tool-item w-full h-full relative flex flex-col col-span-3 items-start justify-center bg-gray-100 pb-2 opacity-${dimmed ? '50' : '100'}`,
		id: `tool-${item.toolID}`,
		draggable: true,
		onDragstart: (e: DragEvent) => callBagHandler(props, 'onDragstart', e, context, item),
		onDragenter: (e: DragEvent) => callBagHandler(props, 'onDragenter', e, context, item),
		onDragover: (e: DragEvent) => callBagHandler(props, 'onDragover', e, context, item),
		onDragend: (e: DragEvent) => callBagHandler(props, 'onDragend', e, context, item),
	}, [
		uiBuilder.factory.badge({
			value: item.toolkitIndex,
			colorRole: 'info',
			class: 'absolute top-2 left-2 z-10',
		}),
		h('div', { class: 'w-full h-36 flex-shrink-0 flex items-center justify-center rounded-lg relative overflow-hidden bg-gray-50' }, [
			item.toolPic
				? uiBuilder.factory.image(item.toolPic, {
					preview: false,
					draggable: false,
					class: 'object-cover rounded-md pt-2',
					style: { width: '100%', height: '100%' },
					imageStyle: { width: '100%', height: '100%', objectFit: 'contain' },
				})
				: h('i', {
					class: 'pi pi-box text-2xl text-gray-400',
					style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
				}),
		]),
		h('div', { class: 'flex-1 w-full pt-2 pb-2 min-w-0 px-2' }, [
			h('div', { class: 'font-semibold text-gray-800 text-sm leading-tight break-all text-center' }, [
				`${item.toolName}(${item.toolNo})`,
			]),
		]),
		h('div', { class: 'w-full flex justify-evenly' },
			context.view === UiViewOne.Details ? [
				uiBuilder.factory.button({
					role: `view-${group.groupName}-action`,
					id: `view-${group.groupName}-button`,
					outlined: true,
					icon: 'pi pi-eye',
					colorRole: 'info',
					label: context.t('action.details'),
					onAction: () => context.subGroupItem(group, item, {
						groupMode: 'details',
						initMetadataParams: () => ({
							redirection: item?.category?.materialX,
							queryParams: { xMetaObject: item?.category?.materialX },
						}),
					}),
				}),
			] : [
				uiBuilder.factory.button({
					role: `view-${group.groupName}-action`,
					id: `view-${group.groupName}-button`,
					outlined: true,
					icon: 'pi pi-eye',
					colorRole: 'info',
					label: context.t('action.details'),
					onAction: () => context.subGroupItem(group, item, {
						groupMode: 'details',
						initMetadataParams: () => ({
							redirection: item?.category?.materialX,
							queryParams: { xMetaObject: item?.category?.materialX },
						}),
					}),
				}),
				uiBuilder.factory.button({
					role: `delete-${group.groupName}-action`,
					id: `delete-${group.groupName}-button`,
					outlined: true,
					icon: 'pi pi-trash',
					colorRole: 'info',
					severity: 'error',
					label: context.t('action.delete'),
					onAction: () => {
						context.removeSubGroupItem(group, item)
					},
				}),
			]),
	])
}

export function toolkitToolListNode(
	group: MetaUiGroup,
	context: UiViewContext<any>,
	props: UiProps,
	currentId?: string,
	targetId?: string,
) {
	const activeTools = (context.model.tools ?? []).filter((item: Tool) => !MetaModel.deleted(item))
	if (activeTools.length === 0) return toolkitEmptyNode(context)
	return h(
		'div',
		{
			class: 'flex-1 overflow-y-auto p-2! col-span-full',
			id: 'tool-list',
		},
		activeTools.map((item: Tool) =>
			h(
				'div',
				{ key: item.toolID, class: 'mmda-tool-card-wrap' },
				toolkitToolCardNode(item, group, context, props, currentId !== targetId),
			),
		),
	)
}
