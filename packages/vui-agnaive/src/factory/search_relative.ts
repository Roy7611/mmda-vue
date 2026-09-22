import { h, type VNode } from "vue";
import type { MetaUiField } from "@mmda/core";
import type { SearchForRelativeProps, VuiContext } from "@mmda/vui";
import { NSelect } from "naive-ui";

type SearchComboProps = SearchForRelativeProps & {
  showClear?: boolean;
  invalid?: boolean;
  onChange?: (value: any) => void;
  title?: string;
};

/**
 * HAS_ONE / 远程 REF 的可编辑 Select 联想控件（Naive UI）。
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
  const rawOptions = ((props as { options?: any[] }).options as any[]) ?? [];
  const optionLabel = (props as { optionLabel?: string | ((row: any) => string) })
    .optionLabel;
  const labelOf = (option: any): string => {
    if (typeof optionLabel === "function") return String(optionLabel(option) ?? "");
    if (reference) return String(reference.labelOf(option) ?? "");
    if (typeof optionLabel === "string" && option && typeof option === "object") {
      return String(option[optionLabel] ?? "");
    }
    return option == null ? "" : String(option);
  };
  const valueOf = (option: any) =>
    reference ? reference.valueOf(option) : option;

  const selectOptions = rawOptions.map((option) => ({
    label: labelOf(option),
    value: valueOf(option),
  }));

  const current = (props as { modelValue?: any }).modelValue;
  const selectedValue =
    current != null && typeof current === "object"
      ? valueOf(current)
      : current === 0 || current === "0"
        ? null
        : current;

  // 当前值若不在 options 里，补一条以免 NSelect 只显示裸 id
  if (
    current != null &&
    typeof current === "object" &&
    selectedValue != null &&
    !selectOptions.some((item) => item.value === selectedValue)
  ) {
    selectOptions.unshift({ label: labelOf(current), value: selectedValue });
  }

  const openPick = async (event?: Event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    try {
      const toSearch = (props as { toSearch?: (event: Event) => Promise<any> })
        .toSearch;
      if (typeof toSearch === "function") {
        await toSearch(event as Event);
        return;
      }
      await context.select(field);
    } catch (error) {
      console.error(error);
    }
  };

  const emitChange = (value: any) => {
    const onChange = (props as { onChange?: (value: any) => void }).onChange;
    if (value == null || value === "") {
      onChange?.(null);
      return;
    }
    const matched =
      rawOptions.find((option) => valueOf(option) === value) ??
      (current != null &&
      typeof current === "object" &&
      valueOf(current) === value
        ? current
        : null);
    onChange?.(matched ?? null);
  };

  const searchTitle =
    context.translate?.("action.search") ??
    context.translate?.("action.select") ??
    "搜索";

  return h(
    NSelect,
    {
      options: selectOptions,
      value: selectedValue === 0 || selectedValue === "0" ? null : selectedValue,
      filterable: true,
      remote: true,
      clearable:
        (props as { showClear?: boolean }).showClear !== false &&
        field.nullable,
      placeholder:
        props.placeholder ??
        context.translate?.("action.select") ??
        "请选择",
      status: (props as { invalid?: boolean }).invalid ? "error" : undefined,
      class: "mmda-search-combo",
      "onUpdate:value": emitChange,
      onSearch: (text: string) => {
        (props as { onInput?: (value: string) => void }).onInput?.(text);
        void (context as any).searchRelative?.(field, text);
      },
    },
    {
      // 对齐老 SearchBox / SF / Prime：箭头换成放大镜，点击打开选择对话框
      arrow: () =>
        h("i", {
          class: "fas fa-search mmda-search-combo__pick",
          title: searchTitle,
          "aria-label": searchTitle,
          onMousedown: (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
          },
          onClick: (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            void openPick(event);
          },
        }),
    },
  );
}
