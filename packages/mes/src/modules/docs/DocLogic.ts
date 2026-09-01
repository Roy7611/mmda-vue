/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { ComponentInternalInstance, getCurrentInstance, h, reactive, ref, toRaw } from 'vue';
import { Router } from 'vue-router';
import {
	type MetaUiService,
	type Module,
	type MetaUiField,
	type UiContext,
	type EntityAction,
	type ApiClient,
	type EntitySearchParam,
	toQueryParams,
	defineEntityArray,
	PagedList,
	MetaModel,
	defaultPager,
	isNullOrUndefined,
} from '@mmda/core';
import { type UiViewContext, type UiBuildContext, type UiLogicInit, UiLogic, UiGroupLogic, getFileInfo, type UiLogicFnResult, UiSearchForm } from '@mmda/vui';
import { type Doc, defineDoc } from '@/models/Doc';
import { type DocAudit, defineDocAudit } from '@/models/DocAudit';
import { type DocShare, defineDocShare } from '@/models/DocShare';
import { User, defineUser } from '@mmda/base/src/models/User';
//import { DocPicture, defineDocPicture } from '@/models/DocPicture';
import { EntityState } from '@mmda/core/src/models/entity';
import { encodeUriAndFix } from '@mmda/core';
import { UserStatus, UserStatusEnum } from '@mmda/base/src/enums/UserStatus';
import { DocShareStatus } from '@/enums/DocShareStatus';
/**
 * 分享,机密文件才能分享
 * @param context
 * @param model
 * @param action
 * @returns
 */
const beforeshare = async (context: UiContext<Doc>, model: Doc, action: EntityAction) => {
	// 当前登录用户，用于排除自己
	const currentUserId = context.app.context.user.userId;
	return context
		.select<User>({
			service: 'base',
			repository: 'Users',
			ctor: defineUser,
			selectionMode: 'multiple',
			// 已分享且未回收的用户置灰，不可重复选择
			selectableFn: (user: User) =>
				!(model.shares ?? []).some(
					s => s.status !== DocShareStatus.RECLAIMED && s.shareeID === user.userID,
				),
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					...(currentUserId ? { userID: `NOT IN ${currentUserId}` } : {}),
					status: UserStatus.ACTIVATED, // 仅可选已激活用户
				},
			},
		})
		.then(selection => {
			if (Array.isArray(selection)) {
				const submitBody = {
					payload: {
						shareeIDs: selection.map(it => it.userID),
						validTo: new Date().toFormat('yyyy-MM-dd HH:mm:ss'),
						replyRequired: false,
						remark: '',
					},
				};
				action.param = submitBody;
				return true;
			}
		});
};
/**
 * 转呈
 * @param context
 * @param model
 * @param action
 * @returns
 */
const beforetransfer = (context: UiContext<Doc>, model: Doc, action: EntityAction) => {
	const { $toast, $t } = context.globalProps;
	return context
		.select<User>({
			service: 'base',
			repository: 'Users',
			ctor: defineUser,
			selectionMode: 'single',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					status: UserStatus.ACTIVATED,
				},
			},
		})
		.then((selection: any) => {
			if (selection) {
				const submitBody = {
					ownerID: selection.userID,
					ownerDeptID: selection.deptID,
				};
				action.param = submitBody;
				$toast.add({ severity: 'success', summary: $t('dialog.title.prompt'), detail: $t('success.operationSuccessful'), group: 'br', life: 3000 });
				return true;
			}
		});
};
/**
 * 取消分享
 * @param context
 * @param model
 * @param action
 * @returns
 */
const beforereclaim = async (context: UiContext<Doc>, model: Doc, action: EntityAction) => {
	const { $toast, $api, $t } = context.globalProps;
	// 列表页可能未加载 shares，需补拉文档详情
	let shares = model.shares;
	if (!shares?.length) {
		const data = await $api.getOne(model.docID, { repository: 'Docs', service: 'mes' });
		shares = defineDoc(data as object).shares ?? [];
	}
	// 仅保留未回收的分享对象
	const shareeIDs = shares
		.filter(share => share.status !== DocShareStatus.RECLAIMED)
		.map(share => share.shareeID)
		.filter(Boolean);
	if (!shareeIDs.length) {
		$toast.add({
			severity: 'info',
			summary: $t('dialog.title.prompt'),
			detail: $t('doc.noShareRecords'),
			group: 'br',
			life: 3000,
		});
		return false;
	}
	return context
		.select<User>({
			service: 'base',
			repository: 'Users',
			ctor: defineUser,
			selectionMode: 'multiple',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					status: UserStatus.ACTIVATED,
					// 只展示已分享的用户
					userID: `IN ${shareeIDs.join(',')}`,
				},
			},
		})
		.then(selection => {
			if (Array.isArray(selection)) {
				const submitBody = {
					payload: {
						shareeIDs: selection.map(it => it.userID),
					},
				};
				action.param = submitBody;
				return true;
			}
		});
};
/**
 * 文档交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:03.0
 * @revision 2024-09-01 23:04:15.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 文档交互逻辑
 */
