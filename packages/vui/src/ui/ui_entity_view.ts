import {
  assignSearchParam,
  defineEntity,
  emptyPagedList,
  type Module,
} from "@mmda/core";
import {
  defineComponent,
  h,
  inject,
  onMounted,
  ref,
  shallowRef,
  watch,
  type Component,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { translateMessage } from "../i18n/i18n";
import type { MmdaApplication } from "./ui_app";
import { UiBuildContext } from "./ui_build_context";
import { UI_APP_KEY } from "./ui_keys";
import { GenericUiLogic, type UiLogic, type UiLogicInit } from "./ui_logic";
import {
  resolveSearchParam,
  resolveViewManyProps,
  UiViewMany,
  UiViewOne,
  type UiViewType,
} from "./ui_view";

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

export function createEntityView(options: EntityViewOptions) {
  return defineComponent({
    name: "EntityView",
    setup() {
      const app = inject(UI_APP_KEY)! as MmdaApplication;
      const route = useRoute();
      const router = useRouter();
      const current = shallowRef<UiBuildContext>();
      const error = shallowRef("");
      /** 菜单切换时立刻盖住旧页，避免整段 open() 完成前仍显示上一模块 */
      const pageLoading = ref(false);
      let openGeneration = 0;

      async function open() {
        const generation = ++openGeneration;
        error.value = "";
        pageLoading.value = true;
        current.value = undefined;
        try {
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
            options.resolveLogicToken?.(repository, service) ??
            `${repository}Logic`;
          let injected: UiLogic<any> | undefined;
          try {
            injected = await app.di.injectAsync<UiLogic<any>>(token);
          } catch {
            // Repository without a registered custom Logic uses the generic one.
          }
          if (generation !== openGeneration) return;

          const logic =
            injected ??
            (await options.createLogic(repository, init)) ??
            new GenericUiLogic(defineEntity, init);
          if (generation !== openGeneration) return;
          if (module) logic.module = module;

          const pack = await app.meta.getPack({
            repository,
            service,
          });
          if (generation !== openGeneration) return;
          if (!pack?.metaui) {
            throw new Error(
              translateMessage("invalid.repositoryMissing", { repository }),
            );
          }
          logic.meta = pack;

          const view = resolveEntityView(route.path, route.query.view);
          const many =
            view === UiViewMany.Index ||
            view === UiViewMany.SelectMany ||
            view === UiViewMany.SelectOne;
          const context = new UiBuildContext({
            model: many
              ? (emptyPagedList() as any)
              : ({ id: route.params.id } as any),
            metaui: pack.metaui,
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
          if (generation !== openGeneration) return;
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
        () => [route.path, route.params.id, route.query.view],
        (): void => void open().catch(showError),
      );

      return () => {
        if (error.value) {
          return h("p", { class: "mmda-prime-error" }, error.value);
        }
        if (pageLoading.value || !current.value) {
          return h(
            "div",
            {
              class: "mmda-entity-page-loading",
              role: "status",
              "aria-busy": "true",
              "aria-label": translateMessage("state.loading"),
            },
            [app.ui.buildLoading({} as any)],
          );
        }
        const context = current.value;
        // 订阅 loading：分页/筛选时刷新；表格同时接收 Ref 以便 Syncfusion 遮罩响应
        void context.loading.value;
        // 订阅子表 length：push/clear 不会改写属性引用，必须显式依赖才能重渲
        if (!context.many) {
          for (const group of context.metaui.groups) {
            if (!group.many) continue;
            const items = (context.model as Record<string, unknown>)[
              group.groupName
            ];
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
        return context.many
          ? app.ui.buildListView(context, {
              loading: context.loading,
              showToolbar: true,
              showSearchbar: true,
              selectionMode:
                context.view === UiViewMany.SelectOne ? "single" : "multiple",
              onItemDoubleClick: (item: any) =>
                router.push(`${route.path.replace(/\/$/, "")}/${item.id}`),
            })
          : app.ui.buildView(context, { showToolbar: true });
      };
    },
  });
}
