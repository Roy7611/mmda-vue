import { h, mergeProps, type Component, type VNode } from "vue";
import {
  SqlDataType,
  MetaModel,
  type MetaUiField,
  type Module,
} from "@mmda/core";
import {
  cleanProps,
  fasIcon,
  TABLE_CELL_PROP_KEYS,
  type PropData,
  type UiFieldFactory,
  type UiViewContext,
} from "@mmda/vui";
import {
  CheckBoxComponent,
  SwitchComponent,
} from "@syncfusion/ej2-vue-buttons";
import {
  DatePickerComponent,
  DateTimePickerComponent,
  TimePickerComponent,
} from "@syncfusion/ej2-vue-calendars";
import {
  DropDownListComponent,
  MultiSelectComponent,
} from "@syncfusion/ej2-vue-dropdowns";
import {
  ColorPickerComponent,
  MaskedTextBoxComponent,
  NumericTextBoxComponent,
  SliderComponent,
  TextAreaComponent,
  TextBoxComponent,
  UploaderComponent,
} from "@syncfusion/ej2-vue-inputs";
import { ProgressBarComponent } from "@syncfusion/ej2-vue-progressbar";
import { getSyncfusionCulture } from "./syncfusion_i18n";

type UiContext = UiViewContext<any>;

const update = (field: MetaUiField, context: UiContext) => (value: any) =>
  context.setFieldValue(field, value);

const invalidOf = (field: MetaUiField, context: UiContext) =>
  Boolean((context as any).isInvalid?.(field));

