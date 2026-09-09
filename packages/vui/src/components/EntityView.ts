import {
  assignSearchParam,
  defineEntity,
  emptyPagedList,
  type MmdaApplication,
  type Module,
} from "@mmda/core";
import {
  defineComponent,
  h,
  inject,
  KeepAlive,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  provide,
  ref,
  shallowRef,
  watch,
  nextTick,
  type Component,
} from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { translateMessage } from "../i18n/i18n";
import type { MmdaVueApp } from "../app/app";
import type { VueUiBuilder } from "../ui/builder/builder";
import { VueUiContext } from "../contexts/vue_ui_context";
import { UI_APP_KEY } from "../app/keys";
import { GenericUiLogic, type UiLogic, type UiLogicInit } from "../logic/logic";
import {
  resolveSearchParam,
  resolveViewManyProps,
  UiViewMany,
  UiViewManyKind,
  UiViewOne,
  type UiViewType,
} from "../contexts/view";
import {
  createModuleContext,
  MODULE_CONTEXT_KEY,
  bindModuleContext,
} from "../contexts/module_context";

export interface EntityViewOptions {
  createLogic: (
    repository: string,
    init: UiLogicInit,
  ) => UiLogic<any> | undefined | Promise<UiLogic<any> | undefined>;
  resolveService?: (path: string) => string;
  resolveLogicToken?: (repository: string, service: string) => string;
  resolveModule?: (
    app: MmdaApplication,
    repository: string,
    path: string,
  ) => Module | undefined;
  resolveCustomView?: (
    repository: string,
    service: string,
  ) => Component | undefined;
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

function isCategoryListView(context: VueUiContext) {
  const view = String(context.view ?? "");
  const option =
    context.logic?.viewOptions?.[view as UiViewType]?.(context as any) ?? {};
  const kind = (option as { viewKind?: string }).viewKind;
  return Boolean(
    (option as { treeOption?: unknown }).treeOption ||
      (option as { tree?: unknown }).tree ||
      kind === UiViewManyKind.categoryList ||
      kind === "categoryList",
  );
}

function renderEntityPage(
  app: MmdaVueApp,
  context: VueUiContext,
  options: EntityViewOptions,
  route: ReturnType<typeof useRoute>,
) {
  if (!isCategoryListView(context)) void context.loading.value;
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
  const CustomView = options.resolveCustomView?.(
    String(route.params.repository ?? ""),
    options.resolveService?.(route.path) ?? app.name,
  );
  if (CustomView && context.many) {
    return h(CustomView, { ctx: context });
  }
  if (!context.many) {
    return (app.ui as VueUiBuilder).build(context, { showToolbar: true });
  }
  return (app.ui as VueUiBuilder).build(context, {
    loading: context.loading,
    showToolbar: true,
    showSearchbar: true,
    selectionMode:
      context.view === UiViewMany.SelectOne ? "single" : "multiple",
    onItemDoubleClick: (item: any) => {
      context.details?.(item);
    },
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
    [(app.ui as VueUiBuilder).factory.loading()],
  );
}

async function openEntityContext(
  options: EntityViewOptions,
  app: MmdaVueApp,
  route: ReturnType<typeof useRoute>,
  router: ReturnType<typeof useRouter>,
  viewOverride?: UiViewType,
): Promise<VueUiContext> {
  const repository = String(route.params.repository ?? "");
  const service = options.resolveService?.(route.path) ?? app.name;
  const module =
    options.resolveModule?.(app, repository, route.path) ??
    app.findModule(route.path) ??
    resolveRepositoryModule(app, repository);
  const init: UiLogicInit = {
    metaUiService: app.meta,
    repository,
    router,
    module,
    apiService: service,
  };
  const token =
    options.resolveLogicToken?.(repository, service) ?? `${repository}Logic`;
  let injected: UiLogic<any> | undefined;
  try {
    injected = await app.di.injectAsync<UiLogic<any>>(token);
  } catch {
    // Repository without a registered custom Logic uses the generic one.
  }

  const logic =
    injected ??
    (await options.createLogic(repository, init)) ??
    new GenericUiLogic(defineEntity, init);
  if (module) logic.module = module;

  const pack = await app.meta.getPack({ repository, service });
  if (!pack?.metaUi) {
    throw new Error(
      translateMessage("invalid.repositoryMissing", { repository }),
    );
  }
  logic.meta = pack;

  const view = viewOverride ?? resolveEntityView(route.path, route.query.view);
  const many =
    view === UiViewMany.Index ||
    view === UiViewMany.SelectMany ||
    view === UiViewMany.SelectOne;
  const context = new VueUiContext({
    model: many
      ? (emptyPagedList() as any)
      : ({ id: route.params.id } as any),
    metaUi: pack.metaUi,
    view,
    logic,
    app,
  });
  if (many) {
    assignSearchParam(
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
 * 同模块 CRUD：父工作区 KeepAlive 只缓存 Index；Create/Edit/Details 为 One。
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
      const current = shallowRef<VueUiContext>();
      const error = shallowRef("");
      const pageLoading = ref(false);
      let openGeneration = 0;

      async function open() {
        const generation = ++openGeneration;
        error.value = "";
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
        error.value = value instanceof Error ? value.message : String(value);
        pageLoading.value = false;
      };

      onMounted((): void => void open().catch(showError));
      // 仅 query.view（如 selectMany）变化时重建；path/id 由 KeepAlive 保活，不重开
      watch(
        () => route.query.view,
        (next, prev) => {
          if (next === prev) return;
          void open().catch(showError);
        },
      );
      onDeactivated(() => {
        sync?.saveScroll();
      });
      onActivated(() => {
        void (async () => {
          if (sync?.consumeNeedsSearch() && current.value) {
            try {
              await current.value.search?.();
            } catch (error) {
              showError(error);
            }
          }
          sync?.flushVisual();
          await nextTick();
          // 虚拟滚动：先 reveal（内部会归零再滚）；再延迟一次兜底
          sync?.revealCurrent();
          requestAnimationFrame(() => sync?.revealCurrent());
          window.setTimeout(() => sync?.revealCurrent(), 50);
        })();
      });
      onUnmounted(() => {
        if (current.value) sync?.unregisterIndex(current.value);
      });

      return () => {
        if (error.value) {
          return h("p", { class: "mmda-prime-error" }, error.value);
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
      const current = shallowRef<VueUiContext>();
      const error = shallowRef("");
      const pageLoading = ref(false);
      let openGeneration = 0;

      async function open() {
        const generation = ++openGeneration;
        error.value = "";
        pageLoading.value = true;
        current.value = undefined;
        try {
          const context = await openEntityContext(options, app, route, router);
          if (generation !== openGeneration) return;
          bindModuleContext(context, sync);
          current.value = context;
        } finally {
          if (generation === openGeneration) pageLoading.value = false;
        }
      }

      const showError = (value: unknown) => {
        error.value = value instanceof Error ? value.message : String(value);
        pageLoading.value = false;
      };

      onMounted((): void => void open().catch(showError));
      watch(
        () => [route.path, route.params.id],
        (): void => void open().catch(showError),
      );

      return () => {
        if (error.value) {
          return h("p", { class: "mmda-prime-error" }, error.value);
        }
        if (pageLoading.value || !current.value) {
          return loadingNode(app);
        }
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

      return () => {
        const repository = String(route.params.repository ?? "");
        return h(RouterView, null, {
          default: ({ Component }: { Component?: Component }) =>
            h(
              KeepAlive,
              { include: "EntityIndexView", max: 1 },
              {
                default: () =>
                  Component ? h(Component, { key: repository }) : null,
              },
            ),
        });
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
