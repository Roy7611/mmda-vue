import {
  assignSearchParam,
  defineEntity,
  emptyPagedList,
  type Module,
} from "@mmda/core";
import { defineComponent, h, inject, onMounted, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { createUiBuildContext } from "../context/create_context";
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

function resolveEntityView(
  app: MmdaApplication,
  path: string,
  queryView?: unknown,
): UiViewType {
  if (path.includes("/Create")) return UiViewOne.Create;
  if (path.includes("/Edit/")) return UiViewOne.Edit;
  if (queryView === UiViewMany.SelectMany) return UiViewMany.SelectMany;
  const parts = path.split("/").filter(Boolean);
  if (
    parts.length === 3 &&
    parts[0] === appRouteName(app) &&
    !["Create", "Edit"].includes(parts[1])
  ) {
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

      async function open() {
        error.value = "";
        const repository = String(route.params.repository ?? "");
        const module = resolveRepositoryModule(app, repository);
        const init: UiLogicInit = {
          service: app.meta,
          repository,
          router,
          module,
        };
        const token = `${repository}Logic`;
        const injected = (await Promise.resolve(
          app.di.tryInject(token),
        )) as UiLogic<any> | undefined;
        const logic =
          injected ??
          (await options.createLogic(repository, init)) ??
          new GenericUiLogic(defineEntity, init);
        if (module) logic.module = module;

        const pack = await app.meta.getPack({
          repository,
          service: app.name,
        });
        if (!pack?.metaui) {
          throw new Error(`未加载到仓库元数据：${repository}`);
        }
        logic.meta = pack;

        const view = resolveEntityView(app, route.path, route.query.view);
        const many =
          view === UiViewMany.Index ||
          view === UiViewMany.SelectMany ||
          view === UiViewMany.SelectOne;
        const context = createUiBuildContext({
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
        current.value = context;
      }

      const showError = (value: unknown) => {
        error.value = value instanceof Error ? value.message : String(value);
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
        const context = current.value;
        if (!context) return h("p", "加载中…");
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
        return context.many
          ? app.ui.buildListView(context, {
              loading: context.loading,
              showToolbar: true,
              showSearchbar: true,
              selectionMode:
                context.view === UiViewMany.SelectOne ? "single" : "multiple",
              onItemDoubleClick: (item: any) =>
                router.push(
                  `/${appRouteName(app)}/${route.params.repository}/${item.id}`,
                ),
            })
          : app.ui.buildView(context, { showToolbar: true });
      };
    },
  });
}
