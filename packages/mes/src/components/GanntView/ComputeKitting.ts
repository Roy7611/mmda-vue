import { defineComponent, reactive, toRaw, toRef, h, onMounted, computed, ref, onBeforeMount, getCurrentInstance, inject } from 'vue';
import { defineEntity, type MetaUiService, type Module, type ModuleAction, type MetaUiField, MetaModel } from '@mmda/core';
import '../GanntView/GanntView.less';
import { MES_KEY } from '@/keys';
import { ProjectScheduleLogic, ProjectScheduleLogicCtor } from '@/modules/project_schedule/ProjectScheduleLogic';
import { useRouter, useRoute } from 'vue-router';
import { loading, UiBuildContext, type UiContext, UI_CREATE } from '@mmda/vui';
import { MaterialTracingModeEnum } from '@mmda/base/src/enums/MaterialTracingMode';
import { type MaterialTrans } from '@/models/MaterialTrans';
import { MaterialTransEditor } from '@/modules/material_transes/MaterialTransEditor';
import { reject } from 'lodash';

const PROJECT_GROUP_ID = 'projectID';
const ORDER_GROUP_ID = 'orderID';

export default defineComponent({
	name: 'ComputeKitting',
	props: {},
	setup: (props, { emit }) => {
		const { appContext } = getCurrentInstance();
		const mes = inject(MES_KEY);
		const { meta: metaUiService, di, i18n, ui } = mes;
		const router = useRouter();
		const route = useRoute();
		const projectID = ref((route.query.projectID as string) || '');
		const orderID = ref((route.query.orderID as string) || '');
		const pageType = ref((route.query.type as string) || '');
		const orderNo = ref((route.query.orderNo as string) || '');
		console.log(route, '1111');
		const planID = ref((route.query.planID as string) || '')
		/** 来自排程：project=按项目，order=按生产订单 */
		const scheduleView = ref<'project' | 'order'>(
			(() => {
				const raw = (route.query.scheduleView as string) || '';
				if (raw === 'order') return 'order';
				if (raw === 'project') return 'project';
				// 兼容只带 orderID 的跳转
				if (route.query.orderID && !route.query.projectID) return 'order';
				return 'project';
			})()
		);
		const module = route?.meta?.module;


		const filterAuthModule = (modules: Module[]): Module[] => {
			const result: Module[] = [];
			modules.forEach((m: Module) => {
				if (m.moduleCode === route.query.moduleCode) {
					result.push(m);
				} else if (m.subModules && m.subModules.length) {
					result.push(...filterAuthModule(m.subModules));
				}
			});
			return result;
		};

		const allowKitting = computed(() => {
			if (route.query.moduleCode) {
				return !!filterAuthModule(mes.modules)[0]?.authority?.authorizedActions.find((item: ModuleAction) => item.actionName === 'kitCheckIssue');
			} else {
				return false;
			}
		});

		const canReadProject = ref(false);
		const canReadProductionOrder = ref(false);
		const hasScheduleReadPermission = computed(
			() => canReadProject.value || canReadProductionOrder.value
		);
		/** 齐料检查按生产订单视图（含无项目权限） */
		const isOrderKittingView = computed(
			() =>
				pageType.value === 'CompleteMaterial' &&
				(scheduleView.value === 'order' || !canReadProject.value)
		);
		/** 齐料检查按项目视图 */
		const isProjectKittingView = computed(
			() => pageType.value === 'CompleteMaterial' && !isOrderKittingView.value
		);
		const showProjectFilter = computed(
			() => canReadProject.value && !isOrderKittingView.value
		);
		const showOrderFilter = computed(
			() =>
				pageType.value === 'CompleteMaterial' &&
				isOrderKittingView.value &&
				canReadProductionOrder.value
		);

		/** 与 GanntView 一致：从模块树解析项目 / 生产订单读取权限 */
		const resolveScheduleViewPermissions = () => {
			canReadProject.value = false;
			canReadProductionOrder.value = false;

			mes.modules.forEach((item: any) => {
				if (item.moduleCode == 'M.02' && item.subModules) {
					item.subModules.forEach((i: any) => {
						if (i.moduleCode == 'M.02.001' && i.authority?.allowRead) {
							canReadProject.value = true;
						}
					});
				}
				if (item.moduleCode == 'M.03' && item.subModules) {
					item.subModules.forEach((i: any) => {
						if (
							(i.objName === 'ProductionOrder' || i.moduleUrl?.includes('ProductionOrders')) &&
							i.authority?.allowRead
						) {
							canReadProductionOrder.value = true;
						}
					});
				}
			});
		};

		/**
		 * 接口 groups 字段可能是 id|value|key + label|text|name。
		 * MultiSelect 固定 optionValue=id、optionLabel=label，只做字段映射，不增删选项。
		 */
		const normalizeGroupOption = (opt: any): { id: string; label: string } | null => {
			if (opt == null) return null;
			if (typeof opt === 'string') {
				const text = opt.trim();
				return text ? { id: text, label: text } : null;
			}
			const id = opt.id ?? opt.value ?? opt.key ?? opt.field ?? opt.fieldName;
			const label = opt.label ?? opt.text ?? opt.name ?? opt.displayLabel ?? id;
			if (id == null || String(id).trim() === '') return null;
			if (label == null || String(label).trim() === '') return null;
			return { id: String(id).trim(), label: String(label).trim() };
		};

		const filterGroupOptionsByPermission = (options: any[]) => {
			const map = new Map<string, { id: string; label: string }>();
			(options ?? []).forEach(raw => {
				const opt = normalizeGroupOption(raw);
				if (!opt) return;
				// 仅对排程权限相关的两项做权限过滤，其余业务分组原样保留
				if (opt.id === PROJECT_GROUP_ID && !canReadProject.value) return;
				if (opt.id === ORDER_GROUP_ID && !canReadProductionOrder.value) return;
				map.set(opt.id, opt);
			});
			return [...map.values()];
		};

		const sanitizeGroupBy = (value: any) => {
			const arr = Array.isArray(value) ? value : value ? [value] : [];
			return arr
				.map((item: any) =>
					typeof item === 'string' || typeof item === 'number'
						? String(item)
						: item?.id ?? item?.value ?? item?.key ?? item?.field
				)
				.filter((id: any) => id != null && String(id).trim() !== '')
				.map((id: any) => String(id).trim())
				.filter((id: string) => {
					if (id === PROJECT_GROUP_ID) {
						return canReadProject.value;
					}
					if (id === ORDER_GROUP_ID) {
						return canReadProductionOrder.value;
					}
					return true;
				});
		};

		const findProjectGroupOption = (options: { id: string; label: string }[]) =>
			(options ?? []).find(
				(o: { id: string; label: string }) =>
					o.id === PROJECT_GROUP_ID || o.label === '项目' || o.id === '项目'
			);

		const findOrderGroupOption = (options: { id: string; label: string }[]) =>
			(options ?? []).find(
				(o: { id: string; label: string }) =>
					o.id === ORDER_GROUP_ID ||
					o.id === '订单' ||
					o.label === '订单' ||
					o.label === '生产订单' ||
					o.id === '生产订单'
			);

		const isProjectGroupOption = (o: { id: string; label: string }) => !!findProjectGroupOption([o]);
		const isOrderGroupOption = (o: { id: string; label: string }) => !!findOrderGroupOption([o]);

		const hasProjectContext = () => !!(reloadParam.projectID || projectID.value);

		/** 齐料检查按订单视图：分组锁定为「订单」，不可改 */
		const isGroupLockedToOrder = computed(() => isOrderKittingView.value);

		const ensureOrderGroupOption = (options: { id: string; label: string }[]) => {
			const found = findOrderGroupOption(options);
			if (found) return found;
			return { id: ORDER_GROUP_ID, label: '订单' };
		};

		const ensureProjectGroupOption = (options: { id: string; label: string }[]) => {
			const found = findProjectGroupOption(options);
			if (found) return found;
			return { id: PROJECT_GROUP_ID, label: '项目' };
		};

		/** 按排程视图过滤分组选项：按项目藏订单，按订单藏项目 */
		const filterGroupsForScheduleView = (options: { id: string; label: string }[]) => {
			if (pageType.value !== 'CompleteMaterial') {
				return options;
			}
			if (isOrderKittingView.value) {
				return (options ?? []).filter(o => !isProjectGroupOption(o));
			}
			if (isProjectKittingView.value) {
				return (options ?? []).filter(o => !isOrderGroupOption(o));
			}
			return options;
		};

		/** 未选分组时的默认值（按场景） */
		const resolveDefaultGroupBy = (options?: { id: string; label: string }[]) => {
			const opts = options ?? groupOption.value ?? [];
			if (isOrderKittingView.value) {
				return [ensureOrderGroupOption(opts).id];
			}
			if (isProjectKittingView.value || hasProjectContext()) {
				return [ensureProjectGroupOption(opts).id];
			}
			return [];
		};

		/** 请求/展示用分组 */
		const getEffectiveGroupBy = () => {
			if (isGroupLockedToOrder.value) {
				return resolveDefaultGroupBy();
			}
			const current = sanitizeGroupBy(groupBy.value);
			if (current.length) return current;
			return resolveDefaultGroupBy();
		};

		const applyGroupStateFromResponse = (groups: any[], selectedGroupBy: any) => {
			let fromApi = filterGroupsForScheduleView(filterGroupOptionsByPermission(groups ?? []));

			// 按订单：只保留/补齐「订单」，锁定选中
			if (isOrderKittingView.value) {
				const orderOpt = ensureOrderGroupOption(fromApi);
				groupOption.value = [orderOpt];
				groupBy.value = [orderOpt.id];
				return;
			}
			// 按项目：去掉订单选项，默认选中项目
			if (isProjectKittingView.value) {
				fromApi = fromApi.filter(o => !isOrderGroupOption(o));
				if (!findProjectGroupOption(fromApi)) {
					fromApi = [ensureProjectGroupOption([]), ...fromApi];
				}
				groupOption.value = fromApi;
				const optionIds = new Set(fromApi.map(o => String(o.id)));
				const sanitized = sanitizeGroupBy(selectedGroupBy ?? groupBy.value).filter((id: string) =>
					optionIds.has(String(id))
				);
				groupBy.value = sanitized.length
					? sanitized
					: [ensureProjectGroupOption(fromApi).id];
				return;
			}

			if (fromApi.length) {
				groupOption.value = fromApi;
			}
			const optionIds = new Set(
				(groupOption.value ?? [])
					.map((o: any) => o?.id)
					.filter((id: any) => id != null && String(id).trim() !== '')
					.map((id: any) => String(id))
			);
			groupBy.value = sanitizeGroupBy(selectedGroupBy ?? groupBy.value).filter((id: string) =>
				optionIds.has(String(id))
			);
			if (!groupBy.value.length) {
				const defaults = resolveDefaultGroupBy(groupOption.value ?? []).filter((id: string) =>
					optionIds.has(String(id))
				);
				if (defaults.length) {
					groupBy.value = defaults;
				}
			}
		};

		/** 齐料树表列：无项目读取权限 / 按订单视图时不展示「项目」列 */
		const shouldShowKittingTableColumn = (field: string) => {
			if (field === '项次' || field === 'projectID' || field === 'orderID' || field === '现场装配') {
				return false;
			}
			if (field === '项目' && (!canReadProject.value || isOrderKittingView.value)) {
				return false;
			}
			return true;
		};

		const viewProps: any = {
			pageNo: 1,
			pageSize: 10,
			queryParams: {},
			searchWord: undefined,
			showFilters: false,
			sort: undefined,
			view: 'index',
		};
		const { $t, $toast: toast } = getCurrentInstance().appContext.app.config.globalProperties;
		const logic =
			di.tryInject<ProjectScheduleLogic>('productionScheduleLogic') ??
			ProjectScheduleLogicCtor(metaUiService, router, module as Module | undefined);
		let ctx: UiBuildContext<any>;

		const showLoading = ref(false);
		const selectgProject = ref();
		const temporarilySelectg = ref();
		const lineData = ref<any[]>([]);
		const linecolumns = ref([]);
		const projecDataKEY = ref('projectID');

		const selectgOrder = ref();
		const temporarilySelectOrder = ref();
		const orderData = ref<any[]>([]);
		const ordercolumns = ref([]);
		const orderDataKEY = ref('orderID');

		const formatProductionOrderSelectLabel = (order: any) => {
			if (!order) return '';
			const no = String(order.orderNo ?? '').trim();
			const productName = String(
				order.productName ?? order.customProperties?.$productName ?? ''
			).trim();
			return [no, productName].filter(Boolean).join('/') || String(order.orderID ?? '');
		};

		// 选中的数据key集合
		const selectionKeys = ref();
		//多选的选中数组
		const multiSelectList = ref<any[]>([]);

		//领料模式
		const kittingMode = ref(false);

		/** 收集节点及其子孙的 key */
		const collectNodeKeys = (node: any, keys: Set<string> = new Set()) => {
			if (node?.key != null) keys.add(node.key);
			(node?.children ?? []).forEach((child: any) => collectNodeKeys(child, keys));
			return keys;
		};

		/** 取消勾选时按 key 从 multiSelectList 移除（含子孙），避免引用不相等导致删不掉 */
		const clearSelection = (value: any) => {
			const keysToRemove = collectNodeKeys(value);
			if (!keysToRemove.size) return;
			multiSelectList.value = multiSelectList.value.filter((item: any) => !keysToRemove.has(item.key));
		};

		// 递归更新父节点的选中状态
		const updateCheckStatus = (nodeList: any[]) => {
			const walk = (nodes: any[]) => {
				nodes.forEach(node => {

					// 先处理子节点
					if (node.children?.length) {
						walk(node.children);

						const children = node.children;

						const allChecked = children.every(
							(c: any) => selectionKeys.value?.[c.key]?.checked
						);

						const someChecked = children.some(
							(c: any) =>
								selectionKeys.value?.[c.key]?.checked ||
								selectionKeys.value?.[c.key]?.partialChecked
						);

						selectionKeys.value[node.key] = {
							checked: allChecked,
							partialChecked: !allChecked && someChecked,
						};
					}
				});
			};

			walk(nodeList);
		};
		// 递归过滤掉不能选择的数据
		const filterSelection = (value: any) => {
			if (value.key.includes('.')) {
				const keys = value.key.split('.');
				keys.pop();
				selectionKeys.value[keys.join('.')].partialChecked = false;
			}
			if (value.data && (!value.data.materialID || !value.data.kittingQty)) {
				selectionKeys.value[value.key].checked = false;
			}
			if (value.children && value.children.length > 0) {
				value.children.forEach((child: any) => {
					filterSelection(child);
				})
			}
		}

		// 递归过滤树形数据中能转换成移料清单的数据（必须仍处于勾选状态）
		const filterTreeData = (items: any[]): any[] => {
			const result: any[] = [];
			items.forEach((item: any) => {
				const checked = !!selectionKeys.value?.[item.key]?.checked;
				if (
					checked &&
					item.data &&
					item.data.materialID &&
					item.data.kittingQty &&
					result.indexOf(item.data) === -1
				) {
					result.push(item.data);
				}
				if (item.children && item.children.length > 0) {
					// 父节点在列表中时，只带入仍勾选的子节点，避免取消勾选后仍被带入
					result.push(...filterTreeData(item.children).filter((i: any) => result.indexOf(i) === -1));
				}
			});
			return result;
		};

		// 过滤出选中的数据中能转换成移料清单的数据
		const filterData = computed(() => {
			return filterTreeData(multiSelectList.value);
		});

		// 确认领料方法
		const confirmKitting = async () => {
			const { $ui: ui, $api: apiBox, $t: t } = ctx.globalProps;

			console.log(filterData.value, "数据。。。。")
			const params = filterData.value.map((item: any) => ({
				orderID: item.orderID ?? null,
				materialID: item.materialID,
				shortageQty: item.kittingQty,
			}));
			if (!filterData.value.length)
				return toast.add({
					severity: 'error',
					detail: '没有可以领料的数据',
					summary: '操作失败',
					group: 'br',
					life: 5000,
				});

			const firstItem = filterData.value[0];
			console.log(firstItem, "第一个数据")

			let materialTransCtx: UiContext<MaterialTrans>;
			// 拦截报错
			try {
				const res = await ctx.apiClient
					.doAction(
						{
							action: 'kitCheckIssue',
							repository: 'MaterialTranses',
						},
						params
					)
				if (res) {
					ui.confirmDialog(
						h(MaterialTransEditor, {
							id: '_',
							view: UI_CREATE,
							name: 'CompleteInspectionMaterialTrans',

							createFn: async (logic) => {
								return await ctx.apiClient
									.doAction(
										{
											action: 'kitCheckIssue',
											repository: 'MaterialTranses',
										},
										params
									)
									.then((res: any) => {
										console.log(res, "领料单")
										res.orderID = filterData.value[0].orderID;
										return logic.createEntity(res);
									}).catch((error: any) => {
										ctx.uiBuilder.toast(ctx, {
											severity: 'error',
											summary: t('dialog.title.error'),
											detail: error.message ?? '操作失败',
											group: 'br',
											life: 3000
										})
									});
							},
							params: {
								refName: 'CompleteInspection',
								orderID: firstItem?.orderID,
								projectID: firstItem?.projectID ?? reloadParam.projectID ?? undefined,
								refItemKeys: filterData.value.map((i: any) =>
									Object.assign(
										{},
										{
											refName: i.kittingQty,
											refID: i.materialID,
											// 生产订单
											orderID: i.orderID,
											// 工程项目
											projectID: i.projectID,
										}
									)
								),
							},
							onInit: (ctx: UiContext<MaterialTrans>) => {
								materialTransCtx = ctx;
								materialTransCtx.isEditDialog = true;
							},


						}),
						ctx,
						{
							name: 'createKittingMaterialTrans',
							title: '创建领料单',
							width: '80%',
							accept: async () => {
								return await materialTransCtx.save().then(() => {
									const key = materialTransCtx.metaui.primaryKey ?? 'id';
									const id = materialTransCtx.model.id ?? materialTransCtx.model[key];
									const service = (materialTransCtx.app?.name ?? 'mes').toUpperCase();
									const href = router.resolve(
										`/${service}/${materialTransCtx.logic.repository}/${encodeURIComponent(String(id ?? ''))}`
									).href;
									window.open(href, '_blank');
									multiSelectList.value = [];
									selectionKeys.value = [];
									kittingMode.value = false;
									return true;
								});
							},
							// 取消
							reject: async () => {
								// 关闭弹窗
								return true;
							},
						}
					);
				}

			} catch (error:any) {
				ctx.uiBuilder.toast(ctx, {
					 severity: 'error',
                    summary: t('dialog.title.error'),
                    detail: error.message ?? '操作失败',
                    group: 'br',
				})
			}
		};

		onBeforeMount(async () => {
			resolveScheduleViewPermissions();
			if (!hasScheduleReadPermission.value) {
				return;
			}

			// 分组选项等接口返回；齐料检查按排程视图预先锁定项目/订单
			if (isOrderKittingView.value) {
				const orderOpt = ensureOrderGroupOption([]);
				groupOption.value = [orderOpt];
				groupBy.value = [orderOpt.id];
			} else if (isProjectKittingView.value) {
				const projectOpt = ensureProjectGroupOption([]);
				groupOption.value = [projectOpt];
				groupBy.value = [projectOpt.id];
			} else {
				groupBy.value = [];
			}

			const pack = await metaUiService.getPack({
				repository: logic.repository,
				service: 'mes',
			});
			if (!pack?.metaui) {
				throw new Error(`未加载到仓库元数据：${logic.repository}`);
			}
			logic.meta = pack;
			ctx = new UiBuildContext({
				model: defineEntity(),
				metaui: pack.metaui,
				view: viewProps.view,
				loader: async () => {
					await logic.getData();
					return defineEntity();
				},
				logic,
				app: mes,
			});
			await ctx.load();
			if (projectID.value) {
				reloadParam.projectID = projectID.value;
			}
			if (orderID.value) {
				reloadParam.orderID = orderID.value;
			}
			if (showProjectFilter.value) {
				getProjectData(ctx);
			}
			if (showOrderFilter.value) {
				getOrderData(ctx);
			}

			if (pageType.value == 'CompleteMaterial') {
				getCompleteInspection(ctx, true);
			} else if (pageType.value == 'PreparationPlan') {
				getPreparationPlan(ctx, true);
			}

			// const { metaui } = await ctx.loadMetadata('ProjectMaterials', 'mes', true);
			// console.log('metaui', metaui);
			// metauiData.value = metaui;
		});

		const searchParam = reactive(<any>{
			pager: {
				pageSize: '',
				pageNo: '',
			},
			searchWord: '',
			projectID: '',
		});
		const reloadParam = reactive({
			searchWord: '',
			projectID: '',
			orderID: '',
			status: '',
		});
		//获取项目列表
		const getProjectData = async (ctx: any, value?: any) => {
			const { $ui: ui, $api: apiBox, $t: t } = ctx.globalProps;
			const { $api, $router } = ctx.globalProps;

			try {
				const res = await apiBox.getAll({
					repository: 'Projects',
					queryParams: {
						pageSize: searchParam.pager.pageSize,
						pageNo: searchParam.pager.pageNo,
						sort: '',
						searchWord: value ?? '',
						projectID: reloadParam.projectID ?? '',
					},
					service: 'mes',
				});
				searchParam.pager = res.pagination;
				lineData.value = res.list.map((it: any) => {
					return {
						...it,
						constraintType: it.customProperties.$constraintType,
						deptID: it.customProperties.$deptID,
						importance: it.customProperties.$importance,
						ownerID: it.customProperties.$ownerID,
						ownerDeptID: it.customProperties.$ownerDeptID,
						status: it.customProperties.$status,
						creatorID: it.customProperties.$creatorID,
						lastModifierID: it.customProperties.$lastModifierID,
						customerID: it?.customer?.partnerName ?? '',
						contractID: it?.contract?.contractName ?? '',
						addressID: it?.address?.addressDetail ?? '',
					}; //severity: it.customProperties.$severity
				});
				if (reloadParam.projectID) {
					if (lineData.value && lineData.value.length > 0) {
						selectgProject.value = lineData.value[0];
						temporarilySelectg.value = lineData.value[0];

					}
				}
			} catch (error: any) {
				toast.add({
					severity: 'error',
					detail: error.message ?? '',
					summary: error.detail ?? '',
					life: 5000,
				});
				showLoading.value = false;
				return false;
			}
		};

		/** 获取生产订单列表（齐料检查按订单视图筛选） */
		const getOrderData = async (ctx: any, value?: any) => {
			const { $api: apiBox } = ctx.globalProps;
			try {
				const res = await apiBox.getAll({
					repository: 'ProductionOrders',
					queryParams: {
						pageSize: searchParam.pager.pageSize,
						pageNo: searchParam.pager.pageNo,
						sort: '',
						searchWord: value ?? '',
						orderID: reloadParam.orderID ?? '',
						filter: 't.status >= 0',
					},
					service: 'mes',
				});
				searchParam.pager = res.pagination;
				orderData.value = res.list.map((it: any) => ({
					...it,
					status: MetaModel.getRefProp(it, 'status'),
					priority: MetaModel.getRefProp(it, 'priority'),
					constraintType: MetaModel.getRefProp(it, 'constraintType'),
					lastModifierID: MetaModel.getRefProp(it, 'lastModifierID'),
					ownerID: MetaModel.getRefProp(it, 'ownerID'),
					ownerDeptID: MetaModel.getRefProp(it, 'ownerDeptID'),
					bomID: `${it?.bom?.bomNo} ${it?.bom?.bomGroup}`,
					producedRate: (it.producedRate * 100).toPrecise(2),
					outputProgress: (it.outputProgress * 100).toPrecise(2),
					qualifiedRate: (it.qualifiedRate * 100).toPrecise(2),
					firstPassYield: (it.firstPassYield * 100).toPrecise(2),
					unqualifiedRate: (it.unqualifiedRate * 100).toPrecise(2),
					goodRate: (it.goodRate * 100).toPrecise(2),
					scrapRate: (it.scrapRate * 100).toPrecise(2),
				}));
				if (reloadParam.orderID && orderData.value.length > 0) {
					selectgOrder.value = orderData.value[0];
					temporarilySelectOrder.value = orderData.value[0];
				}
			} catch (error: any) {
				toast.add({
					severity: 'error',
					detail: error.message ?? '',
					summary: error.detail ?? '',
					life: 5000,
				});
				return false;
			}
		};
		const completeInspectionList = ref(<any>[]);

		const groupBy = ref(<any>[]); //分组
		const groupOption = ref(<any>[]); //分组选项（由接口 groups 填充）
		/** 可下拉选择：有选项且未锁定为订单 */
		const hasSelectableGroupOptions = computed(
			() => groupOption.value.length > 0 && !isGroupLockedToOrder.value
		);
		const getSingleGroupLabel = () => {
			const options = groupOption.value;
			if (!options?.length) {
				return isGroupLockedToOrder.value ? '订单' : '';
			}
			const selectedIds = Array.isArray(groupBy.value) ? groupBy.value : [groupBy.value];
			const selected = options.find((option: any) => selectedIds.includes(option.id));
			return selected?.label ?? options[0]?.label ?? (isGroupLockedToOrder.value ? '订单' : '');
		};

		const data = reactive({
			// 列表数据
			list: [] as any,
			column: [] as any,
		});

		//获取齐料数据
		const getCompleteInspection = async (ctx: any, calculate: boolean = true) => {
			showLoading.value = true;
			const { $ui: ui, $api: apiBox, $t: t } = ctx.globalProps;
			const { $api, $router } = ctx.globalProps;
			try {
				const res = await apiBox.doAction(
					{
						action: 'CompleteInspection',
						repository: 'ProductionTasks',
						service: 'mes',
					},
					{
						projectID: isOrderKittingView.value ? '' : reloadParam.projectID ?? '',
						orderID: isOrderKittingView.value ? reloadParam.orderID ?? '' : '',
						groupBy: getEffectiveGroupBy(),
						searchWord: orderNo.value !== '' ? orderNo.value : reloadParam.searchWord,
						planID: planID.value ?? '',
						calculate,
					}
				);
				applyGroupStateFromResponse(res?.groups ?? [], res?.groupBy);
				//是否有数据
				if (res.data && res.data.length > 0) {
					console.log('groupOption.value', groupOption.value);
					const key = Object.keys(res.data[0].data);
					data.column = key.map((item: any) => ({ field: item, header: item }));
					// 表头第一项有箭头
					data.column[0].expander = true;

					// 数据
					data.list = res.data[0].key !== '0' ? res.data : [];
				} else {
					data.list = data.column = [];
				}

				showLoading.value = false;
			} catch (error: any) {
				toast.add({
					severity: 'error',
					detail: error.message ?? '',
					summary: error.detail ?? '',
					life: 5000,
				});
				showLoading.value = false;
				return false;
			}
		};

		//获取备料计划
		const getPreparationPlan = async (ctx: any, calculate: boolean = true) => {
			showLoading.value = true;
			const { $ui: ui, $api: apiBox, $t: t } = ctx.globalProps;
			const { $api, $router } = ctx.globalProps;

			try {
				const res = await apiBox.doAction(
					{
						action: 'PreparationPlan',
						repository: 'ProjectSchedule',
						service: 'mes',
					},
					{
						projectID: reloadParam.projectID ?? '',
						groupBy: getEffectiveGroupBy(),
						searchWord: reloadParam.searchWord ?? '',
						calculate,
					}
				);
				applyGroupStateFromResponse(res?.groups ?? [], res?.groupBy);
				//是否有数据
				if (res.data && res.data.length > 0) {
					console.log('groupOption.value', groupOption.value);
					const key = Object.keys(res.data[0].data);
					data.column = key.map((item: any) => ({ field: item, header: item }));
					// 表头第一项有箭头
					data.column[0].expander = true;
					// data.column.unshift({field: })
					// 数据
					data.list = res.data[0].key !== '0' ? res.data : [];
				} else {
					data.list = data.column = [];
				}
				showLoading.value = false;
			} catch (error: any) {
				toast.add({
					severity: 'error',
					detail: error.message ?? '',
					summary: error.detail ?? '',
					life: 5000,
				});
				showLoading.value = false;
				return false;
			}
		};

		//重置按钮
		const resetReloadParam = () => {
			reloadParam.searchWord = '';
			reloadParam.projectID = '';
			reloadParam.orderID = '';
			selectgProject.value = null;
			temporarilySelectg.value = null;//临时的变相清除
			selectgOrder.value = null;
			temporarilySelectOrder.value = null;
		};

		return () =>
			h('div', { class: 'p-4' }, [
				!hasScheduleReadPermission.value
					? h('div', { class: 'noDataTable' }, [`-- ${$t('state.noRelevantPermission')} --`])
					: [
						showLoading.value ? h('div', { class: 'loadingBox' }, [ui.factory.loading({})]) : '',
						h('div', { class: 'opearBox' }, [
							h('div', { class: 'selfFulldivBox' }, [
								!kittingMode.value && showProjectFilter.value
									? ui.factory.formItem(
										{
											label: $t('ganttLabel.sProject'),
										},
										{
											default: () =>
												h('div', { class: 'selfdivBox project' }, [
													ui.factory.searchForRelative({
														role: `defectDesc-search-for-sProject`,
														name: 'defectDesc-search-for-sProject',
														id: 'defectDesc-search-for-sProject',
														modelValue: selectgProject.value,
														placeholder: $t('ganttLabel.sProject'),
														options: lineData.value,
														dataKey: 'projectID',
														optionLabel: 'projectName',
														toSearch: async (event: Event) => {
															const { $ui: ui, $api: apiBox, $t: t } = ctx.globalProps;
															const { model } = ctx;
															const { metaUiService } = ctx.logic;
															let data = [] as any;
															const metaUi = await metaUiService.get('Projects', 'mes');
															linecolumns.value = metaUi.getListedFields().sort((prev: any, curr: any) => {
																return Number(prev.fieldIdx) - Number(curr.fieldIdx);
															});
															projecDataKEY.value = metaUi.primaryKey;
															await getProjectData(ctx, '');
															ctx.uiBuilder.confirmDialog(
																(ctx.uiBuilder as any).buildSearchForRelativeContent(
																	linecolumns.value.map((item: any) =>
																		ui.factory.column({
																			header: item.displayLabel,
																			field: item.fieldName,
																			style: {
																				width: '200px',
																			},
																		})
																	),
																	{
																		dataKey: projecDataKEY.value,
																		onSearch: async (params: any) => {
																			const { searchParams, reload, pager } = params;
																			reloadParam.projectID = null;
																			await getProjectData(ctx, searchParams.searchWord);
																			return { list: lineData.value, pager: searchParam.pager };
																		},
																		onPage: ({ pageNo, pageSize }: any) => {
																			searchParam.pager.pageNo = pageNo;
																			searchParam.pager.pageSize = pageSize;
																		},
																		onSelect: (selection: any, row: any) => {
																			data = row;
																		},
																	}
																),
																ctx,
																{
																	name: 'projectSearchForRelative',
																	title: '选中一个项目',
																	width: '80%',
																	accept: async () => {

																		if (data.projectID) {
																			selectgProject.value = data.length === 0 ? null : data;
																			temporarilySelectg.value = selectgProject.value;
																			reloadParam.projectID = data.length === 0 ? null : data.projectID;
																			multiSelectList.value = []; //清空选中的负责人
																			//getProScheduleR(props.ctx);
																			//上传调用接口
																			return true;
																		}
																		else {
																			ctx.uiBuilder.toast(ctx, {
																				severity: 'error',
																				summary: $t('dialog.title.error'),
																				detail: $t('invalid.requiredSelectAny'), // 提示信息
																				group: 'br',
																				life: 3000,
																			});
																			return false;
																		}

																	},
																	//取消 reloadParam.projectID
																	reject: async () => {
																		selectgProject.value = temporarilySelectg.value ?? null;
																		reloadParam.projectID = temporarilySelectg?.value?.projectID ?? null;

																		//判断 缓存数据在不在lineDate里 
																		if (selectgProject.value) {
																			const res = lineData.value.findIndex((item: any) => {
																				return item.projectID == selectgProject.value.projectID;
																			})

																			if (res < 0) {
																				lineData.value.push(selectgProject.value);
																			}
																		}
																		return true;
																	},

																	onHide: () => {
																		//这个函数主要是把确定和取消分开执行。原来的accept会调用reject
																		//console.log("onHide");
																		return true;
																	},
																}
															);
														},

														onUpdate: (value: any) => {
															console.log("dddddd");
															selectgProject.value = value;
															temporarilySelectg.value = value;
															multiSelectList.value = []; //清空选中的负责人
															if (value?.projectID ?? '') {
																reloadParam.projectID = value.projectID;
															} else {
																reloadParam.projectID = '';
															}

															//getProScheduleR(props.ctx);
														},
													}),
												]),
										}
									)
									: null,
								!kittingMode.value && showOrderFilter.value
									? ui.factory.formItem(
										{
											label: $t('ganttLabel.sProductionOrder'),
										},
										{
											default: () =>
												h('div', { class: 'selfdivBox project' }, [
													ui.factory.searchForRelative({
														role: `defectDesc-search-for-sProductionOrder-kitting`,
														name: 'defectDesc-search-for-sProductionOrder-kitting',
														id: 'defectDesc-search-for-sProductionOrder-kitting',
														modelValue: selectgOrder.value,
														placeholder: $t('ganttLabel.sProductionOrder'),
														options: orderData.value,
														dataKey: 'orderID',
														optionLabel: formatProductionOrderSelectLabel,
														toSearch: async (event: Event) => {
															let data = [] as any;
															const metaUi = await metaUiService.get('ProductionOrders', 'mes');
															ordercolumns.value = metaUi.getListedFields().sort((prev: any, curr: any) => {
																return Number(prev.fieldIdx) - Number(curr.fieldIdx);
															});
															orderDataKEY.value = metaUi.primaryKey;
															await getOrderData(ctx, '');
															ctx.uiBuilder.confirmDialog(
																(ctx.uiBuilder as any).buildSearchForRelativeContent(
																	ordercolumns.value.map((item: any) =>
																		ui.factory.column({
																			header: item.displayLabel,
																			field: item.fieldName,
																			style: {
																				width: '200px',
																			},
																		})
																	),
																	{
																		dataKey: orderDataKEY.value,
																		onSearch: async (params: any) => {
																			const { searchParams } = params;
																			reloadParam.orderID = '';
																			await getOrderData(ctx, searchParams.searchWord);
																			return { list: orderData.value, pager: searchParam.pager };
																		},
																		onPage: ({ pageNo, pageSize }: any) => {
																			searchParam.pager.pageNo = pageNo;
																			searchParam.pager.pageSize = pageSize;
																		},
																		onSelect: (selection: any, row: any) => {
																			data = row;
																		},
																	}
																),
																ctx,
																{
																	name: 'orderSearchForRelative',
																	title: '选中一个生产订单',
																	width: '80%',
																	accept: async () => {
																		if (data.orderID) {
																			selectgOrder.value = data.length === 0 ? null : data;
																			temporarilySelectOrder.value = selectgOrder.value;
																			reloadParam.orderID = data.length === 0 ? null : data.orderID;
																			multiSelectList.value = [];
																			return true;
																		}
																		ctx.uiBuilder.toast(ctx, {
																			severity: 'error',
																			summary: $t('dialog.title.error'),
																			detail: $t('invalid.requiredSelectAny'),
																			group: 'br',
																			life: 3000,
																		});
																		return false;
																	},
																	reject: async () => {
																		selectgOrder.value = temporarilySelectOrder.value ?? null;
																		reloadParam.orderID = temporarilySelectOrder?.value?.orderID ?? null;
																		if (selectgOrder.value) {
																			const res = orderData.value.findIndex((item: any) => {
																				return item.orderID == selectgOrder.value.orderID;
																			});
																			if (res < 0) {
																				orderData.value.push(selectgOrder.value);
																			}
																		}
																		return true;
																	},
																	onHide: () => true,
																}
															);
														},
														onUpdate: (value: any) => {
															selectgOrder.value = value;
															temporarilySelectOrder.value = value;
															multiSelectList.value = [];
															if (value?.orderID ?? '') {
																reloadParam.orderID = value.orderID;
															} else {
																reloadParam.orderID = '';
															}
														},
													}),
												]),
										}
									)
									: null,
								!kittingMode.value
									? ui.factory.formItem(
										{
											label: $t('ganttLabel.groups'),
										},
										{
											default: () =>
												hasSelectableGroupOptions.value
													? ui.factory.multiSelect({
														labelStyle: { textAlign: 'left' },
														id: 'statusModel',
														showClear: true,
														class: 'w-full',
														modelValue: groupBy.value,
														options: groupOption.value,
														placeholder: $t('ganttLabel.chooseGroups'),
														onUpdate: (value: string) => {
															const optionIds = new Set(
																(groupOption.value ?? [])
																	.map((o: any) => o?.id)
																	.filter((id: any) => id != null && String(id).trim() !== '')
																	.map((id: any) => String(id))
															);
															// 不在选项内的值（空白 x 芯片）丢弃，空则保持不选中
															groupBy.value = sanitizeGroupBy(value).filter((id: string) =>
																optionIds.has(String(id))
															);
														},
														optionValue: 'id',
														optionLabel: 'label',
													})
													: ui.factory.textSpan(getSingleGroupLabel() || $t('ganttLabel.chooseGroups'), {
														class: 'gantt-group-single-label',
													}),
										}
									)
									: null,
								!kittingMode.value
									? ui.factory.formItem(
										{
											label: $t('action.searchFuzzy'),
										},
										{
											default: () =>
												ui.factory.input(reloadParam.searchWord, {
													onUpdate: (value: any) => {
														reloadParam.searchWord = value;
													},
												}),
										}
									)
									: null,
								h('div', { class: 'searchBottomBox' }, [
									!kittingMode.value && ui.factory.button({
										id: 'sButton',
										icon: 'pi pi-search',
										label: $t('view.search'),
										onAction: () => {
											if (pageType.value == 'CompleteMaterial') {
												getCompleteInspection(ctx, true);
											}
											if (pageType.value == 'PreparationPlan') {
												getPreparationPlan(ctx, false);
											}
										},
									}),
									kittingMode.value
										? [
											ui.factory.button({
												id: 'confirmKittingButton',
												icon: 'pi pi-check',
												label: $t('action.confirm'),
												class: 'p-button-success ml-2',
												onAction: confirmKitting,
											}),
											ui.factory.button({
												id: 'cancelKittingButton',
												icon: 'pi pi-times',
												label: $t('action.cancel'),
												class: 'p-button-warning ml-2',
												onAction: () => {
													kittingMode.value = false;
													multiSelectList.value = [];
													selectionKeys.value = null;
												},
											}),
										]
										: allowKitting.value ? ui.factory.button({
											id: 'kittingButton',
											icon: 'pi pi-shopping-cart',
											label: $t('stationlabel.requisition'),
											class: 'p-button-success ml-2',
											onAction: () => {
												kittingMode.value = true;
											},
										}) : null,
								]),
							]),
						]),
						h('div', { class: 'divBox flex flex-col overflow-hidden', style: { height: 'calc(100vh - 200px)' } }, [
							data.list.length > 0
								? ui.factory.treeTableDefault(
									{
										value: data.list,
										showGridlines: true,
										resizableColumns: true,
										columnResizeMode: 'expand',
										tableStyle: 'width: 100%',
										scrollable: true,
										scrollHeight: 'flex',
										selectionMode: kittingMode.value ? 'checkbox' : 'none',
										selectionKeys: selectionKeys.value,
										dataKey: 'key',
										'onUpdate:selectionKeys': (value: any) => (selectionKeys.value = value),
										'onNode-select': (value: any) => {
											if (!multiSelectList.value.some((item: any) => item.key === value.key)) {
												multiSelectList.value.push(value);
											}

											filterSelection(value);
											updateCheckStatus(data.list);
										},
										'onNode-unselect': (value: any) => {
											clearSelection(value);
											updateCheckStatus(data.list);
										},
									},
									{
										default: () => {
											const columns: any[] = [];

											data.column
												.filter((item: any) => shouldShowKittingTableColumn(item.field))
												.forEach((item: any, index: number) => {
													if (item.field === '缺料数量') {
														columns.push(
															ui.factory.column(
																{ header: item.header, field: item.field },
																{
																	body: (row: any) => {
																		const dataItem = row?.node?.data;
																		return h(
																			'span',
																			{
																				style: {
																					color: dataItem?.[item.field] === 0 ? 'green' : 'red',
																				},
																			},
																			dataItem?.[item.field]
																		);
																	},
																}
															)
														);

														// // todo 领料数量可编辑 暂时设计为缺多少领多少
														// if (kittingMode.value) {
														// 	columns.push(
														// 		ui.factory.column(
														// 			{ header: '领料数量', field: 'kittingQty', style: { width: '200px', minWidth: '200px' } },
														// 			{
														// 				body: (row: any) => {
														// 					const dataItem = row?.node?.data;
														// 					if (!dataItem?.materialID) {
														// 						return h('span', '-');
														// 					}

														// 					// return ui.factory.numberInput({
														// 					// 	modelValue: dataItem['kittingQty'],
														// 					// 	min: 0,
														// 					// 	max: dataItem?.['缺料数量'] || 99999,
														// 					// 	maxFractionDigits: 2,
														// 					// 	onUpdate: (value: number) => {
														// 					// 		dataItem['kittingQty'] = value;;
														// 					// 		if (multiSelectList.value.indexOf(toRaw(row?.node)) === -1) {
														// 					// 			multiSelectList.value.push(row?.node);
														// 					// 			selectionKeys.value[row?.node.key].checked = true;
														// 					// 		}
														// 					// 	},
														// 					// });
														// 					return ui.factory.textSpan(dataItem['kittingQty']);
														// 				},
														// 			}
														// 		)
														// 	);
														// }
													} else if (item.field === '材料图片') {
														columns.push(
															ui.factory.column(
																{ header: item.header, field: item.field, expander: item.expander ?? false, style: item.style },
																{
																	body: (row: any) => {
																		const dataItem = row?.node?.data;
																		return ui.factory.image((dataItem?.[item.field] as string) || '', {
																			width: '50',
																			height: '50',
																			preview: true,
																		});
																	},
																}
															)
														);
													} else if (item.field === '追踪方式') {
														columns.push(
															ui.factory.column(
																{ header: item.header, field: item.field, style: item.style },
																{
																	body: (row: any) => {
																		const dataItem = row?.node?.data;
																		return ui.factory.textSpan(MaterialTracingModeEnum.textOfValue(dataItem?.[item.field]), {});
																	},
																}
															)
														);
													} else {
														columns.push(ui.factory.column({ header: item.header, field: item.field, expander: item.expander ?? false, style: item.style }));
													}
												});
											return columns;
										},
									}
								)
								: h('div', { class: 'noDataTable' }, [`-- ${$t('state.noData')} --`]),
						]),
					],
			]);
	},
});