export class DocLogic extends UiLogic<Doc> {
	static getAll() {
		throw new Error('Method not implemented.');
	}
	constructor(init: UiLogicInit) {
		super(defineDoc, init);
		this.addRelativeLogic<DocAudit>('audits', master => new DocAuditLogic(this, master));
		this.addRelativeLogic<DocShare>('shares', master => new DocShareLogic(this, master));
		this.beforeAction = (context: UiContext<Doc>, model: Doc, action: EntityAction) => {
			try {
				if (action.name == 'share') return beforeshare(context, model, action);
				if (action.name == 'transfer') return beforetransfer(context, model, action);
				if (action.name == 'reclaim') return beforereclaim(context, model, action);
				else return Promise.resolve(true);
			} catch (error: any) {
				return Promise.resolve(false);
			}
		};
	}

	/**
	 * 文档详情页 modelLoader 包装。
	 *
	 * 问题：无权限或分享链接失效时 GET /Docs/:id 返回 406（code: doc.share.disabled），
	 *       框架 load 仅写入 ctx.error，页面空白且无 toast。
	 * 处理：catch 后 toast 展示接口 detail（映射为 error.message），再 throw 保持原有加载失败流程。
	 */
	viewModelLoader(ctx: UiContext<Doc>, id: string) {
		return async () => {
			try {
				return await this.load(id);
			} catch (error: any) {
				ctx.uiBuilder.toast(ctx, {
					severity: 'error',
					summary: ctx.t('dialog.title.error'),
					detail: error?.message,
					group: 'br',
					life: 3000,
				});
				throw error;
			}
		};
	}

