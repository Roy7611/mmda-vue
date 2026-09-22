import { createElement, type ReactElement, type ReactNode } from "react";
import {
  CheckBoxComponent,
  ChipListComponent,
  RadioButtonComponent,
  SwitchComponent,
} from "@syncfusion/ej2-react-buttons";
import {
  ColorPickerComponent,
  MaskedTextBoxComponent,
  NumericTextBoxComponent,
  RatingComponent,
  SliderComponent,
} from "@syncfusion/ej2-react-inputs";
import {
  checkBoxListKeysAfterSelectAll,
  checkBoxListKeysAfterToggle,
  checkBoxListItemChecked,
  checkBoxListModifierClasses,
  checkBoxListSelectableOptions,
  checkBoxListShowSelectAll,
  checkBoxCheckedOf,
  checkBoxModifierClasses,
  chipsItemsOf,
  chipsKindOf,
  chipsModifierClasses,
  chipsSelectedKeysOf,
  colorPickerModifierClasses,
  maskedTextBoxModifierClasses,
  multiSelectBoundOf,
  multiSelectOptionKeyOf,
  multiSelectOptionLabelOf,
  multiSelectSelectedKeysOf,
  numberInputDecimalsOf,
  numberInputFormatOf,
  numberInputModifierClasses,
  numberInputStepOf,
  oneTimePasswordModifierClasses,
  radioButtonGroupItemSelected,
  radioButtonGroupItemsOf,
  radioButtonGroupModifierClasses,
  radioButtonGroupNameOf,
  ratingModifierClasses,
  resolveMultiSelectItems,
  sliderModifierClasses,
  switchCheckedOf,
  switchModifierClasses,
  textAreaAutoResizeOf,
  textAreaDisabledOf,
  textAreaMaxLengthOf,
  textAreaModifierClasses,
  textAreaReadOnlyOf,
  textAreaRowsOf,
  textAreaValueOf,
  toggleChipSelection,
  type UiCheckBoxListProps,
  type UiCheckBoxProps,
  type UiChipsProps,
  type UiColorPickerProps,
  type UiMaskedTextBoxProps,
  type UiNumberInputProps,
  type UiOneTimePasswordInputProps,
  type UiRadioButtonGroupProps,
  type UiRatingProps,
  type UiSliderProps,
  type UiSwitchProps,
  type UiTextAreaProps,
} from "@mmda/core";
import {
  el,
  joinClass,
  nativeDomProps,
  sfCssClass,
  sfHtmlAttributes,
} from "./utils";

export function createTextArea(props: UiTextAreaProps): ReactElement {
  return el("textarea", {
    ...nativeDomProps(props),
    className: joinClass("e-input", textAreaModifierClasses(props)),
    value: textAreaValueOf(props),
    placeholder: props.placeholder,
    disabled: textAreaDisabledOf(props),
    readOnly: textAreaReadOnlyOf(props),
    rows: textAreaRowsOf(props),
    maxLength: textAreaMaxLengthOf(props),
    onChange: (event: any) => props.onChange?.(event.target.value),
  });
}

export function createNumberInput(props: UiNumberInputProps): ReactElement {
  const decimals = numberInputDecimalsOf(props);
  const format = numberInputFormatOf(props);
  const step = numberInputStepOf(props);

  return createElement(NumericTextBoxComponent as any, {
    value: props.value ?? null,
    min: props.min,
    max: props.max,
    step,
    format,
    ...(decimals != null ? { decimals } : {}),
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
    showSpinButton: props.showSpinButton !== false,
    suffix: props.suffix,
    cssClass: sfCssClass(props, numberInputModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    change: (args: { value?: number | null }) =>
      props.onChange?.(args?.value ?? null),
  });
}

export function createCheckBox(props: UiCheckBoxProps): ReactElement {
  return createElement(CheckBoxComponent as any, {
    checked: checkBoxCheckedOf(props),
    label: props.label,
    disabled: props.disabled === true,
    cssClass: sfCssClass(props, checkBoxModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    change: (args: { checked?: boolean }) =>
      props.onChange?.(Boolean(args?.checked)),
  });
}

export function createSwitch(props: UiSwitchProps): ReactElement {
  return createElement(SwitchComponent as any, {
    checked: switchCheckedOf(props),
    onLabel: props.onLabel,
    offLabel: props.offLabel,
    disabled: props.disabled === true,
    cssClass: sfCssClass(props, switchModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    change: (args: { checked?: boolean }) =>
      props.onChange?.(Boolean(args?.checked)),
  });
}

export function createRadioButtonGroup(
  props: UiRadioButtonGroupProps,
): ReactElement {
  const options = radioButtonGroupItemsOf(props);
  const name = radioButtonGroupNameOf(props);

  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass(
        "mmda-radio-group",
        radioButtonGroupModifierClasses(props),
      ),
      role: "radiogroup",
    },
    ...options.map((option, index) =>
      createElement(RadioButtonComponent as any, {
        key: String(option.value ?? index),
        label: option.label,
        name,
        checked: radioButtonGroupItemSelected(props, option.value),
        disabled: props.disabled === true,
        cssClass: "e-radio mmda-radio",
        change: (args: { checked?: boolean }) => {
          if (args?.checked) props.onChange?.(option.value);
        },
      }),
    ),
  );
}

export function createCheckBoxList(props: UiCheckBoxListProps): ReactElement {
  const options = checkBoxListSelectableOptions(props);
  const selectedKeys = multiSelectSelectedKeysOf(props);

  const toggle = (item: unknown, checked: boolean): void => {
    const keys = checkBoxListKeysAfterToggle(props, item, checked);
    props.onChange?.(
      multiSelectBoundOf(resolveMultiSelectItems(keys, props), props),
    );
  };
  const toggleAll = (): void => {
    const keys = checkBoxListKeysAfterSelectAll(props);
    props.onChange?.(
      multiSelectBoundOf(resolveMultiSelectItems(keys, props), props),
    );
  };

  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass(
        "mmda-checkbox-list",
        checkBoxListModifierClasses(props),
      ),
    },
    checkBoxListShowSelectAll(props)
      ? createElement(CheckBoxComponent as any, {
          key: "__select_all__",
          label: props.selectAllLabel,
          checked: options.length > 0 && selectedKeys.length === options.length,
          disabled: props.disabled === true,
          change: () => toggleAll(),
        })
      : null,
    ...options.map((item, index) =>
      createElement(CheckBoxComponent as any, {
        key: String(multiSelectOptionKeyOf(item, props) ?? index),
        label: multiSelectOptionLabelOf(item, props),
        checked: checkBoxListItemChecked(props, item),
        disabled: props.disabled === true,
        change: (args: { checked?: boolean }) =>
          toggle(item, Boolean(args?.checked)),
      }),
    ),
  );
}

