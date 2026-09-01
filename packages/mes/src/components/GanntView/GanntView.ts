import {
  defineComponent,
  h,
  inject,
  onMounted,
  ref,
  shallowRef,
  type PropType,
} from 'vue'
import type { ApiClient } from '@mmda/core'
import {
  UI_APP_KEY,
  type MmdaApplication,
  type UiBuildContext,
  type UiGanttController,
  type UiGanttViewMode,
} from '@mmda/vui'
import {
  ganttLinkToSavePayload,
  ganttTaskToSavePayload,
  mapSchedulePayload,
  rejectLockedTaskDrag,
} from '@/schedule/scheduleMapper'
import './GanntView.less'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'GanntView',
  props: {
    ctx: Object as PropType<UiBuildContext<any>>,
  },
  setup(props) {
    const { t } = useI18n()
    const app = inject(UI_APP_KEY) as MmdaApplication
    const tasks = ref<any[]>([])
    const links = ref<any[]>([])
    const loading = ref(true)
    const viewMode = ref<UiGanttViewMode>('week')
    const controller = shallowRef<UiGanttController>()
    const snapshot = ref({ tasks: [] as any[], links: [] as any[] })

    const api = () =>
      (props.ctx as any)?.app?.meta?.getApiClient?.() ??
      (app as any)?.meta?.getApiClient?.() as ApiClient

    const toastError = (error: any) => {
      props.ctx?.uiBuilder?.toast?.(props.ctx as any, {
        severity: 'error',
        detail: error?.validationErrors?.[0]?.error ?? error?.message ?? String(error),
      })
    }

    const load = async () => {
      loading.value = true
      try {
        const res: any = await api().getAll({
          action: 'getAllSchedule',
          repository: 'ProductionScheduleTasks',
          service: 'mes',
        })
        const mapped = mapSchedulePayload(res?.list ?? res)
        tasks.value = mapped.tasks
        links.value = mapped.links
        snapshot.value = {
          tasks: JSON.parse(JSON.stringify(mapped.tasks)),
          links: JSON.parse(JSON.stringify(mapped.links)),
        }
        controller.value?.refresh(mapped.tasks, mapped.links)
      } catch (error) {
        toastError(error)
      } finally {
        loading.value = false
      }
    }

    const restore = () => {
      tasks.value = JSON.parse(JSON.stringify(snapshot.value.tasks))
      links.value = JSON.parse(JSON.stringify(snapshot.value.links))
      controller.value?.refresh(tasks.value, links.value)
    }

    onMounted(() => void load())

    return () => {
      const ui = props.ctx?.uiBuilder ?? app.ui
      const factory = ui.factory
      return h('div', { class: 'ganttBoxWrapper ganttBoxWrapper--schedule' }, [
        h('div', { class: 'opearBox' }, [
          factory.formItem?.(
            { label: t('ganttLabel.timeScale') },
            {
              default: () =>
                factory.select?.({
                  modelValue: viewMode.value,
                  options: [
                    { name: t('ganttLabel.day'), value: 'day' },
                    { name: t('ganttLabel.week'), value: 'week' },
                    { name: t('ganttLabel.month'), value: 'month' },
                    { name: t('ganttLabel.quarter'), value: 'quarter' },
                    { name: t('ganttLabel.year'), value: 'year' },
                  ],
                  optionLabel: 'name',
                  dataKey: 'value',
                  onUpdate: (value: UiGanttViewMode) => {
                    viewMode.value = value
                    controller.value?.setViewMode(value)
                  },
                }),
            },
          ),
          factory.buttonGroup?.(
            () => [
              factory.button({
                label: t('action.refresh'),
                icon: factory.resolveIcon('refresh'),
                onAction: () => load(),
              }),
              factory.button({
                label: t('action.fit'),
                onAction: () => controller.value?.fitToProject(),
              }),
              factory.button({
                label: t('action.undo'),
                onAction: () => {
                  controller.value?.undo()
                  restore()
                },
              }),
            ],
            {},
          ),
        ]),
        ui.buildGanttChart(props.ctx as any, {
          tasks: tasks.value,
          links: links.value,
          height: '70vh',
          viewMode: viewMode.value,
          loading: loading.value,
          allowRowReorder: false,
          columns: [
            { field: 'TaskName', header: t('ganttLabel.task') },
            { field: 'StartDate', header: t('ganttLabel.start') },
            { field: 'EndDate', header: t('ganttLabel.end') },
          ],
          onReady: ctl => {
            controller.value = ctl
          },
          onTaskChange: async event => {
            const task = event.task
            if (!rejectLockedTaskDrag(task)) {
              restore()
              return false
            }
            try {
              await api().doAction(
                {
                  action: 'saveAndGetAll',
                  repository: 'ProductionScheduleTasks',
                  service: 'mes',
                },
                ganttTaskToSavePayload(task!),
              )
              await load()
              return true
            } catch (error) {
              toastError(error)
              restore()
              return false
            }
          },
          onLinkChange: async event => {
            try {
              await api().doAction(
                {
                  action: 'saveLinkAndGet',
                  repository: 'ProductionScheduleTasks',
                  service: 'mes',
                },
                ganttLinkToSavePayload(event.link!),
              )
              await load()
              return true
            } catch (error) {
              toastError(error)
              restore()
              return false
            }
          },
        }),
      ])
    }
  },
})