	async getAll(param: any) {
		const res = await super.getAll({
			...param,
			queryParams: {
				search: this.searchParams.search ?? '',
				reclaimed: this.searchParams.queryParams?.reclaimed || false,
				ancestorCategoryID: this.searchParam.queryParams?.ancestorCategoryID || ''
			},
		});
		return res;
	}

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(
				this.field('categoryID').searchable(true),
				this.field('projectID').searchable(true),
				this.field('confidentialityLevel').searchable(true),
				// 文件
				this.field('docFile').setCustomCellRenderer((fld, ctx, props) => {
					const fldVal = ctx.getFieldValue(fld);
					const { fileName, fileExt } = getFileInfo(fldVal)
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
						h(
							'a',
							{
								style: {
									color: '#409eff',
								},
								href: 'javascript:;',
								onClick: async () => {
									const { $api: apiBox, $router: router } = ctx.globalProps;
									try {
										await apiBox.getOne(ctx.model.docID, {
											repository: 'Docs',
											service: 'mes',
										})
										if (fileExt == 'xlsx' || fileExt == 'docx' || fileExt == 'pptx') {
											const routeUrl = router.resolve({
												path: `/${apiBox.config.service.toUpperCase()}/FileView`,
												query: {
													fileUrl: encodeUriAndFix(fldVal)
												}
											})
											window.open(routeUrl.href, '_blank');
										} else if (fileExt == 'pdf') {
											window.open(fldVal, '_blank')
										} else if (fileExt == 'bmp' ||
											fileExt == 'jpg' ||
											fileExt == 'png' ||
											fileExt == 'gif') {
											window.open(`${encodeUriAndFix(fldVal)}?a=${+new Date()}`, '_blank')
										}
									} catch (error: any) {
										ctx.uiBuilder.toast(ctx, {
											severity: 'error',
											summary: ctx.t('dialog.title.error'),
											detail: error.message,
											group: 'br',
											life: 3000
										})

									}
								},
							},
							fileName !== 'null' ? fileName : ''
						),
					]);
				})
			);
		}
		return { fields, groups, customActions };
	}
	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				// this.field('docFile').onChange<string>((ctx, model, newVal, oldVal) => {}),
				this.field('projectID').onChange<string>((ctx, model, newVal, oldVal) => {
					if (!newVal) {
						model.contract = null;
					}
				})
			);
			/**
			fields.push(
				this.field('fldName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange<string>((ctx,model,newVal,oldVal)=>{ })
					.onValidate<string>((value,model)=>{ })
			);
			 */
		}
		if (groups.length == 0) {
			//groups.push(this.group<DocPicture>('pictures').defaultAdder(this.AddPicture));
			/**
			fields.push(
				this.group<I>('grpName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange((ctx,model,items)=>{ })
			);
			 */
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		// if (fields.length == 0) {
		// 	fields.push(
		// 		this.field('docFile').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
		// 			const fldVal = ctx.getFieldValue(fld);
		// 			const fileInfo = getFileInfo(fldVal);
		// 			const showBotton = ref('none');
		// 			if (ctx.model.docFile) {
		// 				showBotton.value = 'block';
		// 			} else {
		// 				showBotton.value = 'none';
		// 			}
		// 			return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
		// 				h(
		// 					'a',
		// 					// { href:encodeURIComponent(ctx.model.docFile)},
		// 					fileInfo.fileName
		// 				),
		// 				h(
		// 					'button',
		// 					{
		// 						style: { display: showBotton.value, width: '50px', height: '30px', margin: '10px', cursor: 'pointer', background: '#5578b6', color: '#ffffff', borderRadius: '3px', border: 'none' },
		// 						onClick: () => {
		// 							const id = ctx.model.docID;
		// 							const url = ctx.model.docFile ? ctx.model.docFile : '';
		// 							if (url) {
		// 								// const link=encodeUriAndFix(url)
		// 								// window.open(link, '_blank');
		// 								const point = url.lastIndexOf('.');
		// 								const suffix = url.substr(point);
		// 								if (suffix == '.xlsx' || suffix == '.XLSX') {
		// 									const routeUrl = this.router.resolve({
		// 										path: '/MES/ExcelView',
		// 										query: { id: id },
		// 									});
		// 									window.open(routeUrl.href, '_blank');
		// 								} else if (suffix == '.docx' || suffix == '.DOCX') {
		// 									const routeUrl = this.router.resolve({
		// 										path: '/MES/DocView',
		// 										query: { id: id },
		// 									});
		// 									window.open(routeUrl.href, '_blank');
		// 								} else if (suffix == '.pdf' || suffix == '.PDF') {
		// 									const routeUrl = this.router.resolve({
		// 										path: '/MES/PDFView',
		// 										query: { id: id },
		// 									});
		// 									window.open(routeUrl.href, '_blank');
		// 									// const link = encodeUriAndFix(url);
		// 									// window.open(link, '_blank');
		// 								} else if (suffix == '.bmp' || suffix == '.jpg' || suffix == '.png' || suffix == '.txt' || suffix == '.gif' || suffix == '.dwg') {
		// 									const urlNo = ref(+new Date());
		// 									const link = encodeUriAndFix(url);
		// 									const linkno = link + '?v=' + urlNo.value
		// 									window.open(linkno, '_blank');
		// 								} else {
		// 									const urlNo = ref(+new Date());
		// 									const link = encodeUriAndFix(url);
		// 									const linkno = link + '?v=' + urlNo.value
		// 									window.open(linkno, '_blank');
		// 								}

		// 							} else {

		// 							}
		// 						},
		// 					},
		// 					'预览'
		// 				),
		// 			]);
		// 		})
		// 	);
		// }
		return { fields, groups, customActions };
	}
	searchParam: Record<string, any> = {};
	beforeSearch() {
		const docType = (t: (key: string) => string) => [
			{
				label: t('doc.public'),
				value: 'searchPublicDoc',
			},
			{
				label: t('doc.mine'),
				value: 'searchMyDoc',
			},
			{
				label: t('doc.shared'),
				value: 'searchSharedDoc',
			},
			{
				label: t('doc.recycleBin'),
				value: 'searchReclaimedDoc',
			},
			{
				label: t('doc.recent'),
				value: 'searchDocAudit',
			},
		];
		const { searchParam, searchFields, customSearchFields } = super.beforeSearch();

		if (customSearchFields.length == 0) {
			customSearchFields.push({
				searchLabel: 'doc.type',
				searchParam: 'search',
				renderer: (ctx: UiBuildContext<any> & any, csf) => {
					if (!searchParam.queryParams) {
						searchParam.queryParams = {
							reclaimed: 'false',
						};
					}
					ctx.addQueryParam('reclaimed', 'false');
					if (csf.searchVal.value !== 'searchReclaimedDoc') {
						ctx.addQueryParam('reclaimed', 'false');
					} else {
						ctx.addQueryParam('reclaimed', 'true');
					}
					const { factory } = ctx.uiBuilder;
					return factory.tagSelector(csf.searchVal.value, docType(ctx.t), {
						onChange: async (val: any) => {
							csf.searchVal.value = val;
							// ctx.app.localDb.put(
							// 	`search/${ctx.logic.repository}/search`, val
							// )
							ctx.app.localDb.put(`search/${ctx.logic.repository}/search`, JSON.parse(JSON.stringify(val)));
							//如果不是回收站则reclaimed==false
							if (csf.searchVal.value !== 'searchReclaimedDoc') {
								ctx.addQueryParam('search', val);
								ctx.addQueryParam('reclaimed', 'false');
							} else {
								ctx.addQueryParam('search', val);
								ctx.addQueryParam('reclaimed', 'true');
							}
						},
					});
				},
			});
		}

		this.searchParam = searchParam;
		return { searchFields, customSearchFields };
	}
}

/**
 * 构造文档交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const DocLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new DocLogic({
		metaUiService: metaUiService,
		repository: 'Docs',
		router,
		module: module || metaUiService.findModule('Doc'),
	});
/**
 * 访问记录交互逻辑
 */
export class DocAuditLogic extends UiGroupLogic<DocAudit, Doc> {
	constructor(parent: DocLogic, master: Doc) {
		super(defineDocAudit, parent, master, 'audits');
	}
}
/**
 * 分享交互逻辑
 */
export class DocShareLogic extends UiGroupLogic<DocShare, Doc> {
	constructor(parent: DocLogic, master: Doc) {
		super(defineDocShare, parent, master, 'shares');
	}
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		const urlNo = ref(+new Date());
		if (fields.length == 0) {
			// fields.push();
		}
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
