import { h, type Component, type VNode } from "vue";
import { MetaModel, SqlDataType, type MetaUiField, type Module, type UiAvatarProps } from "@mmda/core";
import { autoCompleteBindValue, autoCompletePropsFromField, avatarPropsFromField, checkBoxPropsFromField, switchPropsFromField, numberInputPropsFromField, textAreaPropsFromField, textInputPropsFromField, progressBarPropsFromField, signaturePadPropsFromField, stepperPropsFromField, datePickerPropsFromField, dateRangePickerPropsFromField, dateTimePickerPropsFromField, monthPickerPropsFromField, timePickerPropsFromField, comboBoxPropsFromField, dropDownListPropsFromField, radioButtonGroupPropsFromField, multiSelectPropsFromField, multiItemSelectPropsFromField, multiValueSelectPropsFromField, multiTextSelectPropsFromField, multiBitSelectPropsFromField, checkBoxListPropsFromField, bitCheckBoxListPropsFromField, tagAutoCompletePropsFromField, routeAutoCompleteField } from "@mmda/core"
import { colorPickerPropsFromField, maskedTextBoxPropsFromField, timelinePropsFromField, timelineSqlOf, relativeTime as relativeTimeView, oneTimePasswordPropsFromField, sliderPropsFromField, ratingPropsFromField, MOBILE_MASK, ZIP_MASK, treeSelectPropsFromField, chipsPropsFromField, bitChipSetPropsFromField, enumChipSetPropsFromField, cleanProps, fasIcon, TABLE_CELL_PROP_KEYS, type UiProps, type UiFieldFactory, type VueUiContext } from "@mmda/vui"
import { createAutoComplete } from "./factory/autocomplete";
import { createCheckBox } from "./factory/checkbox";
import { createSwitch } from "./factory/switch";
import { createColorPicker } from "./factory/color_picker";
import { createMaskedTextBox } from "./factory/masked_text_box";
import { createOneTimePasswordInput } from "./factory/one_time_password_input";
import { createSlider } from "./factory/slider";
import { createRating } from "./factory/rating";
import { createNumberInput } from "./factory/number_input";
import { createTextArea } from "./factory/text_area";
import { createTextInput } from "./factory/text_input";
import { createProgressBar } from "./factory/progress_bar";
import { createSignaturePad } from "./factory/signature_pad";
import { createStepper } from "./factory/stepper";
import { createTimeline } from "./factory/timeline";
import { createDatePicker } from "./factory/date_picker";
import { createDateTimePicker } from "./factory/date_time_picker";
import { createTimePicker } from "./factory/time_picker";
import { createDateRangePicker } from "./factory/date_range_picker";
import { createComboBox } from "./factory/combo_box";
import { createDropDownList } from "./factory/drop_down_list";
import { createRadioButtonGroup } from "./factory/radio_button_group";
import {
  createMultiBitSelect,
  createMultiItemSelect,
  createMultiSelect,
  createMultiTextSelect,
  createMultiValueSelect,
} from "./factory/multi_select";
import { createBitCheckBoxList, createCheckBoxList } from "./factory/check_box_list";
import { createTagAutoComplete } from "./factory/tag_auto_complete";
import { createTreeSelect } from "./factory/tree_select";
import { createSearchRelative } from "./factory/search_relative";
import { createAvatar } from "./factory/avatar";
import { createChips } from "./factory/chips";
import { NImage, NInput, NTag } from "naive-ui";
import { renderFileLinkField, renderFileUploaderField, renderFilesUploaderField, renderImageUploaderField, renderImagesUploaderField, renderInplaceFieldEditor } from "@mmda/vui"

type UiContext = VueUiContext<any>;

const update = (field: MetaUiField, context: UiContext) => (value: any) =>
  context.setFieldValue(field, value);

const invalidOf = (field: MetaUiField, context: UiContext) =>
  Boolean(context.isInvalid?.(field));

const control = (
  component: Component,
  field: MetaUiField,
  context: UiContext,
  props: UiProps = {},
  valueKey = "value",
) => {
  const invalid = invalidOf(field, context);
  const onUpdate = update(field, context);
  return h(
    "div",
    { class: ["mmda-control", invalid && "is-invalid"] },
    [
      h(component, {
        id: field.fieldName,
        name: field.fieldName,
        [valueKey]: context.getFieldValue(field),
        disabled: context.isFieldReadonly(field),
        status: invalid ? "error" : undefined,
        placeholder: field.placeholder,
        maxlength: field.maxLength,
        [`onUpdate:${valueKey}`]: onUpdate,
        ...props,
      }),
      invalid &&
        h(
          "p",
          { class: "mmda-error" },
          context.getInvalidMessage?.(field),
        ),
    ],
  );
};

