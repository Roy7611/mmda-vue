import { h, type VNode } from "vue";
import { SqlDataType, type MetaUiField } from "@mmda/core";
import { type PropData, type UiFieldFactory } from "@mmda/vui";
import {
  ColorPickerComponent,
  MaskedTextBoxComponent,
  SliderComponent,
} from "@syncfusion/ej2-vue-inputs";
import { DatePickerComponent } from "@syncfusion/ej2-vue-calendars";
import { control, type UiContext } from "./utils";
import { numberInput, percentInput } from "./number";
import { password, textArea, textInput } from "./text";
import {
  checkbox,
  dropdown,
  multiSelect,
  searchBox,
  switcher,
} from "./select";
import {
  datePicker,
  dateTimePicker,
  monthPicker,
  timePicker,
} from "./date";
import { filePicker, fileUpload, imagePicker } from "./upload";
import {
  boolIcon,
  chips,
  colorBox,
  externalLink,
  fallbackDisplay,
  fieldImage,
  fileLink,
  multilineText,
  percentage,
  progressBar,
  quantityUnit,
  tag,
  tags,
} from "./display";

const fallbackInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
): VNode => {
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
  filePicker,
  fileUpload,
  imagePicker,
  image: fieldImage,
  progressBar,
  tag,
  tags,
  chips,
  enumSetTags: tags,
  fileLink,
  externalLink,
  textSpan: fallbackDisplay,
  span: fallbackDisplay,
  multilineText,
  percentage,
  amountText: fallbackDisplay,
  quantityUnit,
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
  colorBox,
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

export { resolveFieldUnit } from "../factory/utils";
export const syncfusionFieldFactory = factory;

export function createSyncfusionFieldFactory(): UiFieldFactory {
  return { ...factory };
}
