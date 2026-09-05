/**
 * MES 首页业务逻辑
 * 保留 getAll / getAllSite / beforeSearch 等核心方法
 * 从单接口 Dashboards/home 改为 11 个独立 Dashboard 接口并行调用
 */
import { Router } from 'vue-router'
import { MetaUiService, Module, UiContext, debounce, isNullOrUndefined, isRefNone, isObject, triggerEscKey, pagedList, NO_PAGINATION, inFilter } from '@mmda/core'
import type { UiLogicInit } from '@mmda/vui'
import { UiLogic } from '@mmda/vui'
import { reactive, ref } from 'vue'
import { UsageStatus } from '@mmda/base/src/enums/UsageStatus';
import { type CustomPage, defineCustomPage } from '@/models/CustomPage'
import type { HomeKpi, Worker, Equipment, Material, ProductionChartData, SafetyAlert, EquipmentAlarm, TodaySummary, QcStats, EquipmentOverview, PendingNotification } from './types'
import type { UiBuildContext } from '@mmda/vui';

const tableDataSite = ref([])
const tableDataKeySite = ref('id')
const searchParamSite = reactive({
  pager: { pageSize: 10, pageNo: 1 },
  searchWord: '',
  searchParams: {},
})

export class HomeLogic extends UiLogic<CustomPage> {
  constructor(init: UiLogicInit) {
    super(defineCustomPage, init)
  }

  /** 11 个 Dashboard 接口返回值响应式变量 — 供 HomeView 消费 */
  kpiData = ref<HomeKpi | null>(null)
  workersData = ref<Worker[]>([])
  equipmentsData = ref<Equipment[]>([])
  materialsData = ref<Material[]>([])
  chartData = ref<ProductionChartData | null>(null)
  trendData = ref<number[]>([])
  safetyAlertsData = ref<SafetyAlert[]>([])
  equipmentAlarmsData = ref<EquipmentAlarm[]>([])
  summaryData = ref<TodaySummary | null>(null)
  qcStatsData = ref<QcStats | null>(null)
  equipmentOverviewData = ref<EquipmentOverview[]>([])
  /** 待处理通知数据，由 /Dashboards/home 聚合端点返回，后端查询 mmda_base.notice 表 */
  pendingNotificationsData = ref<PendingNotification[]>([])

  /** 标记首页数据是否已加载完成 — 控制 HomeView 的三态切换 */
  loaded = ref(false)

  /** 首页数据加载错误信息，非空表示加载失败，供 HomeView 显示错误态 */
  loadError = ref<string | null>(null)

