import {
  defineEntity,
  GenericEntityLogic,
  type EntityLogicInit,
  type MmdaApplication,
  type Module,
  type UiErrorProps,
  type UiScreenViewFn,
  EntitySearchParam,
} from "@mmda/core";
import {
  computed,
  defineComponent,
  h,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  shallowRef,
  watch,
  type Component,
  type VNode,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { translateMessage } from "../i18n/i18n";
import type { MmdaVueApp } from "../app/app";
import type { VuiBuilder } from "../ui/builder";
import { VuiContext } from "../contexts/vue_ui_context";
import { UI_APP_KEY } from "../app/keys";
import type { EntityLogic } from "@mmda/core";
import {
  resolveSearchParam,
  resolveViewManyProps,
  UiViewMany,
  UiViewOne,
  type UiViewType,
} from "../contexts/view";
import {
  createModuleContext,
  MODULE_CONTEXT_KEY,
  bindModuleContext,
} from "../contexts/vue_module_context";
import { ErrorRetry } from "./ErrorRetry";
import { hostedScreenView } from "./hosted_view";

export interface EntityViewOptions {
  createLogic: (
    repository: string,
    init: EntityLogicInit,
  ) => EntityLogic<any> | undefined | Promise<EntityLogic<any> | undefined>;
  resolveService?: (path: string) => string;
  resolveLogicToken?: (repository: string, service: string) => string;
  resolveModule?: (
    app: MmdaApplication,
    repository: string,
    path: string,
  ) => Module | undefined;
  /**
   * 老的实体屏自定义页：直接给 Vue 组件（只剩还没搬迁的包在用）。
   * 新代码用 {@link resolveScreenView}，业务包不必碰框架。
   */
  resolveCustomView?: (
    repository: string,
    service: string,
  ) => Component | undefined;
  /**
   * 实体屏自定义页（**框架无关**）：业务包给 `UiScreenViewFn`，这里包成 Vue 组件。
   * 命中它就不看 `resolveCustomView`。
   */
  resolveScreenView?: (
    repository: string,
    service: string,
  ) => UiScreenViewFn<VNode> | undefined;
}

/** 路由前缀：`/BASE`、`/MES`。`app.name` 是构造时的 service（`base`/`mes`）。 */
export function appRouteName(app: MmdaApplication) {
  return app.name.toUpperCase();
}

export function resolveRepositoryModule(
  app: MmdaApplication,
  repository: string,
): Module | undefined {
  const appName = appRouteName(app);
  const singular = repository.replace(/s$/, "");
  return (
    app.findModule(`/${appName}/${repository}`) ??
    app.findModule(`/${appName}/${singular}`) ??
    app.findModule(singular) ??
    app.findModule(repository)
  );
}

function resolveEntityView(path: string, queryView?: unknown): UiViewType {
  if (path.includes("/Create")) return UiViewOne.Create;
  if (path.includes("/Edit/")) return UiViewOne.Edit;
  if (queryView === UiViewMany.SelectMany) return UiViewMany.SelectMany;
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 3 && !["Create", "Edit"].includes(parts[1])) {
    return UiViewOne.Details;
  }
  return UiViewMany.Index;
}

function isIndexView(path: string, queryView?: unknown): boolean {
  const view = resolveEntityView(path, queryView);
  return view === UiViewMany.Index || view === UiViewMany.SelectMany;
}

function renderEntityPage(
  app: MmdaVueApp,
  context: VuiContext,
  options: EntityViewOptions,
  route: ReturnType<typeof useRoute>,
) {
  if (!context.many) {
    void context.pageNotice.value;
    void context.pageLayoutRev.value;
  }
  const treeData = (context.logic as { treeData?: { value?: unknown } })
    ?.treeData;
  if (treeData && "value" in treeData) void treeData.value;
  if (!context.many) {
    for (const group of context.metaUi.groups) {
      if (!group.many) continue;
      const items = (context.model as Record<string, unknown>)[group.groupName];
      if (Array.isArray(items)) void items.length;
    }
  }
  const repository = String(route.params.repository ?? "");
  const service = options.resolveService?.(route.path) ?? app.name;
  const ScreenView = options.resolveScreenView?.(repository, service);
  if (ScreenView && context.many) {
    // 框架无关的自定义页：依赖（含该屏会话）在适配层里装配。
    return h(hostedScreenView(ScreenView), { ctx: context });
  }
  const CustomView = options.resolveCustomView?.(repository, service);
  if (CustomView && context.many) {
    return h(CustomView, { ctx: context });
  }
  const ui = app.ui as VuiBuilder;
  const view = String(context.view ?? "");
  if (
    view === UiViewMany.SelectOne ||
    view === UiViewMany.SelectMany
  ) {
    return ui.buildSelectView(context, {
      showToolbar: true,
      showSearchbar: true,
      selectionMode: view === UiViewMany.SelectOne ? "single" : "multiple",
    });
  }
  if (view === UiViewOne.Edit || view === UiViewOne.Create) {
    return ui.buildEditView(context, { showToolbar: true });
  }
  if (!context.many) {
    return ui.buildDetailsView(context, { showToolbar: true });
  }
  return ui.buildIndexView(context, {
    showToolbar: true,
    showSearchbar: true,
    selectionMode: "multiple",
  });
}

