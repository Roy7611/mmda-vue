import { Router, useRouter } from 'vue-router';
import { MetaUiService, Module, MetaUiField, ApiClient, UiContext, MetaModel, isRefNone, debounce, isNullOrUndefined, isObject, triggerEscKey } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiBuildContext, UI_BUILDER_KEY, UiGroupLogic, UiViewOne, UI_CREATE, type UiLogicFnResult, UiAction, UiSearchForm } from '@mmda/vui';
import { type MaterialUsage, defineMaterialUsage } from '@/models/MaterialUsage';
import { defineComponent, getCurrentInstance, h, reactive, ref, toRefs } from 'vue';
/**
 * 用料分析交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:05.0
 * @revision 2024-09-01 10:22:26.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 用料分析交互逻辑
 */
const tableDataProject = ref([])
const tableDataKeyProject = ref('id')
const searchParamProject = reactive({
    pager: {
        pageSize: 10,
        pageNo: 1
    },
    searchWord: '',
    searchParams: {}
});
const tableDataTask = ref([])
const tableDataKeyTask = ref('id')
const searchParamTask = reactive({
    pager: {
        pageSize: 10,
        pageNo: 1
    },
    searchWord: '',
    searchParams: {}
});
export class MaterialUsageLogic extends UiLogic<MaterialUsage> {
    constructor(init: UiLogicInit) {
        super(defineMaterialUsage, init);
    }
    async getAll(param: any, ctx?: any) {
        const { $api: apiBox, $toast: toast } = !isNullOrUndefined(ctx.globalProps) ? ctx.globalProps : ctx.app.config.globalProperties
        const res = await apiBox.getAll({
            repository: 'MaterialUsage',
            service: 'mes',
            action: 'getMaterialWaste',
            queryParams: {
                ...this.searchParams.queryParams,
                projectID: this.searchParams.projectID ?? '',
                workNo: this.searchParams.taskNo ?? '',
                pageNo: param.pager.pageNo,
                pageSize: param.pager.pageSize
            }
        })
        return res
    }
    /**
      * 项目
      * @param context 
      * @param value 
     */
    async getAllProject(context: UiContext, value?: any) {
        await context.globalProps.$api.getAll({
            repository: 'Projects',
            service: 'mes',
            queryParams: {
                pageSize: searchParamProject.pager.pageSize,
                pageNo: searchParamProject.pager.pageNo,
                sort: '',
                searchWord: value
            },
        }).then((res: any) => {
            searchParamProject.pager = res.pagination
            tableDataProject.value = res.list.map((it: any) => {
                return {
                    ...it,
                    status: it.customProperties.$status,
                    ownerID: it.customProperties.$ownerID,
                    ownerDeptID: it.customProperties.$ownerDeptID,
                    lastModifierID: it.customProperties.$lastModifierID,
                    importance: it.customProperties.$importance,
                    constraintType: it.customProperties.$constraintType
                }
            })
        })
    }
    /**
     * 生产任务
     * @param context 
     * @param value 
    */
    async getAllTask(context: UiContext, value?: any) {
        await context.globalProps.$api.getAll({
            repository: 'ProductionTasks',
            service: 'mes',
            queryParams: {
                pageSize: searchParamTask.pager.pageSize,
                pageNo: searchParamTask.pager.pageNo,
                sort: '',
                searchWord: value
            },
        }).then((res: any) => {
            searchParamTask.pager = res.pagination
            tableDataTask.value = res.list.map((it: any) => {
                return {
                    ...it,
                }
            })
        })
    }
    searchParam: Record<string, any> = {};

