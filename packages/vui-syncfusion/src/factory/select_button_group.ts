import { h } from "vue";
import type { UiSelectButtonGroupProps } from "@mmda/core"
import { selectButtonGroupSelected, selectButtonOptionIcon, selectButtonOptionLabel, selectButtonOptionValue, toggleSelectButtonGroupValue } from "@mmda/core"
import { createIconVNode, selectButtonGroupUpdateOf } from "@mmda/vui"
import { createButtonGroup } from "./button_group";

let selectGroupSeq = 0;

export function createSelectButtonGroup(
  value: unknown,
  props: UiSelectButtonGroupProps = {},
  resolveIcon: (icon: string) => string = (icon) => icon,
) {
  const {
    options = [],
    optionLabel,
    optionValue,
    selectionMode,
    modelValue,
    onUpdate: _onUpdate,
    htmlAttributes,
    class: className,
    orientation,
    ...rest
  } = props;
  const current = modelValue ?? value;
  const emit = selectButtonGroupUpdateOf(props);
  const multiple = selectionMode === "multiple";
  const name = `mmda-select-button-group-${++selectGroupSeq}`;
  const nodes = options.flatMap((option, index) => {
    const itemValue = selectButtonOptionValue(option, optionValue);
    const itemLabel = selectButtonOptionLabel(option, optionLabel);
    const itemIcon = selectButtonOptionIcon(option);
    const id = `${name}-${index}`;
    const checked = selectButtonGroupSelected(
      current,
      itemValue,
      selectionMode,
    );
    return [
      h("input", {
        type: multiple ? "checkbox" : "radio",
        id,
        name: multiple ? undefined : name,
        value: itemValue == null ? undefined : String(itemValue),
        checked,
        onChange: (event: Event) => {
          const target = event.target as HTMLInputElement;
          if (multiple) {
            emit?.(
              toggleSelectButtonGroupValue(
                current,
                itemValue,
                "multiple",
              ),
            );
            return;
          }
          if (target.checked) emit?.(itemValue);
        },
      }),
      h(
        "label",
        {
          class: "e-btn",
          for: id,
          title: itemLabel,
          "aria-label": itemLabel,
        },
        itemIcon
          ? createIconVNode(resolveIcon(itemIcon), { "aria-hidden": "true" })
          : itemLabel,
      ),
    ];
  });
  return createButtonGroup(() => nodes, {
    ...rest,
    orientation,
    htmlAttributes,
    class: ["mmda-select-button-group", className].filter(Boolean),
  });
}
