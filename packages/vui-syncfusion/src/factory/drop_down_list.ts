import { h } from "vue";
import { DropDownListComponent } from "@syncfusion/ej2-vue-dropdowns";
import type { UiDropDownListProps, UiSelectOption } from "@mmda/core"
import { SELECT_DEBOUNCE_MS, SELECT_MIN_LENGTH, dropDownListModifierClasses, dropDownListValueOf, emitDropDownListChange, selectOptionsGrouped, selectOptionsHaveIcon, selectOptionsOf } from "@mmda/core"
import { htmlAttributesOf } from "@mmda/vui"

export function syncfusionSelectFields(options: UiSelectOption[]) {
  const fields: { value: string; text: string; groupBy?: string } = {
    value: "value",
    text: "label",
  };
  if (selectOptionsGrouped(options)) fields.groupBy = "group";
  return fields;
}

export function syncfusionSelectFiltering(
  props: UiDropDownListProps,
  options: UiSelectOption[],
) {
  const suggest = props.suggest;
  if (!suggest || props.allowFiltering === false) return undefined;
  const minLength = props.minLength ?? SELECT_MIN_LENGTH;
  return (args: any) => {
    args.preventDefaultAction = true;
    const query = String(args?.text ?? "");
    if (query.length < minLength) {
      args.updateData?.([]);
      return;
    }
    void Promise.resolve(suggest(query)).then((rows) => {
      args.updateData?.(
        (rows ?? []).map((item) =>
          typeof item === "string"
            ? { value: item, label: item }
            : item,
        ),
      );
    });
  };
}

export function syncfusionSelectItemTemplate(options: UiSelectOption[]) {
  if (!selectOptionsHaveIcon(options)) return undefined;
  return (data: UiSelectOption) =>
    h("span", { class: "mmda-dropdown-list__item" }, [
      data.icon
        ? h("span", { class: ["e-dd-icon", data.icon] })
        : null,
      data.label,
    ]);
}

export function createDropDownList(props: UiDropDownListProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    options: _options,
    placeholder,
    disabled,
    allowFiltering,
    suggest: _suggest,
    minLength: _minLength,
    debounceDelay,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const options = selectOptionsOf(props);
  const cssClass = dropDownListModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(DropDownListComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    value: dropDownListValueOf(props) ?? null,
    dataSource: options,
    fields: syncfusionSelectFields(options),
    placeholder,
    enabled: disabled !== true,
    allowFiltering: allowFiltering !== false,
    debounceDelay: debounceDelay ?? SELECT_DEBOUNCE_MS,
    cssClass,
    itemTemplate: syncfusionSelectItemTemplate(options),
    filtering: syncfusionSelectFiltering(props, options),
    change: (args: { value?: string | number | null }) => {
      emitDropDownListChange(props, args?.value ?? null);
    },
  });
}