const textInput = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  wrapChrome(
    field,
    context,
    createTextInput(textInputPropsFromField(field, context)),
  );

const textArea = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  wrapChrome(
    field,
    context,
    createTextArea(
      textAreaPropsFromField(field, context, {
        rows: 3,
        resizeMode: "Vertical",
        autoResize: true,
        ...props,
      }),
    ),
  );

const password = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  control(NInput, field, context, props, {
    type: "password",
    showPasswordOn: "click",
  });

const dropDownList = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h(
    "div",
    { class: ["mmda-control", invalid && "is-invalid"] },
    [
      createDropDownList(
        dropDownListPropsFromField(field, context),
      ),
      invalid &&
        h(
          "p",
          { class: "mmda-error" },
          context.getInvalidMessage?.(field),
        ),
    ],
  );
};

const radioButtonGroup = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h(
    "div",
    { class: ["mmda-control", invalid && "is-invalid"] },
    [
      createRadioButtonGroup(
        radioButtonGroupPropsFromField(field, context),
      ),
      invalid &&
        h(
          "p",
          { class: "mmda-error" },
          context.getInvalidMessage?.(field),
        ),
    ],
  );
};

const treeSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h(
    "div",
    { class: ["mmda-control", invalid && "is-invalid"] },
    [
      createTreeSelect(treeSelectPropsFromField(field, context)),
      invalid &&
        h(
          "p",
          { class: "mmda-error" },
          context.getInvalidMessage?.(field),
        ),
    ],
  );
};

const comboBox = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h(
    "div",
    { class: ["mmda-control", invalid && "is-invalid"] },
    [
      createComboBox(comboBoxPropsFromField(field, context)),
      invalid &&
        h(
          "p",
          { class: "mmda-error" },
          context.getInvalidMessage?.(field),
        ),
    ],
  );
};

const multiSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createMultiSelect(
      multiSelectPropsFromField(field, context),
    ),
  );

const multiItemSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createMultiItemSelect(
      multiItemSelectPropsFromField(field, context),
    ),
  );

const multiValueSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createMultiValueSelect(
      multiValueSelectPropsFromField(field, context),
    ),
  );

const multiTextSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createMultiTextSelect(
      multiTextSelectPropsFromField(field, context),
    ),
  );

const multiBitSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createMultiBitSelect(
      multiBitSelectPropsFromField(field, context),
    ),
  );

const checkBoxList = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createCheckBoxList(
      checkBoxListPropsFromField(field, context),
    ),
  );

const bitCheckBoxListField = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createBitCheckBoxList(
      bitCheckBoxListPropsFromField(field, context),
    ),
  );

const tagAutoComplete = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  return wrapChrome(
    field,
    context,
    createTagAutoComplete(tagAutoCompletePropsFromField(
      field,
      context,
      props ?? {},
    )),
  );
};

const numberInput = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createNumberInput(
      numberInputPropsFromField(field, context),
    ),
  );

const percentInput = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createNumberInput(
      numberInputPropsFromField(field, context, {
        kind: "percent",
        min: 0,
        max: 100,
        ...props,
      }),
    ),
  );

const checkbox = (field: MetaUiField, context: UiContext, props?: UiProps) => {
  const invalid = invalidOf(field, context);
  return h(
    "div",
    { class: ["mmda-control", invalid && "is-invalid"] },
    [
      createCheckBox(checkBoxPropsFromField(field, context)),
      invalid &&
        h(
          "p",
          { class: "mmda-error" },
          context.getInvalidMessage?.(field),
        ),
    ],
  );
};

const switchControl = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h(
    "div",
    { class: ["mmda-control", invalid && "is-invalid"] },
    [
      createSwitch(switchPropsFromField(field, context)),
      invalid &&
        h(
          "p",
          { class: "mmda-error" },
          context.getInvalidMessage?.(field),
        ),
    ],
  );
};

