import { h, type VNode } from "vue";
import {
  MetaModel,
  avatarPropsFromField,
  type MetaUiField,
  type UiAvatarProps,
  type UiContext,
  type UiFieldFactory,
  type UiProps,
} from "@mmda/core";
import {
  VueUiFieldFactory,
  type VuiContext,
  type VuiFactory,
  type VuiFieldRenderer,
} from "@mmda/vui";
import { createSyncfusionUiFactory } from "../factory";
import { createSearchRelative } from "../factory/search_relative";

/**
 * Syncfusion EJ2 Vue 字段控件工厂。
 *
 * `MetaUiField → UiXxxProps → factory.xxx` 的通用映射已在 @mmda/vui 的
 * {@link VueUiFieldFactory} 完成；本类只负责绑定 Syncfusion factory 与
 * Syncfusion 特有的引用选择 / 头像尺寸等 chrome。
 */
export class SfVueUiFieldFactory extends VueUiFieldFactory {
  constructor(factory: VuiFactory = createSyncfusionUiFactory()) {
    super(factory);
  }

  /**
   * HAS_ONE / 远程 REF：对齐老 SearchBox = 可编辑 ComboBox 联想 + 搜索按钮弹窗。
   */
  searchRelative: VuiFieldRenderer = (field, context, props) => {
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
        !fldOptions.selectOptions.some(
          (item) => reference.valueOf(item) === key,
        )
      ) {
        fldOptions.selectOptions.unshift(fieldValue);
      }
      fldOptions.currentSelectOption = fieldValue;
    }

    const selectedModel =
      fldOptions.currentSelectOption != null &&
      typeof fldOptions.currentSelectOption === "object"
        ? fldOptions.currentSelectOption
        : fieldValue;

    return createSearchRelative(field, context as VuiContext<any>, {
      ...props,
      modelValue: selectedModel,
      showClear: Boolean(selectedModel),
      options: fldOptions.selectOptions,
      title: props?.title ?? field.displayLabel,
      dataKey: valueKey,
      optionLabel: labelKey,
      valueField: valueKey,
      labelField: labelKey,
      invalid: Boolean(context.isInvalid?.(field)),
      onChange: (value: any) => {
        fldOptions.currentSelectOption = value || null;
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
        const picked = await context.select(field);
        if (picked) fldOptions.currentSelectOption = picked;
        return true;
      },
    });
  };

  searchBox = this.searchRelative;

  /** 表格单元格里的头像默认 small（表单里不默认，交给字段/调用方）。 */
  avatar: VuiFieldRenderer = (field, context, props) => {
    const cell = props as UiAvatarProps | undefined;
    const avatarProps: UiAvatarProps = {
      ...avatarPropsFromField(field, context),
      ...(cell ? { size: cell.size ?? "small" } : {}),
    };
    return this.factory.avatar(avatarProps);
  };

  // —— 别名 / 老 metadata 编辑器名 ——

  select = this.dropDownList;
  span = this.fallbackDisplay;
  searchInput = this.textInput;
  switcher = this.switch;
  Switcher = this.switch;
  negativenumberInput = this.negativeNumberInput;
  enumSetCheckboxGroup = this.multiBitSelect;
  filePicker = this.fileUploader;
  fileUpload = this.filesUploader;
  imagePicker = this.imageUploader;
  toHoursInput = this.numberInput;
  toMinutesInput = this.numberInput;
  toSecondsInput = this.numberInput;

  tag: VuiFieldRenderer = (field, context, props) =>
    h(
      "span",
      { class: "e-badge", ...props },
      context.displayField(field, props?.row),
    );

  statusLight = this.tag;

  TextBox = this.textInput;
  TextField = this.textInput;
  TextArea = this.textArea;
  AutoComplete = this.autoComplete;
  TagAutoComplete = this.tagAutoComplete;
  DropDownList = this.dropDownList;
  RadioButtonGroup = this.radioButtonGroup;
  Combobox = this.comboBox;
  DatePicker = this.datePicker;
  DateTimePicker = this.dateTimePicker;
  MonthPicker = this.monthPicker;
  TimePicker = this.timePicker;
  DateRangePicker = this.dateRangePicker;
  NumberInput = this.numberInput;
  ToHoursInput = this.toHoursInput;
  ToMinutesInput = this.toMinutesInput;
  ToSecondsInput = this.toSecondsInput;
  PositiveNumberInput = this.positiveNumberInput;
  NegativenumberInput = this.negativenumberInput;
  PercentInput = this.percentInput;
  SpinBox = this.numberInput;
  CheckBox = this.checkBox;
  Checkbox = this.checkBox;
  checkbox = this.checkBox;
  Switch = this.switch;
  SearchBox = this.searchBox;
  CheckBoxList = this.checkBoxList;
  BitCheckBoxList = this.bitCheckBoxList;
  MultiSelect = this.multiSelect;
  MultiItemSelect = this.multiItemSelect;
  MultiValueSelect = this.multiValueSelect;
  MultiTextSelect = this.multiTextSelect;
  MultiBitSelect = this.multiBitSelect;
  Slider = this.slider;
  Rating = this.rating;
  ColorPicker = this.colorPicker;
  FilePicker = this.filePicker;
  FileUpload = this.fileUpload;
  FileUploader = this.fileUploader;
  FilesUploader = this.filesUploader;
  ImagePicker = this.imagePicker;
  ImageUploader = this.imageUploader;
  ImagesUploader = this.imagesUploader;
  FileLink = this.fileLink;
  Url = this.fileLink;
  InplaceFieldEditor = this.inplaceFieldEditor;
  MultilineText = this.multilineText;
  Percentage = this.percentage;
  AmountText = this.amountText;
  QuantityUnit = this.quantityUnit;
  Tag = this.tag;
  Tags = this.tags;
  Chips = this.chips;
  BitChipSet = this.bitChipSet;
  EnumChipSet = this.enumChipSet;
  CheckIcon = this.checkIcon;
  CheckedIcon = this.checkedIcon;
  HasOneText = this.externalLink;
  hasOneText = this.externalLink;
  ColorBox = this.colorBox;
  ProgressBar = this.progressBar;
  SignaturePad = this.signaturePad;
  Stepper = this.stepper;
  RelativeTime = this.relativeTime;
  Image = this.image;
  Avatar = this.avatar;
  StatusLight = this.statusLight;
}

export const syncfusionFieldFactory: UiFieldFactory = new SfVueUiFieldFactory();

export function createSyncfusionFieldFactory(): UiFieldFactory {
  return new SfVueUiFieldFactory();
}

export { resolveFieldUnit } from "@mmda/vui";
