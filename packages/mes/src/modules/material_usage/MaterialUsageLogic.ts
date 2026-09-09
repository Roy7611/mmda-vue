import { useRouter } from 'vue-router';
import { MetaUiService, Module, MetaUiField, ApiClient, UiContext, MetaModel, isRefNone, debounce, isNullOrUndefined, isObject, triggerEscKey } from '@mmda/core';
import { type EntityLogicInit, EntityLogic, UI_BUILDER_KEY, SubEntityLogic, UiViewOne, UI_CREATE, type UiLogicFnResult, UiAction, UiSearchForm } from '@mmda/vui';
import { type MaterialUsage, defineMaterialUsage } from '@/models/MaterialUsage';
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
const tableDataProject = { value: [] }
const tableDataKeyProject = { value: 'id' }
const searchParamProject = {
    pager: {
        pageSize: 10,
        pageNo: 1
    },
    searchWord: '',
    searchParams: {}
});
const tableDataTask = { value: [] }
const tableDataKeyTask = { value: 'id' }
const searchParamTask = {
    pager: {
        pageSize: 10,
        pageNo: 1
    },
    searchWord: '',
    searchParams: {}
});
export class MaterialUsageLogic extends EntityLogic<MaterialUsage> {
    constructor(init: EntityLogicInit) {
        super(defineMaterialUsage, init);
    }
    async getAll(param: any, ctx?: any) {
        !isNullOrUndefined(ctx.globalProps) ? ctx.globalProps : ctx.app.config.globalProperties
        const res = await this.apiClient.getAll({
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
        await this.getAllOf<Record<string, unknown>>('Projects', {
            queryParams: {
                pageSize: searchParamProject.pager.pageSize,
                pageNo: searchParamProject.pager.pageNo,
                sort: '',
                searchWord: value
            },
        }, { service: 'mes' }).then((res: any) => {
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
        await this.getAllOf<Record<string, unknown>>('ProductionTasks', {
            queryParams: {
                pageSize: searchParamTask.pager.pageSize,
                pageNo: searchParamTask.pager.pageNo,
                sort: '',
                searchWord: value
            },
        }, { service: 'mes' }).then((res: any) => {
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
                renderer: (ctx: UiContext & any, csf) => {
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
                        toSearch: async () => {
                            const picked = await ctx.select({
                                repository: 'Projects',
                                service: 'mes',
                                selectionMode: 'single',
                            })
                            if (!Array.isArray(picked) || !picked.length) return false
                            const data = picked[0]
                            csf.searchVal.value = csf.searchWord = data
                            ctx.model.projectID = data.projectID ?? ctx.model.projectID
                            ctx.model.projectNo = data.projectNo ?? ctx.model.projectNo
                            this.searchParam.projectID = ctx.model.projectID
                            ctx.app.localDb.put(`search/${ctx.logic.repository}/projectID`, JSON.parse(JSON.stringify(data)))
                            return true
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
                renderer: (ctx: UiContext & any, csf) => {
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
                        toSearch: async () => {
                            const picked = await ctx.select({
                                repository: 'ProductionTasks',
                                service: 'mes',
                                selectionMode: 'single',
                            })
                            if (!Array.isArray(picked) || !picked.length) return false
                            const data = picked[0]
                            csf.searchVal.value = csf.searchWord = data
                            ctx.model.taskID = data.taskID ?? ctx.model.taskID
                            ctx.model.taskNo = data.taskNo ?? ctx.model.taskNo
                            this.searchParam.taskNo = ctx.model.taskNo
                            ctx.app.localDb.put(`search/${ctx.logic.repository}/taskNo`, JSON.parse(JSON.stringify(data)))
                            return true
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
export const MaterialUsageLogicCtor = (metaUiService: MetaUiService, router: unknown, module?: Module) =>
    new MaterialUsageLogic({
        metaUiService: metaUiService,
        repository: 'StationPortals',
        
        module: module || metaUiService.findModule('StationPortal'),
    });