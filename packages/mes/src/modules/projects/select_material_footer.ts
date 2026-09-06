import { defineComponent, h, inject } from 'vue'
import { primeVueFactory } from '@/compat/primevue_legacy'
import type { UiContext } from '@mmda/core'

export function confirmCenterNode(text: string) {
	return h('div', { class: 'confirmCenter' }, [text])
}

export function createSelectMaterialFooter(param: {
	t: (key: string) => string
	context: UiContext
	selectMetarlList: { data: any[] }
	apiClient: any
}) {
	const { t, context, selectMetarlList, apiClient } = param
	return defineComponent({
		name: 'DialogFooter',
		setup: () => {
			const dialogRef: any = inject('dialogRef')
			return () =>
				primeVueFactory.buttonGroup(() => [
					primeVueFactory.button({
						outlined: true,
						label: t('action.cancel'),
						class: 'mr-2',
						icon: 'pi pi-times',
						colorRole: 'info',
						severity: 'danger',
						id: 'dlg-cancel-button',
						role: 'dlg-cancel-pick-button',
						onAction: async () => {
							dialogRef.value.close()
						},
					}),
					primeVueFactory.button({
						outlined: true,
						label: t('action.generatePurchaseOrder'),
						class: 'mr-2',
						id: 'dlg-confirm-button',
						role: 'dlg-confirm-pick-button',
						icon: 'pi pi-check',
						colorRole: 'info',
						onAction: async () => {
							if (selectMetarlList.data.length <= 0) {
								context.uiBuilder.toast(context, {
									severity: 'error',
									summary: t('invalid.requiredSelectAny'),
									group: 'br',
									life: 3000,
								})
								return false
							}
							const submitData = {
								refName: 'Project',
								refID: null as any,
								refItemKeys: [] as any[],
							}
							submitData.refItemKeys = selectMetarlList.data.map((item: any) => ({
								refName: item.refName,
								refID: item.refID,
								refItemID: item.refItemID,
								tenantID: item.tenantID,
							}))
							try {
								const resPackages = await apiClient.doAction(
									{
										action: 'create',
										repository: 'PurchaseOrders',
										service: 'srm',
									},
									submitData,
								)
								if (resPackages) {
									context.uiBuilder.toast(context, {
										severity: 'success',
										summary: t('success.operationSuccessful'),
										life: 3000,
									})
									return true
								}
							} catch (error: any) {
								context.uiBuilder.toast(context, {
									severity: 'error',
									title: t('dialog.title.error'),
									summary: error.detail ?? '',
									group: 'br',
									life: 3000,
								})
								return false
							}
						},
					}),
					primeVueFactory.button({
						outlined: true,
						label: t('action.generatePurchaseContract'),
						class: 'mr-2',
						id: 'dlg-confirm-button',
						role: 'dlg-confirm-pick-button',
						icon: 'pi pi-check',
						colorRole: 'success',
						onAction: async () => {
							if (selectMetarlList.data.length <= 0) {
								context.uiBuilder.toast(context, {
									severity: 'error',
									summary: t('invalid.requiredSelectAny'),
									group: 'br',
									life: 3000,
								})
								return false
							}
							const submitData = {
								refName: 'Project',
								refID: null as any,
								refItemKeys: [] as any[],
							}
							submitData.refItemKeys = selectMetarlList.data.map((item: any) => ({
								refName: item.refName,
								refID: item.refID,
								refItemID: item.refItemID,
								tenantID: item.tenantID,
							}))
							try {
								const resPackages = await apiClient.doAction(
									{
										action: 'create',
										repository: 'SupplyContracts',
										service: 'srm',
									},
									submitData,
								)
								if (resPackages) {
									context.uiBuilder.toast(context, {
										severity: 'success',
										summary: t('success.operationSuccessful'),
										life: 3000,
									})
									setTimeout(() => {
										context.reload()
									}, 2000)
								}
							} catch (error: any) {
								context.uiBuilder.toast(context, {
									severity: 'error',
									title: t('dialog.title.error'),
									summary: error.detail ?? '',
									group: 'br',
									life: 3000,
								})
								return false
							}
						},
					}),
				])
		},
	})
}
