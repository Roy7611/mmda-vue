import { defineComponent, h, inject, computed, getCurrentInstance, ref, reactive, onBeforeMount } from 'vue';
import './Tres.less';
import { ContextMenu } from './ContextMenu';
export const Tree = defineComponent({
	name: 'Tree',
	props: {
		context: Array as any,
		treeProps: Object as any,
	},
	emits: ['nodeClick'],
	setup(props, { emit }) {
		const { $ui: ui, $t: t } = props.context.globalProps;
		const apiClient = props.context.logic?.apiClient ?? props.context.app?.api;
		const rootParams = reactive({
			...props.treeProps.rootUrlParams,
		});
		const materialsName = reactive({
			list: {
				RootDirectory: '',
				Brothers: '',
				Subdirectory: '',
				rename: '',
			},
		});
		const selectedKey = ref('categoryID');
		const loading = ref(false);
		const childrenData = ref([]);
		const nodes = ref([]) as any;
		// tree数杮
		const treeData = ref([]);
		// 杜索表坕
		const treeForm = reactive({
			searchWord: '',
		});
		// 生命周期
		onBeforeMount(() => {
			getRootData();
		});

		//获坖根目�?
		const getRootData = () => {
			rootParams.queryParams.searchWord = treeForm.searchWord;
			// eslint-disable-next-line no-async-promise-executor
			return new Promise(async (resolve, reject) => {
				const res: any = await apiClient.getAll(rootParams);
				if (res.list && res.list.length > 0) {
					treeData.value = res.list;
					resolve(true);
				} else {
					if (props.treeProps.baseRootDirectory && props.treeProps.repository == 'DocCategories') {
						treeData.value = [];
						treeData.value.push(props.treeProps.baseRootDirectory);
						console.log('treeData.value', treeData.value);
					}
					reject(false);
				}
			});
		};
		const handleFn = (type: string, data: any) => {
			const key = type.includes('add') ? 'add' : type;
			switch (key) {
				case 'add':
					addHandle(type, data);
					break;
				case 'delete':
					delHandle(data);
					break;
				case 'rename':
					editHandle(data);
					break;
				default:
					break;
			}
		};
		const addHandle = async (key: string, data: any) => {
			const { categoryName, categoryID, categoryCode, parentCatID } = data;
			let title: string = '';
			let depth: number = data.depth;
			let parentID: string | number = '';
			let name: string = '';
			switch (key) {
				case 'addRootDirectory':
					title = t('tool.addRootDirectory');
					depth = 0;
					parentID = '';
					name = materialsName.list.RootDirectory;
					break;
				case 'addBrothers':
					title = t('tool.addSiblingDirectory');
					parentID = parentCatID;
					name = materialsName.list.Brothers;
					break;
				case 'addSubdirectory':
					title = t('tool.addSubdirectory');
					depth = depth + 1;
					parentID = categoryID;
					name = materialsName.list.Subdirectory;
					break;
				default:
					break;
			}
			try {
				const res: any = await apiClient.http.postJson(props.treeProps.createUrl, {
					depth,
					categoryName: name,
				});
				await saveFn({ ...res, entityState: 2, parentCatID: parentID, categoryName: name });
			} catch (error: any) {
				props.context.uiBuilder.toast(props.context, {
					severity: 'error',
					title: t('dialog.title.error'),
					message: error.message ?? t('auth.operationFailed'),
					life: 3000,
				});
			}
		};
		const delHandle = async (data: any) => {
			//根目录禝止删�?
			if (data.categoryID == '-1') {
				props.context.uiBuilder.toast(props.context, {
					severity: 'error',
					title: t('dialog.title.error'),
					message: t('invalid.rootDirectoryCannotDelete'),
					life: 3000,
				});
				return false;
			}

			const { categoryName, categoryID, categoryCode, childrenCount } = data;
			let params: any = {};
			if (childrenCount) {
				await getChildrenData(categoryID);
				params = [
					...childrenData.value.map((children: any) => {
						return children.categoryID;
					}),
					categoryID,
				];
			} else {
				params = {
					categoryID,
				};
			}
			await deleteFn(childrenCount, params);
		};
		const editHandle = async (data: any) => {
			try {
				await saveFn({ ...data, entityState: 1, categoryName: materialsName.list.rename });
			} catch (error: any) {
				props.context.uiBuilder.toast(props.context, {
					severity: 'error',
					title: t('dialog.title.error'),
					message: error.message ?? t('auth.operationFailed'),
					life: 3000,
				});
			}
		};
		// 目录擝作接坣方法
		const saveFn = (params: any) => {
			try {
				const res: any = apiClient.http.postJson(props.treeProps.saveUrl, params);
				res
					.then((res: any) => {
						getRootData();
						props.context.uiBuilder.toast(props.context, {
							severity: 'success',
							title: t('dialog.success'),
							message: t('success.operationSuccessful'),
							life: 3000,
						});
						materialsName.list.RootDirectory = '';
						materialsName.list.rename = '';
						materialsName.list.Brothers = '';
						materialsName.list.Subdirectory = '';
					})
					.catch((err: any) => {
						props.context.uiBuilder.toast(props.context, {
							severity: 'error',
							title: t('dialog.title.error'),
							message: err.message ?? t('auth.operationFailed'),
							life: 3000,
						});
						console.log('saveFn2', err);
					});
			} catch (error: any) {
				props.context.uiBuilder.toast(props.context, {
					severity: 'error',
					title: t('dialog.title.error'),
					message: error.message ?? t('auth.operationFailed'),
					life: 3000,
				});
			}
		};
		const deleteFn = (childrenCount: number, params: any) => {
			try {
				if (childrenCount) {
					const res: any = apiClient.deleteAll(params, props.treeProps.deleteAllUrlParams);
					res
						.then((res: any) => {
							// rootUrlParams.queryParams.pageNo = 1;
							getRootData();
							props.context.uiBuilder.toast(props.context, {
								severity: 'success',
								title: t('dialog.success'),
								message: t('success.operationSuccessful'),
								life: 3000,
							});
						})
						.catch((err: any) => {
							props.context.uiBuilder.toast(props.context, {
                                severity: 'error',
                                title: t('dialog.title.error'),
                                message: err.message ?? t('auth.operationFailed'),
                                life: 3000
                            })
						});
				} else {
					const res: any = apiClient.http.deleteJson(`${props.treeProps.deleteJsonUrl}/${params.categoryID}`, params.categoryID);
					res
						.then((res: any) => {
							console.log('deleteFn', res);
							// rootUrlParams.queryParams.pageNo = 1;
							getRootData();
							props.context.uiBuilder.toast(props.context, {
								severity: 'success',
								title: t('dialog.success'),
								message: t('success.operationSuccessful'),
								life: 3000,
							});
						})
						.catch((err: any) => {
							console.log('deleteFn', err);
							props.context.uiBuilder.toast(props.context, {
								severity: 'error',
								title: t('dialog.title.error'),
								message: err.message ?? t('auth.operationFailed'),
								life: 3000,
							});
						});
				}

				// console.log('ProductionSchedules/getWeeklyPlan', res);
			} catch (error: any) {
				props.context.uiBuilder.toast(props.context, {
					severity: 'error',
					title: t('dialog.title.error'),
					message: error.message ?? t('auth.operationFailed'),
					life: 3000,
				});
			}
		};
		// 杜索方法
		const searchFn = () => getRootData();
		//获坖孝目�?
		// path 杺带id覝在props中传过来判断
		const getChildrenData = (categoryID: string | number) => {
			const path =
				props.treeProps.childrenUrlParams.path?.split('/')[0] === 'categoryID'
					? `${categoryID}/${props.treeProps.childrenUrlParams.path?.split('/')[1]}`
					: props.treeProps.childrenUrlParams.path && '';

			const queryParamsKeys = Object.keys(props.treeProps.childrenUrlParams.queryParams);
			const queryParams: any = {};
			queryParamsKeys.forEach((key: string) => {
				queryParams[key] = `${props.treeProps.childrenUrlParams.queryParams[key]}`;
			});

			const urlParams = { ...props.treeProps.childrenUrlParams, path, queryParams };
			// eslint-disable-next-line no-async-promise-executor
			return new Promise(async (resolve, reject) => {
				try {
					const res: any = await apiClient.getAll(urlParams);
					if (res.list && res.list.length > 0) {
						childrenData.value = res.list;
					}
					resolve(true);
					console.log('getChildrenData', res);
				} catch (error: any) {
					reject(error);
				}
			});
		};
		return () =>
			h('div', { class: 'tree dark_tree' }, [
				h(
					'div',
					{ class: 'form' },
					ui.factory.formField(
						{
							label: t('tool.categoryFilter'),
							class: 'flex_item_center',
						},
						{
							default: () =>
								ui.factory.inputGroup({
									modelValue: treeForm.searchWord,
									onUpdate: (val: any) => {
										console.log(val, 'val');
										treeForm.searchWord = val;
									},
									onAction: () => {
										searchFn();
									},
								}),
						}
					)
				),
				ui.factory.tree(
					treeData.value,
					{
						showContextMenu: true,
						loading: loading.value,
						loadingMode: 'icon',
						selectionMode: 'single',
						metaKeySelection: true,
						onNodeSelect: (data: any) => {
							emit('nodeClick', data.categoryID);
						},
						onContextmenu: (event: any, node: any) => {
							nodes.value = node;
						},
						// onNodeExpand: async (node: any) => {
						//     // if (node.children.length === 0) {
						//     //     node.loading = true
						//     //     const url = await getChildrenDataUrl(node.categoryID)
						//     //     console.log(node, '1111');

						//     //     try {
						//     //         const res = await apiClient.getAll(url)
						//     //         console.log(res, '1111');
						//     //         if (res.list && res.list.length > 0) {
						//     //             const data = res.list.map((item: any) => {
						//     //                 item.label = item.categoryName,
						//     //                 delete item.categoryName
						//     //                 return item
						//     //             })
						//     //             treeData.value
						//     //         }
						//     //     } catch (error) {

						//     //     }
						//     // }

						// },
						contextMenuItems:
							treeData.value.length > 0 && treeData.value[0].categoryID == '-1'
								? [
									{
										label: t('tool.addRootDirectory'),
										command: () => {
											props.context.uiBuilder.dialog(
												h(ContextMenu, {
													context: props.context,
													propsData: {
														label: t('tool.addRootDirectory'),
													},
													onGetData: (value: string) => (materialsName.list.RootDirectory = value),
												}),
												props.context,
												{
													title: t('tool.addRootDirectory'),
													width: '30%',
													height: '30%',
													showFooter: true,
													onAccept: async (button) => {
													  if (materialsName.list.RootDirectory.trim().length === 0) {
														props.context.uiBuilder.toast(props.context, {
															severity: 'error',
															title: t('dialog.title.error'),
															message: t('invalid.required'),
															life: 3000
														})
														return false
													}
														handleFn('addRootDirectory', nodes.value);
														return true;
													},
												}
											);
										},
									},
								]
								: [
									{
										label: t('tool.addRootDirectory'),
										command: () => {
											props.context.uiBuilder.dialog(
												h(ContextMenu, {
													context: props.context,
													propsData: {
														label: t('tool.addRootDirectory'),
													},
													onGetData: (value: string) => (materialsName.list.RootDirectory = value),
												}),
												props.context,
												{
													title: t('tool.addRootDirectory'),
													width: '30%',
													height: '30%',
													showFooter: true,
													onAccept: async (button) => {
													  if (materialsName.list.RootDirectory.trim().length === 0) {
														props.context.uiBuilder.toast(props.context, {
															severity: 'error',
															title: t('dialog.title.error'),
															message: t('invalid.required'),
															life: 3000
														})
														return false
													}
														handleFn('addRootDirectory', nodes.value);
														return true;
													},
												}
											);
										},
									},
									{
										label: t('tool.addSiblingDirectory'),
										command: (node: any) => {
											props.context.uiBuilder.dialog(
												h(ContextMenu, {
													context: props.context,
													propsData: {
														label: t('tool.addSiblingDirectory'),
													},
													onGetData: (value: string) => (materialsName.list.Brothers = value),
												}),
												props.context,
												{
													title: t('tool.addSiblingDirectory'),
													width: '30%',
													height: '30%',
													showFooter: true,
													onAccept: async (button) => {
													  if (materialsName.list.Brothers.trim().length === 0) {
														props.context.uiBuilder.toast(props.context, {
															severity: 'error',
															title: t('dialog.title.error'),
															message: t('invalid.required'),
															life: 3000
														})
														return false
													}
														handleFn('addBrothers', nodes.value);
														return true;
													},
												}
											);
										},
									},
									{
										label: t('tool.addSubdirectory'),
										command: () => {
											props.context.uiBuilder.dialog(
												h(ContextMenu, {
													context: props.context,
													propsData: {
														label: t('tool.addSubdirectory'),
													},
													onGetData: (value: string) => (materialsName.list.Subdirectory = value),
												}),
												props.context,
												{
													title: t('tool.addSubdirectory'),
													width: '30%',
													height: '30%',
													showFooter: true,
													onAccept: async (button) => {
													  if (materialsName.list.Subdirectory.trim().length === 0) {
														props.context.uiBuilder.toast(props.context, {
															severity: 'error',
															title: t('dialog.title.error'),
															message: t('invalid.required'),
															life: 3000
														})
														return false
													}
														handleFn('addSubdirectory', nodes.value);
														return true;
													},
												}
											);
										},
									},
									{
										label: t('tool.deleteDirectory'),
										key: 'delete',
										command: () => {
											if (await props.context.uiBuilder.confirm(props.context, {
												title: t('action.confirm'),
												message: t('dialog.areYourSure'),
											})) {
												handleFn('delete', nodes.value);
												return true;
											}
										},
									},
									{
										label: t('tool.rename'),
										command: () => {
											props.context.uiBuilder.dialog(
												h(ContextMenu, {
													context: props.context,
													propsData: {
														label: t('tool.rename'),
														name: nodes.value.categoryName,
													},
													onGetData: (value: string) => (materialsName.list.rename = value),
												}),
												props.context,
												{
													title: t('tool.rename'),
													width: '30%',
													height: '30%',
													showFooter: true,
													onAccept: async (button) => {
													  if (materialsName.list.rename.trim().length === 0) {
														props.context.uiBuilder.toast(props.context, {
															severity: 'error',
															title: t('dialog.title.error'),
															message: t('invalid.required'),
															life: 3000
														})
														return false
													}
														handleFn('rename', nodes.value);
														return true;
													},
												}
											);
										},
									},
								],
					},
					{
						default: (v: any) => {
							const { node } = v;
							// node.key = node.categoryName
							return ui.factory.textSpan(node.categoryName);
						},
					}
				),
			]);
	},
});
