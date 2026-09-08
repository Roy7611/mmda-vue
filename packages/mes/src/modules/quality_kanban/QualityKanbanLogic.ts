/**
 * Copyright (c) 2006, 2020, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */

import { inFilter, isNullOrUndefined, isRefNone, isObject, debounce, triggerEscKey } from '@mmda/core';
import type { UiContext, MetaUiService, Module } from '@mmda/core';
import type { UiLogicInit } from '@mmda/vui';
import { UiLogic } from '@mmda/vui';
import { primeVueFactory } from '@/compat/primevue_legacy'
import { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
import { type CustomPage, defineCustomPage } from '@/models/CustomPage';
import type { QualityKPI, QualitySiteKPI, QualityTrend } from '@/models/QualityKPI';

// 生产站点下拉数据缓存（searchForRelative 弹窗内表格数据，模块级共享）
const tableDataSite = { value: [] }
const tableDataKeySite = { value: 'id' }
const searchParamSite = {
  pager: { pageSize: 10, pageNo: 1 },
  searchWord: '',
  searchParams: {},
})
// 制品类别下拉数据缓存（searchForRelative 弹窗内表格数据，模块级共享）
const tableDataCategory = { value: [] }
const tableDataKeyCategory = { value: 'id' }
const searchParamCategory = {
  pager: { pageSize: 10, pageNo: 1 },
  searchWord: '',
  searchParams: {},
})

/**
 * 质量看板交互逻辑
 * @author mmda codebot
 * @since 2023-11-28 00:20:38.0
 * @revision 2023-11-28 01:38:08.0
 */
//#region ~GENERATED PARTS BEGIN
export class QualityKanbanLogic extends UiLogic<CustomPage> {
    //skin = 'material'; //传入dark为黑暗模式
    scheduleroleaction: any = {}; //权限
    roleaction: any[] = [];
    constructor(init: UiLogicInit) {
        super(defineCustomPage, init);
    }
    private bindApp(context: UiContext) {
        this.roleaction = context.app?.state.modules ?? [];
    }

    /** 汇总 KPI（后端 /QualityKanban 返回 List 仅 1 行，取第 0 项） */
    kpiData = { value: null }
    /** 站点质量明细（后端 /QualityKanban/siteQuality 返回） */
    sitesData = { value: [] }
    /** 质量趋势（后端 /QualityKanban/getAnalyzeQualityFluctuation 返回） */
    trendData = { value: [] }
    /** 数据加载完成标记，控制三态切换 */
    loaded = { value: false }
    /** 数据加载错误信息，非空表示加载失败 */
    loadError = { value: null }

    /** 当前筛选参数集合（beforeSearch 各字段写入，home 读取） */
    searchParam: Record<string, any> = {}

    /**
     * 解析快捷时间范围为起止日期字符串
     * 支持 12 种类型，未知范围回退本周
     */
    private resolveDateRange(range: string): { startTime: string; endTime: string } {
        const now = new Date()
        const y = now.getFullYear()
        const m = now.getMonth()
        const d = now.getDate()
        const day = now.getDay()

        let begin: Date
        let end: Date

        switch (range) {
            case 'TODAY':
                begin = new Date(y, m, d)
                end = new Date(y, m, d)
                break

            case 'YESTERDAY': {
                const yest = new Date(now)
                yest.setDate(yest.getDate() - 1)
                begin = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate())
                end = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate())
                break
            }

