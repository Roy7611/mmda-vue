import { h, type VNode } from "vue";
import { debounce, type MetaUiField } from "@mmda/core";
import type { SearchForRelativeProps, VueUiContext } from "@mmda/vui";
import { ComboBoxComponent } from "@syncfusion/ej2-vue-dropdowns";

type SearchComboProps = SearchForRelativeProps & {
  showClear?: boolean;
  invalid?: boolean;
  onChange?: (value: any) => void;
  valueField?: string;
  labelField?: string;
  title?: string;
};

/**
 * HAS_ONE / 远程 REF 的可编辑 ComboBox 联想控件（EJ2）。
 *
 * 皮肤专属渲染：vui 只提供 `factory.searchRelative` 的通用 chrome，
 * 这里实现厂商 ComboBox 的属性映射与远程联想，供字段工厂 `searchBox` 使用。
 */
export function createSearchRelative(
  field: MetaUiField,
  context: VueUiContext<any>,
  props: SearchComboProps,
): VNode {
  const p = props as SearchComboProps;
  const reference = field.reference;
  const refFlds = reference?.refFlds?.length
    ? reference.refFlds
    : ["value", "text"];
  // valueField / labelField = EJ2 fields.value / fields.text（属性名）
  const valueField =
    p.valueField ??
    (props.dataKey as string) ??
    refFlds[0] ??
    "value";
  const labelField =
    p.labelField ??
    (typeof props.optionLabel === "string" ? props.optionLabel : null) ??
    refFlds[1] ??
    valueField;
  const options = (props.options as any[]) ?? [];
  const current = props.modelValue;
  const selectedValue =
    current != null && typeof current === "object"
      ? (reference?.valueOf(current) ?? (current as any)?.[valueField])
      : typeof current === "object"
        ? null
        : current;

  /** 保证 options 上有 labelField，供 EJ2 fields.text 读取（元数据标签字段名可能与实体字段不完全一致）。 */
  const resolveLabel = (item: any): string => {
    if (item == null || typeof item !== "object") return "";
    const direct = item[labelField];
    if (direct != null && String(direct) !== "" && String(direct) !== "undefined") {
      return String(direct);
    }
    const fromRef = reference?.labelOf?.(item);
    if (fromRef != null && String(fromRef) !== "" && String(fromRef) !== "undefined") {
      return String(fromRef);
    }
    for (const key of [refFlds[1], "categoryName", "name", "label", "text"]) {
      if (!key) continue;
      const v = item[key];
      if (v != null && String(v) !== "" && String(v) !== "undefined") return String(v);
    }
    return "";
  };
  const withLabel = (item: any) => {
    if (!item || typeof item !== "object") return item;
    const label = resolveLabel(item);
    if (label && item[labelField] !== label) item[labelField] = label;
    return item;
  };

  const selectedText =
    current != null && typeof current === "object" ? resolveLabel(current) : "";

  const comboOptions = (
    current != null &&
    typeof current === "object" &&
    !options.some(
      (option) =>
        (reference?.valueOf(option) ?? option?.[valueField]) ===
        selectedValue,
    )
      ? [current, ...options]
      : options
  ).map(withLabel);

  let ej2: any = null;
  let pendingFilterArgs: any = null;

  // 输入联想：防抖后远程查选项，再回填 ComboBox 下拉（勿触发 Vue 重渲染）
  const runRemoteFilter = debounce(async (text: string) => {
    try {
      await (context as any).searchRelative?.(field, text);
    } catch (error) {
      console.error(error);
    }
    const next = (context.getFieldSearchOptions(field).selectOptions ?? []).map(
      withLabel,
    );
    try {
      pendingFilterArgs?.updateData?.(next);
      if (ej2 && !ej2.isDestroyed && Array.isArray(next)) {
        ej2.dataSource = next;
      }
    } catch (error) {
      console.error(error);
    }
  }, 400);

  const openPickDialog = async (event?: Event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    try {
      if (typeof props.toSearch === "function") {
        await props.toSearch(event as Event);
      } else {
        await context.select(field);
      }
    } catch (error) {
      console.error(error);
      context.uiBuilder?.toast?.(context as any, {
        severity: "error",
        title: context.translate?.("dialog.title.error") ?? "错误",
        message: error instanceof Error ? error.message : String(error),
        life: 3000,
      });
    }
  };

  /** 对齐老 SearchBox：下拉箭头换成放大镜，点击打开选择对话框（不是再挂一个按钮）。 */
  const bindSearchIcon = () => {
    const root =
      ej2?.inputWrapper?.container ??
      ej2?.overAllWrapper ??
      ej2?.element?.closest?.(".e-input-group") ??
      ej2?.element?.parentElement;
    const icon = root?.querySelector?.(
      ".e-input-group-icon.e-ddl-icon, .e-ddl-icon",
    ) as HTMLElement | null;
    if (!icon || icon.dataset.mmdaSearchBound === "1") return;
    icon.dataset.mmdaSearchBound = "1";
    icon.className = "e-input-group-icon e-icons e-search mmda-search-pick";
    icon.setAttribute(
      "title",
      context.translate?.("action.search") ?? "搜索",
    );
    icon.setAttribute("aria-label", icon.getAttribute("title") ?? "搜索");
    icon.addEventListener(
      "mousedown",
      (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        void openPickDialog(event);
      },
      true,
    );
  };

  const comboValue =
    selectedValue === 0 || selectedValue === "0" ? null : selectedValue;

  return h(
    ComboBoxComponent as any,
    {
      // 稳定 key：输入过滤时不能重挂，否则 EJ2 filtering 中途 vnode 被拆掉
      key: `mmda-search-${field.fieldName}`,
      dataSource: comboOptions,
      fields: { text: labelField, value: valueField },
      value: comboValue,
      text: selectedText || null,
      allowFiltering: true,
      allowCustom: false,
      showClearButton: p.showClear !== false && field.nullable,
      placeholder:
        props.placeholder ??
        context.translate?.("action.select") ??
        "请选择",
      cssClass: [
        "mmda-search-combo",
        p.invalid ? "e-error" : "",
      ]
        .filter(Boolean)
        .join(" "),
      ref: (comp: any) => {
        ej2 = comp?.ej2Instances ?? comp ?? null;
      },
      created: () => {
        queueMicrotask(bindSearchIcon);
        setTimeout(bindSearchIcon, 0);
      },
      filtering: (args: any) => {
        // 关闭本地过滤，改走远程 searchRelative（与老 AutoComplete 一致）
        args.preventDefaultAction = true;
        pendingFilterArgs = args;
        const text = String(args?.text ?? "").trim();
        if (!text) {
          args.updateData?.(
            (context.getFieldSearchOptions(field).selectOptions ?? []).map(
              withLabel,
            ),
          );
          return;
        }
        runRemoteFilter(text);
      },
      change: (args: any) => {
        const value = args?.value;
        // 优先用 selectOptions 完整对象，勿把 EJ2 残缺 itemData 写回模型
        const item =
          context
            .getFieldSearchOptions(field)
            .selectOptions.find(
              (option: any) =>
                (reference?.valueOf(option) ?? option?.[valueField]) ===
                value,
            ) ??
          (args?.itemData &&
          (reference?.valueOf(args.itemData) ??
            args.itemData?.[valueField]) != null
            ? args.itemData
            : null);
        p.onChange?.(item);
      },
    },
  );
}
