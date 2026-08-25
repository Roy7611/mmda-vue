import { defineEntity, assignSearchParam } from '@mmda/core'
import {
  GenericUiLogic,
  UI_APP_KEY,
  UiBuildContext,
  UiViewMany,
  UiViewOne,
  resolveSearchParam,
  resolveViewManyProps,
  type MmdaApplication,
  type UiLogicInit,
} from '@mmda/vui'
import { defineComponent, h, inject, onMounted, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createRepositoryLogic } from '../logic/registry'
import { APP_NAME } from '../keys'
import { resolveRepositoryModule } from '../module_resolve'

function resolveView(path: string, queryView?: unknown) {
  if (path.includes('/Create')) return UiViewOne.Create
  if (path.includes('/Edit/')) return UiViewOne.Edit
  if (queryView === UiViewMany.SelectMany) return UiViewMany.SelectMany
  const parts = path.split('/').filter(Boolean)
  if (parts.length >= 3 && parts[0] === APP_NAME && !['Create', 'Edit'].includes(parts[1])) {
    if (parts.length === 3) return UiViewOne.Details
  }
  return UiViewMany.Index
}

export const EntityPages = defineComponent({
  name: 'EntityPages',
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication
    const route = useRoute()
    const router = useRouter()
    const current = shallowRef<UiBuildContext>()
    const error = shallowRef('')

    async function open() {
      error.value = ''
      const repository = String(route.params.repository ?? '')
      const module = resolveRepositoryModule(app, repository)
      const init: UiLogicInit = {
        service: app.meta,
        repository,
        router,
        module,
      }
      const token = `${repository}Logic`
      const logic =
        app.di.tryInject(token) ??
        createRepositoryLogic(repository, init) ??
        new GenericUiLogic(defineEntity, init)
      if (module) logic.module = module
      const pack = await app.meta.getPack({ repository, service: 'base' })
      if (!pack?.metaui) {
        throw new Error(`未加载到仓库元数据：${repository}`)
      }
      // 必须先挂 pack，再 new UiBuildContext（构造/applyTo 会调 Logic.field → metaui.getField）
      logic.meta = pack
      const view = resolveView(route.path, route.query.view)
      const many =
        view === UiViewMany.Index ||
        view === UiViewMany.SelectMany ||
        view === UiViewMany.SelectOne
      const model = many
        ? ({ list: [], pagination: {} } as any)
        : ({ id: route.params.id } as any)
      const context = new UiBuildContext({
        model,
        metaui: pack.metaui,
        view,
        logic,
        app,
      })
      if (many) {
        assignSearchParam(
          context.searchParam,
          resolveSearchParam(
            resolveViewManyProps(route.params, route.query as Record<string, unknown>, {}),
          ),
        )
      }
      await context.init({
        id: route.params.id as string | undefined,
        queryParams: route.query as Record<string, any>,
      })
      current.value = context
    }

    onMounted(() => {
      void open().catch((err) => {
        error.value = err instanceof Error ? err.message : String(err)
      })
    })
    watch(
      () => [route.path, route.params.id, route.query.view],
      () => {
        void open().catch((err) => {
          error.value = err instanceof Error ? err.message : String(err)
        })
      },
    )

    return () => {
      if (error.value) return h('p', { class: 'mmda-prime-error' }, error.value)
      const context = current.value
      if (!context) return h('p', '加载中…')
      return context.many
        ? app.ui.buildListView(context, {
            showToolbar: true,
            showSearchbar: true,
            selectionMode:
              context.view === UiViewMany.SelectOne ? 'single' : 'multiple',
            onItemDoubleClick: (item: any) =>
              router.push(`/${APP_NAME}/${route.params.repository}/${item.id}`),
          })
        : app.ui.buildView(context, { showToolbar: true })
    }
  },
})