            case 'THIS_WEEK': {
                const monOff = day === 0 ? -6 : 1 - day
                const mon = new Date(y, m, d + monOff)
                begin = new Date(mon)
                end = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6)
                break
            }

            case 'LAST_WEEK': {
                const monOff = day === 0 ? -6 : 1 - day
                const lastMon = new Date(y, m, d + monOff - 7)
                begin = new Date(lastMon)
                end = new Date(lastMon.getFullYear(), lastMon.getMonth(), lastMon.getDate() + 6)
                break
            }

            case 'LAST_7_DAYS': {
                const sevenAgo = new Date(now)
                sevenAgo.setDate(sevenAgo.getDate() - 6)
                begin = new Date(sevenAgo.getFullYear(), sevenAgo.getMonth(), sevenAgo.getDate())
                end = new Date(y, m, d)
                break
            }

            case 'THIS_MONTH':
                begin = new Date(y, m, 1)
                end = new Date(y, m + 1, 0)
                break

            case 'LAST_MONTH':
                begin = new Date(y, m - 1, 1)
                end = new Date(y, m, 0)
                break

            case 'LAST_30_DAYS': {
                const thirtyAgo = new Date(now)
                thirtyAgo.setDate(thirtyAgo.getDate() - 29)
                begin = new Date(thirtyAgo.getFullYear(), thirtyAgo.getMonth(), thirtyAgo.getDate())
                end = new Date(y, m, d)
                break
            }

            case 'THIS_QUARTER': {
                const qStart = Math.floor(m / 3) * 3
                begin = new Date(y, qStart, 1)
                end = new Date(y, qStart + 3, 0)
                break
            }

            case 'LAST_QUARTER': {
                const lqStart = Math.floor(m / 3) * 3 - 3
                begin = new Date(y, lqStart, 1)
                end = new Date(y, lqStart + 3, 0)
                break
            }

            case 'THIS_YEAR':
                begin = new Date(y, 0, 1)
                end = new Date(y, 11, 31)
                break

            case 'LAST_YEAR':
                begin = new Date(y - 1, 0, 1)
                end = new Date(y - 1, 11, 31)
                break

            default: {
                // 未知范围回退本周
                const monOff = day === 0 ? -6 : 1 - day
                const mon = new Date(y, m, d + monOff)
                begin = new Date(mon)
                end = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6)
                break
            }
        }

        return {
            startTime: begin.toFormat('yyyy-MM-dd 00:00:00'),
            endTime: end.toFormat('yyyy-MM-dd 23:59:59'),
        }
    }

    /**
     * 质量看板数据加载：并行调用汇总 / 站点 / 趋势三个接口
     * 时间范围优先级：快捷范围（date）> 生产时间段（startTime 数组）> 回退本周
     */
    async home(ctx?: any) {
        const apiClient = this.apiClient

        // 解析时间范围：快捷范围优先，其次生产时间段 range 数组，最后回退本周
        let startTime: string
        let endTime: string
        const dateRange = this.searchParams.date as string
        if (dateRange) {
            const resolved = this.resolveDateRange(dateRange)
            startTime = resolved.startTime
            endTime = resolved.endTime
        } else if (Array.isArray(this.searchParams.startTime) && this.searchParams.startTime.length === 2) {
            // 生产时间段 DatePicker range 选完存的是 [起, 止] 数组，拆成 startTime/endTime
            startTime = new Date(this.searchParams.startTime[0]).toFormat('yyyy-MM-dd 00:00:00')
            endTime = new Date(this.searchParams.startTime[1]).toFormat('yyyy-MM-dd 23:59:59')
        } else {
            const resolved = this.resolveDateRange('THIS_WEEK')
            startTime = resolved.startTime
            endTime = resolved.endTime
        }

        const siteID = (this.searchParams.siteID as string) ?? ''
        const productCategoryID = (this.searchParams.productCategoryID as string) ?? ''
        const productCode = (this.searchParams.productCode as string) ?? ''
        const params: Record<string, any> = { startTime, endTime }
        if (siteID) params.siteID = siteID
        if (productCategoryID) params.productCategoryID = productCategoryID
        if (productCode) params.productCode = productCode

        try {
            // 三个接口并行请求：汇总 / 站点 / 趋势
            const [kpiRes, sitesRes, trendRes] = await Promise.all([
                apiClient.http.getJson(apiClient.buildEntityURL({ repository: 'QualityKanban', queryParams: params })),
                apiClient.http.getJson(apiClient.buildEntityURL({ repository: 'QualityKanban', action: 'siteQuality', queryParams: params })),
                apiClient.http.getJson(apiClient.buildEntityURL({ repository: 'QualityKanban', action: 'getAnalyzeQualityFluctuation', queryParams: params })),
            ])
            // 汇总接口返回 List（仅 1 行），取第 0 项
            this.kpiData.value = (kpiRes && kpiRes.length > 0) ? kpiRes[0] : null
            this.sitesData.value = sitesRes ?? []
            this.trendData.value = trendRes ?? []
        } catch (e: any) {
            console.error('QualityKanbanLogic.home() 数据加载失败:', e)
            // 提取后端返回的错误详情，回退到通用提示
            const detail = e?.detail || e?.message || ctx.t('dashboard.loadFailedRetry')
            this.loadError.value = typeof detail === 'string' ? detail : ctx.t('dashboard.loadFailed')
            this.loaded.value = false
            return
        }

        this.loaded.value = true
    }

    /** 获取全部生产站点（searchForRelative 弹窗内查询），只查已启用站点 */
    async getAllSite(context: UiContext, value?: any) {
        await context.logic!.getAllOf<Record<string, unknown>>('Sites', {
            pager: {
                pageSize: searchParamSite.pager.pageSize,
                pageNo: searchParamSite.pager.pageNo,
            },
            searchWord: value,
            filterModel: {
                status: inFilter(UsageStatus.USED),
            },
        }, {
            repository: 'Sites',
            service: 'mes',
        }).then((res: any) => {
            searchParamSite.pager = res.pagination
            tableDataSite.value = res.list.map((item: any) => ({ ...item }))
        })
    }

    /** 获取全部制品类别（searchForRelative 弹窗内查询），来源 base 模块 MaterialCats */
    async getAllCategory(context: UiContext, value?: any) {
        await this.getAllOf<Record<string, unknown>>('MaterialCats', {
            queryParams: {
                pageSize: searchParamCategory.pager.pageSize,
                pageNo: searchParamCategory.pager.pageNo,
                sort: '',
                searchWord: value,
            },
        }).then((res: any) => {
            searchParamCategory.pager = res.pagination
            tableDataCategory.value = res.list.map((item: any) => ({ ...item }))
        })
    }

    /**
     * 在搜索之前执行，定义质量看板 5 个筛选字段：
     * 生产站点、制品类别、产品编码、生产时间段（range）、时间范围（快捷下拉）
     */
    beforeSearch() {
        const { searchFields, customSearchFields } = super.beforeSearch()
        if (customSearchFields.length === 0) {
            customSearchFields.push(
                /* 生产站点搜索字段（searchForRelative 弹窗选择，只查已启用站点） */
                {
                    searchLabel: 'qualityKanban.productionSite',
                    searchParam: 'siteID',
                    valueFn: (v: any) => !isRefNone(v) ? v.siteID : '',
                    renderer: (ctx: UiContext & any, csf) => {
                        this.bindApp(ctx)
                        if (!tableDataSite.value.length && isObject(csf.searchVal.value)) {
                            tableDataSite.value.push(csf.searchVal.value)
                        }
                        return ctx.uiBuilder.factory.searchForRelative({
                            modelValue: csf.searchVal.value,
                            dataKey: 'siteID',
                            optionLabel: (v: any) => v.siteName,
                            class: 'w-full',
                            options: tableDataSite.value,
                            toSearch: async () => {
                                const picked = await ctx.select({
                                    repository: 'Sites',
                                    service: 'mes',
                                    selectionMode: 'single',
                                })
                                if (!Array.isArray(picked) || !picked.length) return false
                                const data = picked[0]
                                csf.searchVal.value = csf.searchWord = data
                                ctx.model.siteID = data.siteID ?? ctx.model.siteID
                                this.searchParam.siteID = ctx.model.siteID
                                ctx.app.localDb.put(`search/${ctx.logic.repository}/siteID`, JSON.parse(JSON.stringify(data)))
                                return true
                            },
                            onUpdate: (value: any) => {
                                csf.searchVal.value = value || null
                                ctx.app.localDb.put(`search/${ctx.logic.repository}/siteID`, JSON.parse(JSON.stringify(value)))
                            },
                            onInput: (value: string) => {
                                debounce(async () => {
                                    await this.getAllSite(ctx, value)
                                }, 500)()
                            },
                        })
                    },
                },
                /* 制品类别搜索字段（searchForRelative 弹窗选择，来源 base.MaterialCat） */
                {
                    searchLabel: 'qualityKanban.productCategory',
                    searchParam: 'productCategoryID',
                    valueFn: (v: any) => !isRefNone(v) ? v.categoryID : '',
                    renderer: (ctx: UiContext & any, csf) => {
                        if (!tableDataCategory.value.length && isObject(csf.searchVal.value)) {
                            tableDataCategory.value.push(csf.searchVal.value)
                        }
                        return ctx.uiBuilder.factory.searchForRelative({
                            modelValue: csf.searchVal.value,
                            dataKey: 'categoryID',
                            optionLabel: (v: any) => v.categoryName,
                            class: 'w-full',
                            options: tableDataCategory.value,
                            toSearch: async () => {
                                const picked = await ctx.select({
                                    repository: 'MaterialCats',
                                    service: 'base',
                                    selectionMode: 'single',
                                })
                                if (!Array.isArray(picked) || !picked.length) return false
                                const data = picked[0]
                                csf.searchVal.value = csf.searchWord = data
                                ctx.model.productCategoryID = data.categoryID ?? ctx.model.productCategoryID
                                this.searchParam.productCategoryID = ctx.model.productCategoryID
                                ctx.app.localDb.put(`search/${ctx.logic.repository}/productCategoryID`, JSON.parse(JSON.stringify(data)))
                                return true
                            },
                            onUpdate: (value: any) => {
                                csf.searchVal.value = value || null
                                ctx.app.localDb.put(`search/${ctx.logic.repository}/productCategoryID`, JSON.parse(JSON.stringify(value)))
                            },
                            onInput: (value: string) => {
                                debounce(async () => {
                                    await this.getAllCategory(ctx, value)
                                }, 500)()
                            },
                        })
                    },
                },
                /* 产品编码搜索字段（文本输入，后端 productCode/productName LIKE 模糊匹配） */
                {
                    searchLabel: 'qualityKanban.productCode',
                    searchParam: 'productCode',
                    renderer: (ctx: UiContext & any, csf) => primeVueFactory.input(csf.searchVal.value, {
                        placeholder: ctx.t('qualityKanban.productCode'),
                        onValueChange: (val: string) => {
                            csf.searchVal.value = val
                            ctx.app.localDb.put(`search/${ctx.logic.repository}/productCode`, JSON.parse(JSON.stringify(val)))
                        },
                    }),
                },
                /* 生产时间段搜索字段（范围日期选择，选完拆成 startTime/endTime） */
                {
                    searchLabel: 'qualityKanban.productionPeriod',
                    searchParam: 'startTime',
                    renderer: (ctx: UiContext & any, csf) => {
                        // localStorage 恢复的是 ISO 字符串数组，PrimeVue DatePicker 的 range 模式需要 Date 数组，
                        // 这里把字符串元素还原为 Date，避免 datepicker 用 yy-mm-dd 解析 ISO 字符串报错
                        const raw = csf.searchVal.value
                        const modelValue = Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string'
                            ? raw.map((s: string) => new Date(s))
                            : raw
                        return ctx.uiBuilder.factory.datePicker({
                            selectionMode: 'range',
                            modelValue: modelValue,
                            onUpdatePicker: (value: any) => {
                                csf.searchVal.value = value
                                ctx.app.localDb.put(`search/${ctx.logic.repository}/startTime`, JSON.parse(JSON.stringify(value)))
                            },
                        })
                    },
                },
                /* 时间范围搜索字段（快捷下拉：今日/本周/本月/本季度/本年等） */
                {
                    searchLabel: 'view.timesRange',
                    searchParam: 'date',
                    renderer: (ctx: UiContext & any, csf) => {
                        const searchData = {
                            timeSelect: [
                                { name: ctx.t('dateRange.TODAY'), value: 'TODAY' },
                                { name: ctx.t('dateRange.YESTERDAY'), value: 'YESTERDAY' },
                                { name: ctx.t('dateRange.THIS_WEEK'), value: 'THIS_WEEK' },
                                { name: ctx.t('dateRange.LAST_WEEK'), value: 'LAST_WEEK' },
                                { name: ctx.t('dateRange.LAST_7_DAYS'), value: 'LAST_7_DAYS' },
                                { name: ctx.t('dateRange.THIS_MONTH'), value: 'THIS_MONTH' },
                                { name: ctx.t('dateRange.LAST_MONTH'), value: 'LAST_MONTH' },
                                { name: ctx.t('dateRange.LAST_30_DAYS'), value: 'LAST_30_DAYS' },
                                { name: ctx.t('dateRange.THIS_QUARTER'), value: 'THIS_QUARTER' },
                                { name: ctx.t('dateRange.LAST_QUARTER'), value: 'LAST_QUARTER' },
                                { name: ctx.t('dateRange.THIS_YEAR'), value: 'THIS_YEAR' },
                                { name: ctx.t('dateRange.LAST_YEAR'), value: 'LAST_YEAR' },
                            ],
                        })
                        return ctx.uiBuilder.factory.dropDownList({
                            value: csf.searchVal.value ?? 'THIS_WEEK',
                            options: searchData.timeSelect.map((item: any) => ({
                                value: item.value,
                                label: item.name,
                            })),
                            onChange: (value) => {
                                csf.searchVal.value = value
                                ctx.app.localDb.put(`search/${ctx.logic.repository}/date`, JSON.parse(JSON.stringify(value)))
                            },
                        })
                    },
                },
            )
        }
        return { searchFields, customSearchFields }
    }

    /**
     * 设置编辑交互逻辑
     */
    beforeEdit() {
        const { fields, groups, customActions } = super.beforeEdit();
        return { fields, groups, customActions };
    }

    //设置详情逻辑
    beforeDetails() {
        const { fields, groups, customActions } = super.beforeDetails();
        return { fields, groups, customActions };
    }
}

/**
 * 构造质量看板交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const QualityKanbanLogicCtor = (metaUiService: MetaUiService, router: UiLogicInit["router"], module?: Module) =>
    new QualityKanbanLogic({
        metaUiService: metaUiService,
        repository: 'QualityKanban',
        router,
        module: module || metaUiService.findModule('QualityKanban'),
        customPage: true,
    });
//#endregion ~GENERATED PARTS END
