import { h, type VNode } from "vue";
import type { MetaUiField } from "@mmda/core";
import type { SearchForRelativeProps, VuiContext } from "@mmda/vui";
import Select from "primevue/select";

type SearchComboProps = SearchForRelativeProps & {
  showClear?: boolean;
  invalid?: boolean;
  onChange?: (value: any) => void;
  title?: string;
};

/**
 * HAS_ONE / 远程 REF 的可编辑 Select 联想控件（PrimeVue）。
 *
 * 皮肤专属渲染：vui 只提供 `factory.searchRelative` 的通用 chrome，
 * 这里实现厂商 Select 的属性映射与远程联想，供字段工厂 `searchBox` 使用。
 */
export function createSearchRelative(
  field: MetaUiField,
  context: VuiContext<any>,
  props: SearchComboProps,
): VNode {
  const reference = field.reference;
  const refFlds = reference?.refFlds?.length
    ? reference.refFlds
    : ["value", "text"];
  const valueKey = (props.dataKey as string) ?? refFlds[0] ?? "value";
  const labelKey =
    typeof props.optionLabel === "string"
      ? props.optionLabel
      : (refFlds[1] ?? valueKey);
  const options = (props.options as any[]) ?? [];

  const openPick = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      if (typeof props.toSearch === "function") {
        await props.toSearch(event);
        return;
      }
      await context.select(field);
    } catch (error) {
      console.error(error);
    }
  };

  // 对齐老 SearchBox：可编辑 Select，下拉图标换成放大镜并打开选择对话框
  return h(
    Select,
    {
      options,
      optionLabel:
        typeof props.optionLabel === "function"
          ? props.optionLabel
          : labelKey,
      dataKey: valueKey,
      modelValue: props.modelValue,
      editable: true,
      filter: true,
      showClear: props.showClear !== false && field.nullable,
      placeholder:
        props.placeholder ??
        context.translate?.("action.select") ??
        "请选择",
      invalid: props.invalid,
      class: "mmda-search-combo",
      "onUpdate:modelValue": (value: any) => props.onChange?.(value),
      onFilter: (event: any) => {
        const text = String(event?.value ?? "");
        props.onInput?.(text);
        void (context as any).searchRelative?.(field, text);
      },
      pt: {
        dropdown: {
          onClick: openPick,
          title: context.translate?.("action.search") ?? "搜索",
        },
      },
    },
    {
      dropdownicon: () => h("span", { class: "pi pi-search" }),
    },
  );
}