const control = (
  component: Component,
  field: MetaUiField,
  context: UiContext,
  props: PropData = {},
  extra: PropData = {},
  slots?: Record<string, () => VNode>,
) => {
  const invalid = invalidOf(field, context);
  const onChange = (args: any) => {
    const value = args?.value ?? args?.checked ?? args;
    update(field, context)(value);
  };
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    h(
      component,
      {
        id: field.fieldName,
        name: field.fieldName,
        value: context.getFieldValue(field),
        enabled: !context.isFieldReadonly(field),
        readonly: context.isFieldReadonly(field),
        placeholder: field.placeholder,
        locale: getSyncfusionCulture(),
        cssClass: invalid ? "e-error" : undefined,
        ...extra,
        ...props,
        change: props.change ?? onChange,
        input: props.input ?? onChange,
      },
      slots,
    ),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

const textInput = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(TextBoxComponent as any, field, context, props);

const textArea = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(TextAreaComponent as any, field, context, props, {
    rows: 3,
    // EJ2 默认 Both + auto-width，会缩成「一条短下划线」；表单要占满字段列
    width: "100%",
    resizeMode: "Vertical",
  });

const password = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(TextBoxComponent as any, field, context, props, { type: "password" });

/** 对齐老代码 defineDropdownProps：用 refFlds 映射，整对象交给 setFieldValue。 */
const referenceFieldKeys = (
  reference: NonNullable<MetaUiField["reference"]>,
) => {
  const refFlds = reference.refFlds?.length
    ? reference.refFlds
    : ["value", "text"];
  return {
    valueKey: refFlds[0] ?? "value",
    textKey: refFlds[1] ?? refFlds[0] ?? "text",
    refFlds,
  };
};

/** getFieldValue 已区分 HAS_ONE 导航对象 / REF getRefObject / ENUM；EJ2 绑定主键。 */
const referenceSelectedValue = (
  field: MetaUiField,
  context: UiContext,
  reference: NonNullable<MetaUiField["reference"]>,
) => {
  const current = context.getFieldValue(field);
  if (current == null || current === "") return null;
  const raw =
    typeof current === "object" ? reference.valueOf(current) : current;
  // 与老代码一致：引用默认 0 视为未选
  if (raw === 0 || raw === "0") return null;
  return raw;
};

const resolveReferenceOption = (
  reference: NonNullable<MetaUiField["reference"]>,
  value: unknown,
  itemData?: any,
) => {
  if (value == null || value === "") return null;
  if (
    itemData &&
    typeof itemData === "object" &&
    !("__mmdaOption" in itemData)
  ) {
    return itemData;
  }
  const wrapped = itemData?.__mmdaOption;
  if (wrapped) return wrapped;
  return (
    reference.refOptions.find(
      (option) => reference.valueOf(option) === value,
    ) ?? null
  );
};

const referenceDataSource = (
  reference: NonNullable<MetaUiField["reference"]>,
  fallback?: unknown[],
) => {
  const options = (reference.refOptions ?? fallback ?? []) as any[];
  const { valueKey, textKey, refFlds } = referenceFieldKeys(reference);
  // 多字段标签：EJ2 只有单一 text 字段，用 labelOf 组装
  if (refFlds.length > 2) {
    return options.map((option) => ({
      ...option,
      [valueKey]: reference.valueOf(option),
      [textKey]: String(reference.labelOf(option) ?? ""),
      __mmdaOption: option,
    }));
  }
  return options;
};

const dropdown = (field: MetaUiField, context: UiContext, props?: PropData) => {
  const reference = field.reference;
  if (!reference) {
    return control(DropDownListComponent as any, field, context, props, {
      dataSource: props?.options ?? [],
      fields: props?.fields,
      allowFiltering: true,
      showClearButton: field.nullable,
    });
  }

  const { valueKey, textKey } = referenceFieldKeys(reference);
  const dataSource = referenceDataSource(reference, props?.options);

  return control(
    DropDownListComponent as any,
    field,
    context,
    {
      ...props,
      change: (args: any) => {
        update(
          field,
          context,
        )(resolveReferenceOption(reference, args?.value, args?.itemData));
      },
    },
    {
      // 原始 refOptions（或组装后的行）；fields 指向 refFlds，与老 Prime optionLabel/dataKey 一致
      dataSource,
      fields: { text: textKey, value: valueKey },
      value: referenceSelectedValue(field, context, reference),
      allowFiltering: true,
      showClearButton: field.nullable,
    },
  );
};

const multiSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const reference = field.reference;
  if (!reference) {
    return control(MultiSelectComponent as any, field, context, props, {
      dataSource: props?.options ?? [],
      mode: "CheckBox",
    });
  }

  const { valueKey, textKey } = referenceFieldKeys(reference);
  const dataSource = referenceDataSource(reference, props?.options);
  const current = context.getFieldValue(field);
  const selected = Array.isArray(current)
    ? current
        .map((item) =>
          item != null && typeof item === "object"
            ? reference.valueOf(item)
            : item,
        )
        .filter((value) => value !== 0 && value !== "0")
    : current;

  return control(
    MultiSelectComponent as any,
    field,
    context,
    {
      ...props,
      change: (args: any) => {
        const values = Array.isArray(args?.value) ? args.value : [];
        update(
          field,
          context,
        )(
          values.map((value: unknown) =>
            resolveReferenceOption(reference, value),
          ),
        );
      },
    },
    {
      dataSource,
      fields: { text: textKey, value: valueKey },
      value: selected,
      mode: "CheckBox",
    },
  );
};