  /**
   * 解析快捷时间范围为起止日期字符串
   * 支持 12 种类型，未知范围回退本周
   */
  private resolveDateRange(range: string): { beginTime: string; endTime: string } {
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
      beginTime: begin.toFormat('yyyy-MM-dd 00:00:00'),
      endTime: end.toFormat('yyyy-MM-dd 23:59:59'),
    }
  }

  /**
   * 首页数据加载：单次聚合请求 /Dashboards/home，后端返回所有面板数据
   */
  async home(ctx?: any) {
    const { $api: apiBox } = ctx.globalProps

    // 时间范围优先级：快捷范围 > 精确日期 > 回退本周
    let beginTime: string
    let endTime: string
    const dateRange = this.searchParams.date as string
    if (dateRange) {
      const resolved = this.resolveDateRange(dateRange)
      beginTime = resolved.beginTime
      endTime = resolved.endTime
    } else if (this.searchParams.beginTime || this.searchParams.endTime) {
      const now = new Date()
      const day = now.getDay()
      const mondayOffset = day === 0 ? -6 : 1 - day
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)
      beginTime = (this.searchParams.beginTime as string)
        ? new Date(this.searchParams.beginTime as string).toFormat('yyyy-MM-dd 00:00:00')
        : monday.toFormat('yyyy-MM-dd 00:00:00')
      endTime = (this.searchParams.endTime as string)
        ? new Date(this.searchParams.endTime as string).toFormat('yyyy-MM-dd 23:59:59')
        : new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6).toFormat('yyyy-MM-dd 23:59:59')
    } else {
      const resolved = this.resolveDateRange('THIS_WEEK')
      beginTime = resolved.beginTime
      endTime = resolved.endTime
    }

    const siteID = (this.searchParams.siteID as string) ?? ''
    const params = { ...(siteID ? { siteID } : {}), beginTime, endTime }

    // 单次聚合请求：/Dashboards/home 返回所有面板数据（含 pendingNotifications）
    try {
      const res = await apiBox.http.getJson(
        apiBox.buildEntityURL({ repository: 'Dashboards', action: 'home', queryParams: params })
      )

      if (res) {
        this.kpiData.value = res.dashboardKpi ?? null
        this.workersData.value = res.onDutyWorkers ?? []
        this.equipmentsData.value = res.equipmentStatuses ?? []
        this.materialsData.value = res.materialConsumptions ?? []
        this.chartData.value = res.productionTrend ?? null
        this.trendData.value = res.qualityTrend?.trendData ?? []
        this.safetyAlertsData.value = res.safetyAlerts ?? []
        this.equipmentAlarmsData.value = res.equipmentAlarms ?? []
        this.summaryData.value = res.todaySummary ?? null
        this.qcStatsData.value = res.qcStats ?? null
        this.equipmentOverviewData.value = res.equipmentOverview ?? []
        this.pendingNotificationsData.value = res.pendingNotifications ?? []
      }
    } catch (e: any) {
      console.error('HomeLogic.home() 聚合请求失败:', e)
      // 提取后端返回的 ProblemDetails 错误详情，回退到通用提示
      const detail = e?.detail || e?.message || ctx.t('dashboard.loadFailedRetry')
      this.loadError.value = typeof detail === 'string' ? detail : ctx.t('dashboard.loadFailed')
      this.loaded.value = false // 加载失败不标记已完成，下次 init 可重试
    }

    this.loaded.value = true
  }

  async getAll(param: any, ctx?: any) {
    await this.home(ctx)
    // 首页自定义卡片无需表格数据，返回空分页
    return pagedList([], NO_PAGINATION)
  }

  async getAllSite(context: UiContext, value?: any) {
    await context.globalProps.$api.searchAll({
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

  searchParam: Record<string, any> = {}

  beforeSearch() {
    const { searchFields, customSearchFields } = super.beforeSearch()
    if (customSearchFields.length === 0) {
      customSearchFields.push(
        /* 工作中心搜索字段 */
        {
          searchLabel: 'view.workSite',
          searchParam: 'siteID',
          valueFn: (v: any) => !isRefNone(v) ? v.siteID : '',
          renderer: (ctx: UiBuildContext<any> & any, csf) => {
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
                let data: any = null
                const { metaui } = await ctx.logic!.loadMetadata('Sites', 'mes', true)
                tableDataKeySite.value = metaui.primaryKey
                const columns = await ctx.uiBuilder.buildColumns(metaui, ctx, {
                  isSearch: true,
                  cacheKey: `siteID/SearchRelative/${metaui.primaryKey}`,
                })
                ctx.uiBuilder.confirmDialog(
                  ctx.uiBuilder.buildSearchForRelativeContent(columns, {
                    dataKey: tableDataKeySite.value,
                    /* 必须显式声明单选模式：不传时底层 PrimeVue 表格没有 selectionMode，单击行不会触发 row-select，onSelect 永不执行，导致点确认无响应 */
                    selectionMode: 'single',
                    onSearch: async (params: any) => {
                      await this.getAllSite(ctx, params.searchParams.searchWord)
                      return { list: tableDataSite.value, pager: searchParamSite.pager }
                    },
                    onPage: ({ pageNo, pageSize }: any) => {
                      searchParamSite.pager.pageNo = pageNo
                      searchParamSite.pager.pageSize = pageSize
                    },
                    /* single 模式下第一个参数就是当前选中行对象，取消选中时为 null */
                    onSelect: (selection: any) => { data = selection },
                    onRowDblclick: (row: any) => {
                      csf.searchVal.value = csf.searchWord.value = row
                      ctx.app.localDb.put(`search/${ctx.logic.repository}/siteID`, JSON.parse(JSON.stringify(row)))
                      triggerEscKey()
                    },
                  }),
                  ctx,
                  {
                    title: ctx.t('view.workSite'),
                    style: { width: '80vw', maxHeight: '95%' },
                    accept: async () => {
                      /* 未选中任何工作中心时给出明确提示：原实现静默 return false，用户感知为「点确认无响应」 */
                      if (!data || !data.siteID) {
                        ctx.uiBuilder.toast(ctx, {
                          severity: 'error',
                          summary: ctx.t('dialog.title.error'),
                          group: 'br',
                          detail: ctx.t('dashboard.selectWorksiteFirst'),
                          life: 3000,
                        })
                        return false
                      }
                      csf.searchVal.value = data
                      /* searchWord 是 Ref，必须写 .value：原实现 csf.searchWord = data 会把 Ref 本身替换成普通对象，破坏响应式 */
                      csf.searchWord.value = data
                      ctx.model.siteID = data.siteID ?? ctx.model.siteID
                      this.searchParam.siteID = ctx.model.siteID
                      ctx.app.localDb.put(`search/${ctx.logic.repository}/siteID`, JSON.parse(JSON.stringify(data)))
                      return true
                    },
                  },
                )
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
        /* 开始日期 */
        {
          searchLabel: 'dashboard.startDate',
          searchParam: 'beginTime',
          renderer: (ctx: UiBuildContext<any> & any, csf) => {
            if (!isNullOrUndefined(csf.searchVal.value)) {
              csf.searchVal.value = new Date(csf.searchVal.value).toFormat('yyyy-MM-dd')
            }
            return ctx.uiBuilder.factory.datePicker({
              modelValue: csf.searchVal.value,
              manualInput: false,
              onUpdatePicker: (value: any) => {
                csf.searchVal.value = value
                ctx.app.localDb.put(`search/${ctx.logic.repository}/beginTime`, JSON.parse(JSON.stringify(value)))
              },
            })
          },
        },
        /* 结束日期 */
        {
          searchLabel: 'dashboard.endDate',
          searchParam: 'endTime',
          renderer: (ctx: UiBuildContext<any> & any, csf) => {
            if (!isNullOrUndefined(csf.searchVal.value)) {
              csf.searchVal.value = new Date(csf.searchVal.value).toFormat('yyyy-MM-dd')
            }
            return ctx.uiBuilder.factory.datePicker({
              modelValue: csf.searchVal.value,
              manualInput: false,
              onUpdatePicker: (value: any) => {
                csf.searchVal.value = value
                ctx.app.localDb.put(`search/${ctx.logic.repository}/endTime`, JSON.parse(JSON.stringify(value)))
              },
            })
          },
        },
        /* 时间范围 */
        {
          searchLabel: 'view.timesRange',
          searchParam: 'date',
          renderer: (ctx: UiBuildContext<any> & any, csf) => {
            const searchData = reactive({
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
            return ctx.uiBuilder.factory.select({
              modelValue: csf.searchVal.value ?? 'THIS_WEEK',
              options: searchData.timeSelect,
              optionLabel: 'name',
              optionValue: 'value',
              onUpdate: (value: any) => {
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
}

export const HomeLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
  new HomeLogic({
    metaUiService: metaUiService,
    repository: 'StationPortals',
    router,
    module: module || metaUiService.findModule('StationPortal'),
  })