    beforeSearch(): UiSearchForm {
        const { searchParam, searchFields, customSearchFields } = super.beforeSearch();
        if (customSearchFields.length == 0) {
            customSearchFields.push({
                searchLabel: 'ganttLabel.sProject',
                searchParam: 'projectID',
                valueFn: (v: any) => !isRefNone(v) ? v.projectID : '',
                renderer: (ctx: UiBuildContext<any> & any, csf) => {
                    if (!tableDataProject.value.length && isObject(csf.searchVal.value)) {
                        tableDataProject.value.push(csf.searchVal.value)
                    }
                    return ctx.uiBuilder.factory.searchForRelative({
                        modelValue: csf.searchVal.value,
                        dataKey: 'projectID',
                        optionLabel: (v: any) => v.projectName,
                        class: 'w-full',
                        // options: tableDataProject.value,
                        options: tableDataProject.value,
                        toSearch: async (event: Event) => {
                            let data = [] as any;
                            // 获取元数据字段
                            const { metaui } = await ctx.logic!.loadMetadata('Projects', 'mes', true);
                            tableDataKeyProject.value = metaui.primaryKey;
                            ctx.searchParam.pager = searchParamProject.pager = {
                                pageNo: 1,
                                pageSize: 10
                            }
                            // 列表column
                            const columns = await ctx.uiBuilder.buildColumns(metaui, ctx, {
                                isSearch: true,
                                cacheKey: `payerID/SearchRelative/${metaui.primaryKey}`,
                            });
                            ctx.uiBuilder.confirmDialog(
                                ctx.uiBuilder.buildSearchForRelativeContent(columns, {
                                    dataKey: tableDataKeyProject.value,
                                    onSearch: async (params: any) => {
                                        const { searchParams, reload, pager } = params;
                                        await this.getAllProject(ctx, searchParams.searchWord);
                                        return { list: tableDataProject.value, pager: searchParamProject.pager };
                                    },
                                    onPage: ({ pageNo, pageSize }: any) => {
                                        searchParamProject.pager.pageNo = pageNo;
                                        searchParamProject.pager.pageSize = pageSize;
                                        ctx.searchParam.pager = searchParamProject.pager
                                    },
                                    onSelect: (selection: any, row: any) => {
                                        data = row;
                                    },
                                    onRowDblclick: (row: any, index: number) => {
                                        csf.searchVal.value = csf.searchWord.value = row
                                        ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, JSON.parse(JSON.stringify(row)));
                                        triggerEscKey(); // 弹窗关闭(触发esc建)
                                    },
                                }),
                                ctx,
                                {
                                    title: ctx.t('ganttLabel.sProject'),
                                    style: { width: '80vw', maxHeight: '95%' },
                                    accept: async () => {
                                        csf.searchVal.value = csf.searchWord = data;
                                        ctx.model.projectID = data.projectID ?? ctx.model.projectID;
                                        ctx.model.projectNo = data.projectNo ?? ctx.model.projectNo;
                                        this.searchParam.projectID = ctx.model.projectID;
                                        ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, JSON.parse(JSON.stringify(data)));
                                        return true;
                                    },
                                }
                            );
                        },
                        onUpdate: (value: any) => {
                            csf.searchVal.value = value || null;
                            ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, value);
                        },
                        onInput: (value: string) => {
                            debounce(async () => {
                                await this.getAllProject(ctx, value);
                            }, 500)();
                        },
                    })
                }
            }, {
                searchLabel: 'stationlabel.productionTask',
                searchParam: 'taskNo',
                valueFn: (v: any) => !isRefNone(v) ? v.taskNo : '',
                renderer: (ctx: UiBuildContext<any> & any, csf) => {
                    if (!tableDataTask.value.length && isObject(csf.searchVal.value)) {
                        tableDataTask.value.push(csf.searchVal.value)
                    }
                    return ctx.uiBuilder.factory.searchForRelative({
                        modelValue: csf.searchVal.value,
                        dataKey: 'taskID',
                        optionLabel: (v: any) => v.taskNo,
                        class: 'w-full',
                        // options: tableDataProject.value,
                        options: tableDataTask.value,
                        toSearch: async (event: Event) => {
                            let data = [] as any;
                            // 获取元数据字段
                            const { metaui } = await ctx.logic!.loadMetadata('ProductionTasks', 'mes', true);
                            tableDataKeyTask.value = metaui.primaryKey;
                            ctx.searchParam.pager = searchParamTask.pager = {
                                pageNo: 1,
                                pageSize: 10
                            }
                            // 列表column
                            const columns = await ctx.uiBuilder.buildColumns(metaui, ctx, {
                                isSearch: true,
                                cacheKey: `taskID/SearchRelative/${metaui.primaryKey}`,
                            });
                            ctx.uiBuilder.confirmDialog(
                                ctx.uiBuilder.buildSearchForRelativeContent(columns, {
                                    dataKey: tableDataKeyTask.value,
                                    onSearch: async (params: any) => {
                                        const { searchParams, reload, pager } = params;
                                        await this.getAllTask(ctx, searchParams.searchWord);
                                        return { list: tableDataTask.value, pager: searchParamTask.pager };
                                    },
                                    onPage: ({ pageNo, pageSize }: any) => {
                                        searchParamTask.pager.pageNo = pageNo;
                                        searchParamTask.pager.pageSize = pageSize;
                                        ctx.searchParam.pager = searchParamTask.pager
                                    },
                                    onSelect: (selection: any, row: any) => {
                                        data = row;
                                    },
                                    onRowDblclick: (row: any, index: number) => {
                                        csf.searchVal.value = csf.searchWord.value = row
                                        ctx.app.localDb.put(`search/${ctx.logic.repository}/taskNo`, JSON.parse(JSON.stringify(row)));
                                        triggerEscKey(); // 弹窗关闭(触发esc建)
                                    },
                                }),
                                ctx,
                                {
                                    title: ctx.t('stationlabel.productionTask'),
                                    style: { width: '80vw', maxHeight: '95%' },
                                    accept: async () => {
                                        csf.searchVal.value = csf.searchWord = data;
                                        ctx.model.taskID = data.taskID ?? ctx.model.taskID;
                                        ctx.model.taskNo = data.taskNo ?? ctx.model.taskNo;
                                        this.searchParam.taskNo = ctx.model.taskNo;
                                        ctx.app.localDb.put(`search/${ctx.logic.repository}/taskNo`, JSON.parse(JSON.stringify(data)));
                                        return true;
                                    },
                                }
                            );
                        },
                        onUpdate: (value: any) => {
                            csf.searchVal.value = value || null;
                            ctx.app.localDb.put(`search/${ctx.logic.repository}/taskNo`, value);
                        },
                        onInput: (value: string) => {
                            debounce(async () => {
                                await this.getAllTask(ctx, value);
                            }, 500)();
                        },
                    })
                }
            })
        }
        return { searchParam, searchFields, customSearchFields }
    }
}
/**
 * 构造用料分析交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const MaterialUsageLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
    new MaterialUsageLogic({
        metaUiService: metaUiService,
        repository: 'StationPortals',
        router,
        module: module || metaUiService.findModule('StationPortal'),
    });