/** 单位：优先 metacol.suffix；否则 formatter 若为纯单位文本（天、KG）也可用作后缀。 */
export const resolveFieldUnit = (field: MetaUiField): string => {
  const suffix = field.suffix?.trim();
  if (suffix) return suffix;
  const formatter = field.formatter?.trim();
  if (
    formatter &&
    formatter.length <= 12 &&
    !/[#0nNpPcCydDhHmMsSfF*?[\]]/.test(formatter)
  ) {
    return formatter;
  }
  return "";
};

const numericStepOf = (field: MetaUiField, props: PropData = {}) => {
  if (props.step != null && props.step !== "") return Number(props.step);
  const scale = (field as any).scale ?? field.numericScale;
  if (scale != null && scale !== "" && Number(scale) > 0) {
    return 1 / 10 ** Number(scale);
  }
  return 1;
};

const numericSuffixAdornment = (unit: string) =>
  h("span", { class: "mmda-numeric-suffix", "aria-hidden": "true" }, unit);

/** 程序化 h() 渲染时 Vue slot 的 appendTemplate 常不生效；created 后 DOM 注入兜底。 */
const injectNumericUnitSuffix = (field: MetaUiField, unit: string) => () => {
  if (!unit) return;
  queueMicrotask(() => {
    const input = document.getElementById(field.fieldName);
    const container = input?.closest(".e-input-group");
    if (!container || container.querySelector(".mmda-numeric-suffix")) return;

    const suffix = document.createElement("span");
    suffix.className = "e-input-group-icon mmda-numeric-suffix";
    suffix.textContent = unit;
    suffix.setAttribute("aria-hidden", "true");

    const spinDown = container.querySelector(".e-spin-down");
    if (spinDown) container.insertBefore(suffix, spinDown);
    else container.appendChild(suffix);
  });
};

const numberInput = (
  field: MetaUiField,
  context: UiContext,
  props: PropData = {},
) => {
  const unit = resolveFieldUnit(field);
  const scale = (field as any).scale ?? field.numericScale;
  const decimals =
    scale != null && scale !== "" && !Number.isNaN(Number(scale))
      ? Number(scale)
      : undefined;
  const invalid = invalidOf(field, context);
  const useSuffix = Boolean(unit) && props.appendTemplate == null;
  const {
    created: userCreated,
    cssClass: userCssClass,
    ...controlProps
  } = props;
  const slots = useSuffix
    ? { appendTemplate: () => numericSuffixAdornment(unit) }
    : undefined;
  const extra: PropData = {
    format: "n",
    step: numericStepOf(field, props),
    showSpinButton: props.showSpinButton ?? true,
    ...(decimals != null ? { decimals } : {}),
    ...(useSuffix || userCreated
      ? {
          ...(useSuffix ? { appendTemplate: "appendTemplate" } : {}),
          ...(useSuffix
            ? {
                cssClass:
                  [
                    "mmda-numeric-with-unit",
                    invalid ? "e-error" : "",
                    userCssClass,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined,
              }
            : {}),
          created: () => {
            if (useSuffix) injectNumericUnitSuffix(field, unit)();
            userCreated?.();
          },
        }
      : {}),
  };
  return control(
    NumericTextBoxComponent as any,
    field,
    context,
    controlProps,
    extra,
    slots,
  );
};

const percentInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(NumericTextBoxComponent as any, field, context, props, {
    format: "p",
    min: 0,
    max: 1,
  });

const checkbox = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(CheckBoxComponent as any, field, context, props, {
    checked: context.getFieldValue(field),
    label: field.displayLabel,
  });

const switcher = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(SwitchComponent as any, field, context, props, {
    checked: context.getFieldValue(field),
  });

const datePicker = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(DatePickerComponent as any, field, context, props, {
    format: "yyyy-MM-dd",
  });

const dateTimePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(DateTimePickerComponent as any, field, context, props, {
    format: "yyyy-MM-dd HH:mm:ss",
  });

const monthPicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(DatePickerComponent as any, field, context, props, {
    start: "Year",
    depth: "Year",
    format: "yyyy-MM",
  });

const timePicker = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(TimePickerComponent as any, field, context, props, {
    format: "HH:mm:ss",
  });

const fallbackDisplay = (
  field: MetaUiField,
  context: UiContext,
  props: PropData = {},
) =>
  h(
    "output",
    { class: "mmda-sf-display", ...props },
    String(context.displayField(field, props.row) ?? ""),
  );

/**
 * HAS_ONE / 远程 REF：对齐老 SearchBox = 可编辑 ComboBox 联想 + 搜索按钮弹窗。
 */
const searchBox = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
): VNode => {
  const reference = field.reference;
  if (!reference) {
    return h("span", { class: "warning" }, "不是引用字段");
  }
  const builder = context.uiBuilder;
  if (!builder?.buildSearchForRelative) {
    return fallbackDisplay(field, context, props);
  }

  const valueKey = reference.refFlds?.[0] ?? "value";
  const labelKey = reference.refFlds?.[1] ?? valueKey;
  const fldOptions = context.getFieldOptions(field);
  const searchOptions = context.getSearchForRelativeOptions(field);

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
    searchOptions.searchWord = fieldValue;
  }

  // 选中对象才作为 ComboBox model；输入中的字符串不能写进 reactive searchWord，
  // 否则重渲染会拆掉正在 filtering 的 EJ2（emitsOptions null）。
  const selectedModel =
    searchOptions.searchWord != null &&
    typeof searchOptions.searchWord === "object"
      ? searchOptions.searchWord
      : fieldValue;

  return builder.buildSearchForRelative(context, field, {
    ...props,
    modelValue: selectedModel,
    showClear: Boolean(selectedModel),
    options: fldOptions.selectOptions,
    title: props?.title ?? field.displayLabel,
    // EJ2 ComboBox fields.value / fields.text：必须是属性名，不能是 label 函数
    dataKey: valueKey,
    optionLabel: labelKey,
    valueField: valueKey,
    labelField: labelKey,
    invalid: invalidOf(field, context),
    onChange: (value: any) => {
      searchOptions.searchWord = value || null;
      context.setFieldValue(field, value || null);
      if (!value) {
        const model = context.model as Record<string, any>;
        MetaModel.setRefProp(model, field.fieldName, null);
        reference.refFlds.forEach((rf, index) => {
          if (index > 0) MetaModel.delCustomProp(model, rf);
        });
        if (reference.hasOne && reference.alias) {
          model[reference.alias] = null;
        }
      }
    },
    toSearch: async () => {
      const picked = await (context as any).pickRelative?.(field);
      if (picked) searchOptions.searchWord = picked;
      return true;
    },
  });
};

const fallbackInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
): VNode => {
  // HAS_ONE / 远程 REF：走 SearchBox（ComboBox + 搜索），不是本地 dropdown
  if (
    field.reference &&
    (field.reference.hasOne ||
      (field.reference.isRef && field.reference.refRepository))
  ) {
    return searchBox(field, context, props);
  }
  if (field.reference?.refOptions?.length)
    return dropdown(field, context, props);
  if (SqlDataType.isBool(field.dataType))
    return checkbox(field, context, props);
  if (SqlDataType.isNum(field.dataType))
    return numberInput(field, context, props);
  if (SqlDataType.isDate(field.dataType))
    return datePicker(field, context, props);
  return textInput(field, context, props);
};

const tag = (field: MetaUiField, context: UiContext, props?: PropData) =>
  h(
    "span",
    { class: "e-badge", ...props },
    context.displayField(field, props?.row),
  );

const tagLabels = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
): string[] => {
  const raw = context.getFieldValue(field, props?.row);
  const labelOf = (value: any) =>
    String(
      field.reference?.labelOf?.(value) ??
        value?.label ??
        value?.text ??
        value ??
        "",
    ).trim();
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) return raw.map(labelOf).filter(Boolean);
  if (typeof raw === "number" && field.reference?.refOptions?.length) {
    return field.reference.refOptions
      .filter((item: any) => Number(field.reference!.valueOf(item)) & raw)
      .map(labelOf)
      .filter(Boolean);
  }
  return String(raw)
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const tags = (field: MetaUiField, context: UiContext, props?: PropData) =>
  h(
    "div",
    { class: "mmda-sf-tags" },
    tagLabels(field, context, props).map((label) =>
      h("span", { class: "e-badge", ...props }, label),
    ),
  );

const chips = (field: MetaUiField, context: UiContext, props?: PropData) =>
  h(
    "div",
    {
      ...props,
      class: ["e-chip-list", "mmda-chips", props?.class],
    },
    tagLabels(field, context, props).map((label) =>
      h("div", { class: "e-chip", tabindex: -1 }, [
        h("span", { class: "e-chip-text" }, label),
      ]),
    ),
  );

const cellDomProps = (props?: PropData) =>
  cleanProps(TABLE_CELL_PROP_KEYS, props ?? {});