function loadingNode(app: MmdaVueApp) {
  return h(
    "div",
    {
      class: "mmda-entity-page-loading",
      role: "status",
      "aria-busy": "true",
      "aria-label": translateMessage("state.loading"),
    },
    [(app.ui as VuiBuilder).factory.loading()],
  );
}

function errorRetryNode(app: MmdaVueApp, props: UiErrorProps) {
  return (
    (app.ui as VuiBuilder).factory.error?.(props) ??
    h(ErrorRetry, props as Record<string, unknown>)
  );
}

async function openEntityContext(
  options: EntityViewOptions,
  app: MmdaVueApp,
  route: ReturnType<typeof useRoute>,
  router: ReturnType<typeof useRouter>,
  viewOverride?: UiViewType,
): Promise<VuiContext> {
  const repository = String(route.params.repository ?? "");
  const service = options.resolveService?.(route.path) ?? app.name;
  const module =
    options.resolveModule?.(app, repository, route.path) ??
    app.findModule(route.path) ??
    resolveRepositoryModule(app, repository);
  const init: EntityLogicInit = {
    metaUiService: app.meta,
    repository,
    module,
    apiService: service,
  };
  const token =
    options.resolveLogicToken?.(repository, service) ?? `${repository}Logic`;
  let injected: EntityLogic<any> | undefined;
  try {
    injected = await app.di.injectAsync<EntityLogic<any>>(token);
  } catch {
    // Repository without a registered custom Logic uses the generic one.
  }

  const logic =
    injected ??
    (await options.createLogic(repository, init)) ??
    (await GenericEntityLogic.resolve(app.di, token, defineEntity, init));
  if (module) logic.module = module;

  const metaUi = await app.meta.get(repository, service);
  if (!metaUi) {
    throw new Error(
      translateMessage("invalid.repositoryMissing", { repository }),
    );
  }
  logic.metaUi = metaUi;

  const view = viewOverride ?? resolveEntityView(route.path, route.query.view);
  const many =
    view === UiViewMany.Index ||
    view === UiViewMany.SelectMany ||
    view === UiViewMany.SelectOne;
  const context = new VuiContext({
    model: many ? [] : ({ id: route.params.id } as any),
    metaUi,
    view,
    logic,
    app,
    router,
  });
  if (many) {
    EntitySearchParam.assign(
      context.searchParam,
      resolveSearchParam(
        resolveViewManyProps(
          route.params,
          route.query as Record<string, unknown>,
          {},
        ),
      ),
    );
  }
  await context.init({
    path: route.params.id as string | undefined,
    queryParams: route.query as Record<string, any>,
  });
  return context;
}

/**
 * 同模块 CRUD：工作区叠层保活 Index；Create/Edit/Details 为 One。
 * 返回值带 `.Index` / `.One`，供嵌套路由 children 使用。
 */