function wrapChrome(
  field: MetaUiField,
  context: UiContext,
  child: VNode,
) {
  const invalid = invalidOf(field, context);
  return h(
    "div",
    { class: ["mmda-control", invalid && "is-invalid"] },
    [
      child,
      invalid &&
        h(
          "p",
          { class: "mmda-error" },
          context.getInvalidMessage?.(field),
        ),
    ],
  );
};

const datePicker = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  wrapChrome(
    field,
    context,
    createDatePicker(datePickerPropsFromField(field, context)),
  );

const dateTimePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createDateTimePicker(
      dateTimePickerPropsFromField(field, context),
    ),
  );

const monthPicker = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createDatePicker(monthPickerPropsFromField(field, context)),
  );

const timePicker = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  wrapChrome(
    field,
    context,
    createTimePicker(timePickerPropsFromField(field, context)),
  );

const fallbackDisplay = (
  field: MetaUiField,
  context: UiContext,
  props: UiProps = {},
) =>
  h(
    "output",
    { class: "mmda-display", ...props },
    String(context.displayField(field, props.row) ?? ""),
  );

const fallbackInput = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
): VNode => {
  if (
    field.reference &&
    (field.reference.hasOne ||
      (field.reference.isRef && field.reference.refRepository))
  ) {
    return searchBox(field, context);
  }
  if (field.reference?.refOptions?.length)
    return dropDownList(field, context);
  if (SqlDataType.isBool(field.dataType))
    return checkbox(field, context);
  if (SqlDataType.isNum(field.dataType))
    return numberInput(field, context);
  if (SqlDataType.isDate(field.dataType))
    return datePicker(field, context);
  return textInput(field, context);
};

const searchBox = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
): VNode => {
  const reference = field.reference;
  if (!reference) {
    return h("span", { class: "warning" }, "不是引用字段");
  }
  const valueKey = reference.refFlds?.[0] ?? "value";
  const labelKey = reference.refFlds?.[1] ?? valueKey;
  const fldOptions = context.getFieldSearchOptions(field);
  let fieldValue = (context.model as Record<string, unknown>)[field.fieldName]
    ? context.getFieldValue(field)
    : null;
  if (
    fieldValue &&
    typeof fieldValue === "object" &&
    (fieldValue as Record<string, unknown>)[valueKey] == 0
  ) {
    fieldValue = null;
  }
  if (fieldValue && typeof fieldValue === "object") {
    const key = reference.valueOf(fieldValue);
    if (
      !fldOptions.selectOptions.some((item) => reference.valueOf(item) === key)
    ) {
      fldOptions.selectOptions.unshift(fieldValue);
    }
    fldOptions.currentSelectOption = fieldValue;
  }
  return createSearchRelative(field, context, {
    modelValue: fldOptions.currentSelectOption ?? fieldValue,
    showClear: Boolean(fldOptions.currentSelectOption ?? fieldValue),
    options: fldOptions.selectOptions,
    title: props?.title ?? field.displayLabel,
    dataKey: valueKey,
    optionLabel:
      reference.refFlds.length > 2
        ? (data: any) => reference.labelOf(data)
        : labelKey,
    invalid: invalidOf(field, context),
    onChange: (value: any) => {
      fldOptions.currentSelectOption = value || null;
      context.setFieldValue(field, value || null);
      if (!value) {
        const model = context.model as Record<string, any>;
        MetaModel.setRefProp(model, field.fieldName, null);
        reference.refFlds.forEach((rf, index) => {
          if (index > 0) MetaModel.delCustomProp(model, rf);
        });
        if (reference.hasOne && reference.alias) model[reference.alias] = null;
      }
    },
    onInput: (value: string) => {
      if (fldOptions.isComposing) return;
      void context.searchRelative(field, value);
    },
    toSearch: async () => {
      const picked = await context.select(field);
      if (picked) fldOptions.currentSelectOption = picked;
      return true;
    },
    ...props,
  });
};

const autoComplete = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
): VNode => {
  const route = routeAutoCompleteField(field);
  if (route === "dropDownList") return dropDownList(field, context);
  if (route === "searchBox") return searchBox(field, context);
  const invalid = invalidOf(field, context);
  const reference = field.reference?.isRef ? field.reference : undefined;
  return h(
    "div",
    { class: ["mmda-control", invalid && "is-invalid"] },
    [
      createAutoComplete({
        value: autoCompleteBindValue(context.getFieldValue(field), { reference }),
        ...autoCompletePropsFromField(field, props ?? {}),
        disabled: context.isFieldReadonly(field),
        onUpdate: update(field, context),
      }),
      invalid &&
        h(
          "p",
          { class: "mmda-error" },
          context.getInvalidMessage?.(field),
        ),
    ],
  );
};