const externalLink = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const app = context.app;
  if (!app) return fallbackDisplay(field, context, props);

  const model = (props?.row ?? context.model) as Record<string, any>;
  const alias = field.reference?.alias;
  const fldVal = model[field.fieldName] ?? (alias ? model[alias] : undefined);
  if (!fldVal) return fallbackDisplay(field, context, props);

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

  const { modules = [], context: appContext } = app;
  const systemList: any[] = appContext?.systemList ?? [];
  const api = context.apiClient ?? app.api;
  const isCurrentSystem =
    !reference.refDbName || reference.refDbName === api?.config.service;

  const refMainModule = isCurrentSystem
    ? modules.find((module: Module) =>
        module?.subModules?.some(
          (subModule: Module) => subModule.objName === reference.refObjName,
        ),
      )
    : systemList.find((system: any) => system.service === reference.refDbName);

  const refModule = refMainModule?.subModules?.find(
    (subModule: Module) => subModule.objName === reference.refObjName,
  );

  const readable = isCurrentSystem
    ? Boolean(refModule?.authority?.allowRead)
    : Boolean(refMainModule?.authority?.allowRead);
  if (!linkable || !readable) {
    return h("span", { name: field.fieldName, ...domProps }, fldText);
  }

  const iconProps: PropData = {
    role: "external-link-icon",
    style: {
      marginRight: "5px",
      cursor: "pointer",
    },
    onClick: (event: Event) => {
      event.stopPropagation();
      void (async () => {
        await context.app?.syncAuthState?.();
        const url = context.routeToRelative?.(field, model);
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      })();
    },
  };

  return h(
    "div",
    {
      class: "flex_item_center",
      role: "mmda-external-link",
      id: field.fieldName,
      ...domProps,
    },
    [
      fasIcon(
        "external-link",
        mergeProps(iconProps, { class: iconProps.class }),
      ),
      h("span", fldText),
    ],
  );
};

const fileLink = (field: MetaUiField, context: UiContext, props?: PropData) => {
  const value = context.getFieldValue(field, props?.row);
  return h(
    "a",
    {
      href: value,
      target: "_blank",
      rel: "noopener noreferrer",
      ...cellDomProps(props),
    },
    context.displayField(field, props?.row) || String(value ?? ""),
  );
};

/** 布尔只读：true 默认 success 圈勾；false=灰色空心圆 */
const boolIcon = (field: MetaUiField, context: UiContext, props?: PropData) => {
  const checked = Boolean(context.getFieldValue(field, props?.row));
  return h("i", {
    ...props,
    class: [
      "e-icons",
      "mmda-bool-icon",
      checked
        ? "e-circle-check mmda-bool-icon--true"
        : "e-circle mmda-bool-icon--false",
      props?.class,
    ],
  });
};

