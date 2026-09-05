import {
  emptyPagedList,
  type EntitySearchParam,
  type MetaUiPack,
  type PagedList,
} from "@mmda/core";
import { createDefaultSearchParam } from "../ui_view";
import { writeStoredPageSize } from "../ui_theme";
import {
  defineComponent,
  getCurrentInstance,
  inject,
  onBeforeMount,
  ref,
  watch,
} from "vue";
import { rx, type Rx } from "../../rx";
import type { MmdaApplication } from "../ui_app";
import { UI_APP_KEY } from "../ui_keys";

/**
 * 实体选择器：拉元数据、分页检索，渲染交给 `$app.ui.factory`。
 */
export const UiSelector = defineComponent({
  name: "UiSelector",
  props: {
    repository: { type: String, required: true },
    service: String,
    searchWord: String,
    multiple: Boolean,
    height: String,
  },
  emits: ["selectionChange", "itemClick", "itemDoubleClick"],
  setup(props, { emit }) {
    const instance = getCurrentInstance();
    const app = (inject(UI_APP_KEY, null) ??
      instance?.appContext.config.globalProperties.$app) as MmdaApplication;
    const { meta, ui, api } = app;
    const { factory } = ui;

    const loading = ref(false);
    const error = ref("");
    const searchParam = rx<EntitySearchParam>(createDefaultSearchParam(props.searchWord));
    const model: Rx<PagedList<any>> = rx(emptyPagedList());
    const metadata = ref<MetaUiPack>();

    async function searchAll() {
      loading.value = true;
      error.value = "";
      try {
        const data = await api.searchAll(searchParam, {
          repository: props.repository,
          service: props.service,
        });
        Object.assign(model, data);
      } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
        console.error(e);
      } finally {
        loading.value = false;
      }
    }

    onBeforeMount(async () => {
      loading.value = true;
      try {
        metadata.value = await meta.getPack({
          repository: props.repository,
          service: props.service,
        });
      } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
        console.error(e);
      }
      await searchAll();
    });

    watch(
      () => [
        searchParam.searchWord,
        searchParam.pager.pageNo,
        searchParam.pager.pageSize,
      ],
      () => {
        if (metadata.value) void searchAll();
      },
    );

    return () => {
      const pack = metadata.value;
      if (!pack?.metaui)
        return factory.loading?.({ loading: loading.value }) ?? null;
      const halfCols = Math.max(
        1,
        Math.floor((factory.layout.maxCols || 12) / 2),
      );
      return factory.layout.column([
        factory.layout.row(
          [
            factory.paginator(model.pagination, {
              onPage(pager: { pageSize?: number; pageNo?: number }) {
                if (pager.pageSize) {
                  searchParam.pager.pageSize = pager.pageSize;
                  writeStoredPageSize(pager.pageSize);
                } else if (pager.pageNo) {
                  searchParam.pager.pageNo = pager.pageNo;
                }
              },
            }),
            factory.input(searchParam.searchWord ?? "", {
              onInput: (value: string) => {
                searchParam.searchWord = value;
              },
            }),
          ],
          [halfCols, halfCols],
          { justify: "space-between" },
        ),
        factory.list(model.list, pack.metaui, {
          selectionMode: props.multiple ? "multiple" : "single",
          itemKey: (item: any) => item.id,
          height: props.height ?? "48vh",
          loading: loading.value,
          onSelectionChange(selection: any[]) {
            emit("selectionChange", selection);
          },
          onItemClick(item: any) {
            emit("itemClick", item);
          },
          onItemDoubleClick(item: any) {
            emit("itemDoubleClick", item);
          },
        }),
      ]);
    };
  },
});