const tag = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  h(
    NTag,
    { ...props },
    { default: () => context.displayField(field, props?.row) },
  );

const tags = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  createChips(chipsPropsFromField(field, context));

const chips = tags;

const bitChipSet = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  createChips(bitChipSetPropsFromField(field, context));

const enumChipSet = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  createChips(enumChipSetPropsFromField(field, context));

const cellDomProps = (props?: UiProps) =>
  cleanProps(TABLE_CELL_PROP_KEYS, props ?? {});

const externalLink = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  const app = context.app;
  if (!app) return fallbackDisplay(field, context);
  const model = (props?.row ?? context.model) as Record<string, any>;
  const alias = field.reference?.alias;
  const fldVal = model[field.fieldName] ?? (alias ? model[alias] : undefined);
  if (!fldVal) return fallbackDisplay(field, context);
  const fldText = MetaModel.displayField(model, field);
  const domProps = cellDomProps(props);
  if (!fldText) {
    return h(
      "span",
      { class: "warning", name: field.fieldName, ...domProps },
      "N/A",
    );
  }
  const linkable = props?.isSearch ? false : (props?.linkable ?? true);
  const reference = field.reference;
  if (!reference) {
    return h("span", { name: field.fieldName, ...domProps }, fldText);
  }
  const { modules = [] } = app;
  const systemList: Module[] = app.state.systemList ?? [];
  const api = context.logic?.apiClient ?? app.api;
  const isCurrentSystem =
    !reference.refDbName || reference.refDbName === api?.config.service;
  const refMainModule = isCurrentSystem
    ? modules.find((module: Module) =>
        module?.subModules?.some(
          (subModule: Module) => subModule.objName === reference.refObjName,
        ),
      )
    : systemList.find((system) => system.service === reference.refDbName);
  const refModule = refMainModule?.subModules?.find(
    (subModule: Module) => subModule.objName === reference.refObjName,
  );
  const readable = isCurrentSystem
    ? Boolean(refModule?.authority?.allowRead)
    : Boolean(refMainModule?.authority?.allowRead);
  if (!linkable || !readable) {
    return h("span", { name: field.fieldName, ...domProps }, fldText);
  }
  return h(
    "div",
    {
      class: "flex_item_center",
      role: "mmda-external-link",
      id: field.fieldName,
      ...domProps,
    },
    [
      fasIcon("external-link", {
        style: { marginRight: "5px", cursor: "pointer" },
        onClick: (event: Event) => {
          event.stopPropagation();
          void (async () => {
            await context.app?.syncAuthState?.();
            const url = context.routeToRelative?.(field, model);
            if (url) window.open(url, "_blank", "noopener,noreferrer");
          })();
        },
      }),
      h("span", fldText),
    ],
  );
};