const factory: UiFieldFactory = {
  fallbackDisplay,
  fallbackInput,
  textInput,
  textArea,
  password,
  dropdown,
  select: dropdown,
  multiSelect,
  numberInput,
  positiveNumberInput: (field, context, props) =>
    numberInput(field, context, { min: 0, ...props }),
  negativenumberInput: (field, context, props) =>
    numberInput(field, context, { max: 0, ...props }),
  percentInput,
  checkbox,
  switcher,
  Switcher: switcher,
  datePicker,
  dateTimePicker,
  monthPicker,
  timePicker,
  dateRangePicker: (field, context, props) =>
    control(DatePickerComponent as any, field, context, props),
  mobileInput: (field, context, props) =>
    control(MaskedTextBoxComponent as any, field, context, props, {
      mask: "000 0000 0000",
    }),
  zipCodeInput: (field, context, props) =>
    control(MaskedTextBoxComponent as any, field, context, props, {
      mask: "000000",
    }),
  slider: (field, context, props) =>
    control(SliderComponent as any, field, context, props),
  colorPicker: (field, context, props) =>
    control(ColorPickerComponent as any, field, context, props),
  filePicker: (field, context, props) =>
    h(UploaderComponent as any, {
      autoUpload: true,
      enabled: !context.isFieldReadonly(field),
      selected: (event: any) =>
        context.setFieldValue(field, event.filesData?.[0] ?? event.filesData),
      ...props,
    }),
  fileUpload: (field, context, props) =>
    h(UploaderComponent as any, {
      multiple: true,
      enabled: !context.isFieldReadonly(field),
      selected: (event: any) => context.setFieldValue(field, event.filesData),
      ...props,
    }),
  imagePicker: (field, context, props) =>
    h("img", {
      src: context.getFieldValue(field, props?.row),
      ...props,
    }),
  image: (field, context, props) =>
    h("img", {
      src: context.getFieldValue(field, props?.row),
      ...props,
    }),
  progressBar: (field, context, props) =>
    h(ProgressBarComponent as any, {
      value: Number(context.getFieldValue(field, props?.row) ?? 0),
      ...props,
    }),
  tag,
  tags,
  chips,
  enumSetTags: tags,
  fileLink,
  externalLink,
  textSpan: fallbackDisplay,
  span: fallbackDisplay,
  multilineText: (field, context, props) =>
    h(
      "span",
      { style: { whiteSpace: "pre-wrap" }, ...props },
      context.displayField(field, props?.row),
    ),
  percentage: (field, context, props) =>
    h(
      "span",
      props,
      `${Number(context.getFieldValue(field, props?.row) ?? 0) * 100}%`,
    ),
  amountText: fallbackDisplay,
  quantityUnit: (field, context, props) => {
    const value = context.getFieldValue(field, props?.row);
    const unit = resolveFieldUnit(field);
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
  checkIcon: (field, context, props) => boolIcon(field, context, props),
  checkedIcon: (field, context, props) => boolIcon(field, context, props),
  searchInput: textInput,
  searchBox,
  comboBox: dropdown,
  autoComplete: dropdown,
  associationTable: fallbackDisplay,
  treeSelect: dropdown,
  enumSetCheckboxGroup: multiSelect,
  toHoursInput: numberInput,
  toMinutesInput: numberInput,
  toSecondsInput: numberInput,
  colorBox: (field, context, props) =>
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

const aliases: Record<string, string> = {
  TextBox: "textInput",
  TextField: "textInput",
  TextArea: "textArea",
  AutoComplete: "autoComplete",
  DropdownList: "dropdown",
  Combobox: "comboBox",
  DatePicker: "datePicker",
  DateTimePicker: "dateTimePicker",
  MonthPicker: "monthPicker",
  TimePicker: "timePicker",
  NumberInput: "numberInput",
  ToHoursInput: "toHoursInput",
  ToMinutesInput: "toMinutesInput",
  ToSecondsInput: "toSecondsInput",
  PositiveNumberInput: "positiveNumberInput",
  NegativenumberInput: "negativenumberInput",
  PercentInput: "percentInput",
  SpinBox: "numberInput",
  CheckBox: "checkbox",
  Checkbox: "checkbox",
  SearchBox: "searchBox",
  AssociationTable: "associationTable",
  CheckBoxList: "enumSetCheckboxGroup",
  BitCheckBoxList: "enumSetCheckboxGroup",
  Slider: "slider",
  ColorPicker: "colorPicker",
  FilePicker: "filePicker",
  FileUpload: "fileUpload",
  ImagePicker: "imagePicker",
  PastTime: "fallbackDisplay",
  MultilineText: "multilineText",
  Percentage: "percentage",
  AmountText: "amountText",
  QuantityUnit: "quantityUnit",
  Tag: "tag",
  Tags: "tags",
  Chips: "chips",
  BitTags: "enumSetTags",
  BitChipSet: "enumSetTags",
  EnumChipSet: "enumSetTags",
  CheckIcon: "checkIcon",
  CheckedIcon: "checkedIcon",
  HasOneText: "externalLink",
  ColorBox: "colorBox",
  ProgressBar: "progressBar",
  Image: "image",
  StatusLight: "statusLight",
};

for (const [alias, source] of Object.entries(aliases)) {
  factory[alias] = factory[source];
}

export const syncfusionFieldFactory = factory;

export function createSyncfusionFieldFactory(): UiFieldFactory {
  return { ...factory };
}
