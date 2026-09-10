import { h } from "vue";
import type { UiCheckBoxListProps } from '@mmda/core';
import { checkBoxListAllChecked, checkBoxListIndeterminate, checkBoxListItemChecked, checkBoxListModifierClasses, checkBoxListSelectableOptions, checkBoxListShowSelectAll, multiSelectOptionLabelOf, withMultiSelectBindMode } from "@mmda/core"
import { emitCheckBoxListSelectAll, emitCheckBoxListToggle } from "@mmda/vui"
import { htmlAttributesOf } from "@mmda/vui"
import { createCheckBox } from "./checkbox";

export function createCheckBoxList(props: UiCheckBoxListProps) {
  const list: UiCheckBoxListProps = {
    ...props,
    bindMode: props.bindMode ?? "value_array",
  };
  const all = checkBoxListShowSelectAll(list)
    ? h(
        "div",
        { class: "mmda-checkbox-list__all" },
        [
          createCheckBox({
            checked: checkBoxListAllChecked(list),
            indeterminate: checkBoxListIndeterminate(list),
            label: list.selectAllLabel,
            disabled: list.disabled,
            onChange: () => emitCheckBoxListSelectAll(list),
          }),
        ],
      )
    : null;
  const items = checkBoxListSelectableOptions(list).map((item) =>
    createCheckBox({
      checked: checkBoxListItemChecked(list, item),
      label: multiSelectOptionLabelOf(item, list),
      disabled: list.disabled,
      onChange: (checked) => emitCheckBoxListToggle(list, item, checked),
    }),
  );
  return h(
    "div",
    {
      ...htmlAttributesOf(list),
      class: [...checkBoxListModifierClasses(list)].flat(),
    },
    [
      all,
      h("div", { class: "mmda-checkbox-list__items" }, items),
    ],
  );
}

export function createBitCheckBoxList(props: UiCheckBoxListProps) {
  return createCheckBoxList(withMultiSelectBindMode(props, "or_bits"));
}