const factory: UiFieldFactory = {
  fallbackDisplay,
  fallbackInput,
  textInput,
  textArea,
  password,
  dropDownList,
  select: dropDownList,
  radioButtonGroup,
  multiSelect,
  multiItemSelect,
  multiValueSelect,
  multiTextSelect,
  multiBitSelect,
  checkBoxList,
  bitCheckBoxList: bitCheckBoxListField,
  numberInput,
  positiveNumberInput: (field, context) =>
    numberInput(field, context, { min: 0, ...props }),
  negativenumberInput: (field, context) =>
    numberInput(field, context, { max: 0, ...props }),
  percentInput,
  checkBox: checkbox,
  switch: switchControl,
  Switcher: switchControl,
  switcher: switchControl,
  datePicker,
  dateTimePicker,
  monthPicker,
  timePicker,
  dateRangePicker: (field, context) =>
    wrapChrome(
      field,
      context,
      createDateRangePicker(
        dateRangePickerPropsFromField(field, context),
      ),
    ),
  maskedTextBox: (field, context) =>
    wrapChrome(
      field,
      context,
      createMaskedTextBox(
        maskedTextBoxPropsFromField(field, context),
      ),
    ),
  oneTimePasswordInput: (field, context) =>
    wrapChrome(
      field,
      context,
      createOneTimePasswordInput(
        oneTimePasswordPropsFromField(field, context),
      ),
    ),
  mobileInput: (field, context) =>
    wrapChrome(
      field,
      context,
      createMaskedTextBox(
        maskedTextBoxPropsFromField(field, context, {
          ...props,
          mask: MOBILE_MASK,
        }),
      ),
    ),
  zipCodeInput: (field, context) =>
    wrapChrome(
      field,
      context,
      createMaskedTextBox(
        maskedTextBoxPropsFromField(field, context, {
          ...props,
          mask: ZIP_MASK,
        }),
      ),
    ),
  slider: (field, context) =>
    wrapChrome(
      field,
      context,
      createSlider(sliderPropsFromField(field, context)),
    ),
  rating: (field, context) =>
    wrapChrome(
      field,
      context,
      createRating(ratingPropsFromField(field, context)),
    ),
  colorPicker: (field, context) => {
    const invalid = invalidOf(field, context);
    return h(
      "div",
      { class: ["mmda-control", invalid && "is-invalid"] },
      [
        createColorPicker(
          colorPickerPropsFromField(field, context),
        ),
        invalid &&
          h(
            "p",
            { class: "mmda-error" },
            context.getInvalidMessage?.(field),
          ),
      ],
    );
  },
  filePicker: (field, context) =>
    renderFileUploaderField(field, context as any, props ?? {}),
  fileUpload: (field, context) =>
    renderFilesUploaderField(field, context as any, props ?? {}),
  fileUploader: (field, context) =>
    renderFileUploaderField(field, context as any, props ?? {}),
  filesUploader: (field, context) =>
    renderFilesUploaderField(field, context as any, props ?? {}),
  imagePicker: (field, context) =>
    renderImageUploaderField(field, context as any, props ?? {}),
  imageUploader: (field, context) =>
    renderImageUploaderField(field, context as any, props ?? {}),
  imagesUploader: (field, context) =>
    renderImagesUploaderField(field, context as any, props ?? {}),
  image: (field, context) =>
    h(NImage, { src: context.getFieldValue(field, props?.row), ...props }),
  avatar: (field, context, props?: UiProps) => {
    const cell = props as UiAvatarProps | undefined;
    const avatarProps: UiAvatarProps = {
      ...avatarPropsFromField(field, context),
      ...(cell ? { size: cell.size ?? 'small' } : {}),
    };
    const render = (context as any).uiBuilder?.factory?.avatar;
    if (render) return render(avatarProps);
    return createAvatar(
      avatarProps,
      (name) =>
        context.uiBuilder?.factory?.resolveIcon?.(name) ?? name,
    );
  },
  progressBar: (field, context) =>
    createProgressBar(progressBarPropsFromField(field, context)),
  signaturePad: (field, context) =>
    wrapChrome(
      field,
      context,
      createSignaturePad(
        signaturePadPropsFromField(field, context),
      ),
    ),
  stepper: (field, context) =>
    wrapChrome(
      field,
      context,
      createStepper(stepperPropsFromField(field, context)),
    ),
  timeline: (field, context) =>
    wrapChrome(
      field,
      context,
      (context.uiBuilder?.factory?.timeline ?? createTimeline)(
        timelinePropsFromField(field, context),
      ),
    ),
  relativeTime: (field, context) =>
    relativeTimeView(
      timelineSqlOf(context.getFieldValue(field, props?.row)) ?? "",
      { locale: context.locale },
    ),
  tag,
  tags,
  chips,
  bitChipSet,
  enumChipSet,
  fileLink: (field, context) =>
    renderFileLinkField(field, context as any, props ?? {}),
  externalLink,
  textSpan: fallbackDisplay,
  span: fallbackDisplay,
  multilineText: (field, context) =>
    h(
      "span",
      { style: { whiteSpace: "pre-wrap" }, ...props },
      context.displayField(field, props?.row),
    ),
  percentage: (field, context) =>
    h(
      "span",
      props,
      `${Number(context.getFieldValue(field, props?.row) ?? 0) * 100}%`,
    ),
  amountText: fallbackDisplay,
  quantityUnit: (field, context) => {
    const value = context.getFieldValue(field, props?.row);
    const unit = field.suffix?.trim();
    const text =
      value == null || value === ""
        ? (field.nullDisplayText ?? "")
        : unit
          ? `${value} ${unit}`
          : String(value);
    return h(
      "span",
      { ...props, class: ["mmda-quantity-unit", props?.class] },
      text,
    );
  },
  checkIcon: (field, context) =>
    h("i", {
      class: context.getFieldValue(field, props?.row)
        ? "fas fa-check-circle"
        : "far fa-circle",
      style: context.getFieldValue(field, props?.row)
        ? { color: "var(--mmda-success-color, #18a058)" }
        : undefined,
      ...props,
    }),
  checkedIcon: (field, context) =>
    h("i", {
      class: context.getFieldValue(field, props?.row)
        ? "fas fa-check-circle"
        : "far fa-circle",
      style: context.getFieldValue(field, props?.row)
        ? { color: "var(--mmda-success-color, #18a058)" }
        : undefined,
      ...props,
    }),
  searchInput: textInput,
  searchBox,
  comboBox,
  autoComplete,
  tagAutoComplete,
  treeSelect,
  enumSetCheckboxGroup: multiBitSelect,
  toHoursInput: numberInput,
  toMinutesInput: numberInput,
  toSecondsInput: numberInput,
  colorBox: (field, context) =>
    h("span", {
      title: String(context.getFieldValue(field, props?.row) ?? ""),
      style: {
        display: "inline-block",
        width: "1.5rem",
        height: "1.5rem",
        backgroundColor: String(
          context.getFieldValue(field, props?.row) ?? "transparent",
        ),
      },
      ...props,
    }),
  statusLight: tag,
};