export function createBitCheckBoxList(
  props: UiCheckBoxListProps,
): ReactElement {
  return createCheckBoxList(props);
}

export function createMaskedTextBox(props: UiMaskedTextBoxProps): ReactElement {
  return createElement(MaskedTextBoxComponent as any, {
    value: props.value ?? "",
    mask: props.mask,
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
    promptChar: props.promptChar,
    cssClass: sfCssClass(props, maskedTextBoxModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    change: (args: { value?: string }) =>
      props.onChange?.(String(args?.value ?? "")),
  });
}

export function createOneTimePasswordInput(
  props: UiOneTimePasswordInputProps,
): ReactElement {
  const length = props.length ?? 4;
  const separator = props.separator ?? "";
  const value = String(props.value ?? "");
  const chars = value.split("");
  const emit = (text: string): void => props.onChange?.(text);
  const children: ReactNode[] = [];

  for (let index = 0; index < length; index += 1) {
    children.push(
      el("input", {
        key: index,
        type: props.type === "password" ? "password" : "text",
        inputMode: props.type === "number" ? "numeric" : undefined,
        className: "e-input mmda-otp__input",
        value: chars[index] ?? "",
        disabled: props.disabled === true,
        placeholder: props.placeholder?.charAt(index) ?? "",
        maxLength: 1,
        onChange: (event: any) => {
          const next = chars.slice();
          next[index] = String(event.target.value ?? "").slice(-1);
          emit(next.slice(0, length).join(""));
        },
      }),
    );
    if (index < length - 1 && separator) {
      children.push(
        el(
          "span",
          { key: `sep-${index}`, className: "mmda-otp__sep" },
          separator,
        ),
      );
    }
  }

  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass("mmda-otp", oneTimePasswordModifierClasses(props)),
      "data-length": length,
    },
    ...children,
  );
}

export function createColorPicker(props: UiColorPickerProps): ReactElement {
  return createElement(ColorPickerComponent as any, {
    value: props.value,
    mode: props.mode === "palette" ? "Palette" : "Picker",
    modeSwitcher: props.showModeSwitcher !== false,
    disabled: props.disabled === true,
    cssClass: sfCssClass(props, colorPickerModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    change: (args: { currentValue?: { hex?: string } }) =>
      props.onChange?.(args?.currentValue?.hex ?? ""),
  });
}

export function createSlider(props: UiSliderProps): ReactElement {
  const type =
    props.type === "Range"
      ? "Range"
      : props.type === "MinRange"
        ? "MinRange"
        : "Default";
  return createElement(SliderComponent as any, {
    value: props.value ?? undefined,
    min: props.min,
    max: props.max,
    step: props.step,
    type,
    disabled: props.disabled === true,
    cssClass: sfCssClass(props, sliderModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    change: (args: { value?: number | number[] }) =>
      props.onChange?.(args?.value ?? null),
  });
}

export function createRating(props: UiRatingProps<ReactNode>): ReactElement {
  return createElement(RatingComponent as any, {
    value: props.value ?? 0,
    itemsCount: props.itemsCount ?? 5,
    readOnly: props.readOnly === true || props.disabled === true,
    cssClass: sfCssClass(props, ratingModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    valueChanged: (args: { value?: number }) =>
      props.onChange?.(args?.value ?? null),
  });
}

export function createChips(props: UiChipsProps): ReactElement {
  const items = chipsItemsOf(props);
  const kind = chipsKindOf(props);
  const selection = kind === "choice" || kind === "filter" ? "Single" : "None";

  return createElement(ChipListComponent as any, {
    chips: items.map((item, index) => ({
      text: item.label,
      cssClass: item.outlined ? "e-outline" : undefined,
      leadingIconCss: item.icon,
      trailingIconCss: item.trailingIcon,
      avatarIconCss: item.avatarSrc,
      avatarText: item.avatarLabel,
      enabled: !item.disabled,
    })),
    selection,
    selectedChips: chipsSelectedKeysOf(props),
    enabled: props.disabled !== true,
    cssClass: sfCssClass(props, chipsModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    click: (args: { index?: number; chip?: { text?: string } }) => {
      const index = args?.index;
      if (index == null || !items[index]) return;
      if (kind === "action") {
        props.onClick?.(items[index], index);
        return;
      }
      props.onChange?.(toggleChipSelection(props, items[index], index));
    },
    delete: (args: { index?: number }) => {
      const index = args?.index;
      if (index != null && items[index]) props.onClick?.(items[index], index);
    },
  });
}