export function createEntityView(options: EntityViewOptions) {
  const EntityIndexView = defineComponent({
    name: "EntityIndexView",
    setup() {
      const app = inject(UI_APP_KEY)! as MmdaVueApp;
      const route = useRoute();
      const router = useRouter();
      const sync = inject(MODULE_CONTEXT_KEY, null);
      const current = shallowRef<VuiContext>();
      const error = shallowRef<unknown>(null);
      const pageLoading = ref(false);
      let openGeneration = 0;

      async function open() {
        const generation = ++openGeneration;
        error.value = null;
        pageLoading.value = true;
        current.value = undefined;
        try {
          const view = resolveEntityView(route.path, route.query.view);
          // Index 路由只应落到列表态；SelectMany 仍走本组件
          const indexView =
            view === UiViewMany.SelectMany ? view : UiViewMany.Index;
          const context = await openEntityContext(
            options,
            app,
            route,
            router,
            indexView,
          );
          if (generation !== openGeneration) return;
          bindModuleContext(context, sync);
          current.value = context;
          sync?.registerIndex(context);
        } finally {
          if (generation === openGeneration) pageLoading.value = false;
        }
      }

      const showError = (value: unknown) => {
        error.value = value;
        pageLoading.value = false;
      };

      onMounted((): void => void open().catch(showError));
      // 仅 query.view（如 selectMany）变化时重建；path/id 由叠层保活，不重开
      watch(
        () => route.query.view,
        (next, prev) => {
          if (next === prev) return;
          void open().catch(showError);
        },
      );
      // 从 One 揭开回列表：按需 search。叠层常驻，不要 select / 动虚拟滚动
      watch(
        () => isIndexView(route.path, route.query.view),
        async (now, was) => {
          if (!now || was !== false) return;
          if (sync?.consumeNeedsSearch() && current.value) {
            try {
              await current.value.search?.();
            } catch (error) {
              showError(error);
            }
          }
        },
      );
      onUnmounted(() => {
        if (current.value) sync?.unregisterIndex(current.value);
      });

      return () => {
        if (error.value) {
          return errorRetryNode(app, {
            error: error.value,
            onRetry: (): void => {
              void open().catch(showError);
            },
          });
        }
        if (pageLoading.value || !current.value) {
          return loadingNode(app);
        }
        return renderEntityPage(app, current.value, options, route);
      };
    },
  });

  const EntityOneView = defineComponent({
    name: "EntityOneView",
    setup() {
      const app = inject(UI_APP_KEY)! as MmdaVueApp;
      const route = useRoute();
      const router = useRouter();
      const sync = inject(MODULE_CONTEXT_KEY, null);
      const current = shallowRef<VuiContext>();
      const error = shallowRef<unknown>(null);
      const pageLoading = ref(false);
      let openGeneration = 0;

      async function open() {
        const generation = ++openGeneration;
        error.value = null;
        pageLoading.value = true;
        current.value = undefined;
        try {
          const context = await openEntityContext(options, app, route, router);
          if (generation !== openGeneration) return;
          bindModuleContext(context, sync);
          const pending = sync?.consumePendingPageNotice?.() ?? null;
          if (pending) context.pageNotice.value = pending;
          current.value = context;
        } finally {
          if (generation === openGeneration) pageLoading.value = false;
        }
      }

      const showError = (value: unknown) => {
        pageLoading.value = false;
        if (current.value) {
          error.value = null;
          const text = value instanceof Error ? value.message : String(value);
          void app.ui.message(current.value, {
            severity: "error",
            content: text,
          });
          return;
        }
        error.value = value;
      };

      onMounted((): void => void open().catch(showError));
      watch(
        () => [route.path, route.params.id],
        (): void => void open().catch(showError),
      );

      return () => {
        if (error.value) {
          return errorRetryNode(app, {
            error: error.value,
            onRetry: (): void => {
              void open().catch(showError);
            },
          });
        }
        if (pageLoading.value || !current.value) {
          return loadingNode(app);
        }
        void current.value.pageNotice.value;
        return renderEntityPage(app, current.value, options, route);
      };
    },
  });

  const EntityWorkspace = defineComponent({
    name: "EntityWorkspace",
    setup() {
      const route = useRoute();
      const sync = createModuleContext();
      provide(MODULE_CONTEXT_KEY, sync);
      watch(
        () => String(route.params.repository ?? ""),
        () => sync.reset(),
      );

      const covering = computed(
        () => !isIndexView(route.path, route.query.view),
      );

      return () => {
        const repository = String(route.params.repository ?? "");
        return h(
          "div",
          {
            class: ["mmda-view", covering.value && "mmda-view--covering"],
            key: repository,
          },
          [
            h(
              "div",
              {
                class: "mmda-view__index",
                "aria-hidden": covering.value ? "true" : undefined,
              },
              [h(EntityIndexView)],
            ),
            covering.value
              ? h("div", { class: "mmda-view__one" }, [h(EntityOneView)])
              : null,
          ],
        );
      };
    },
  });

  const workspace = EntityWorkspace as typeof EntityWorkspace & {
    Index: typeof EntityIndexView;
    One: typeof EntityOneView;
  };
  workspace.Index = EntityIndexView;
  workspace.One = EntityOneView;
  return workspace;
}