factory.inplaceFieldEditor = (field, context) =>
  renderInplaceFieldEditor(field, context as any, props ?? {}, factory);

const aliases: Record<string, string> = {
  TextBox: "textInput",
  TextField: "textInput",
  TextArea: "textArea",
  AutoComplete: "autoComplete",
  TagAutoComplete: "tagAutoComplete",
  DropDownList: "dropDownList",
  RadioButtonGroup: "radioButtonGroup",
  Combobox: "comboBox",
  DatePicker: "datePicker",
  DateTimePicker: "dateTimePicker",
  MonthPicker: "monthPicker",
  TimePicker: "timePicker",
  DateRangePicker: "dateRangePicker",
  NumberInput: "numberInput",
  ToHoursInput: "toHoursInput",
  ToMinutesInput: "toMinutesInput",
  ToSecondsInput: "toSecondsInput",
  PositiveNumberInput: "positiveNumberInput",
  NegativenumberInput: "negativenumberInput",
  PercentInput: "percentInput",
  SpinBox: "numberInput",
  CheckBox: "checkBox",
  Checkbox: "checkBox",
  checkbox: "checkBox",
  Switch: "switch",
  Switcher: "switch",
  SearchBox: "searchBox",
  CheckBoxList: "checkBoxList",
  BitCheckBoxList: "bitCheckBoxList",
  MultiSelect: "multiSelect",
  MultiItemSelect: "multiItemSelect",
  MultiValueSelect: "multiValueSelect",
  MultiTextSelect: "multiTextSelect",
  MultiBitSelect: "multiBitSelect",
  Slider: "slider",
  Rating: "rating",
  ColorPicker: "colorPicker",
  FilePicker: "filePicker",
  FileUpload: "fileUpload",
  FileUploader: "fileUploader",
  FilesUploader: "filesUploader",
  ImagePicker: "imagePicker",
  ImageUploader: "imageUploader",
  ImagesUploader: "imagesUploader",
  FileLink: "fileLink",
  Url: "fileLink",
  InplaceFieldEditor: "inplaceFieldEditor",
  MultilineText: "multilineText",
  Percentage: "percentage",
  AmountText: "amountText",
  QuantityUnit: "quantityUnit",
  Tag: "tag",
  Tags: "tags",
  Chips: "chips",
  BitChipSet: "bitChipSet",
  EnumChipSet: "enumChipSet",
  CheckIcon: "checkIcon",
  CheckedIcon: "checkedIcon",
  HasOneText: "externalLink",
  hasOneText: "externalLink",
  ColorBox: "colorBox",
  ProgressBar: "progressBar",
  SignaturePad: "signaturePad",
  Stepper: "stepper",
  Timeline: "timeline",
  RelativeTime: "relativeTime",
  Image: "image",
  Avatar: "avatar",
  StatusLight: "statusLight",
};

for (const [alias, source] of Object.entries(aliases)) {
  factory[alias] = factory[source];
}

export function createAgNaiveFieldFactory(): UiFieldFactory {
  return { ...factory };
}
