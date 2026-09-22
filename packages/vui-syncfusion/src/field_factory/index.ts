import { h, type VNode } from "vue";
import { SqlDataType, type MetaUiField } from "@mmda/core";
import { colorPickerPropsFromField, maskedTextBoxPropsFromField, oneTimePasswordPropsFromField, sliderPropsFromField, ratingPropsFromField, MOBILE_MASK, ZIP_MASK, renderInplaceFieldEditor, type UiProps, type UiFieldFactory } from "@mmda/vui"
import { createColorPicker } from "../factory/color_picker";
import { createMaskedTextBox } from "../factory/masked_text_box";
import { createOneTimePasswordInput } from "../factory/one_time_password_input";
import { createSlider } from "../factory/slider";
import { createRating } from "../factory/rating";
import { invalidOf, type SfVuiContext } from "./utils";
import { numberInput, percentInput } from "./number";
import { password, textArea, textInput } from "./text";
import {
  checkbox,
  comboBox,
  dropDownList,
  radioButtonGroup,
  treeSelect,
  multiSelect,
  multiItemSelect,
  multiValueSelect,
  multiTextSelect,
  multiBitSelect,
  checkBoxList,
  bitCheckBoxList,
  searchBox,
  switcher,
  switchControl,
  autoComplete,
  tagAutoComplete,
} from "./select";
import {
  datePicker,
  dateTimePicker,
  monthPicker,
  timePicker,
  dateRangePicker,
} from "./date";
import {
  filePicker,
  fileUpload,
  fileUploader,
  filesUploader,
  imagePicker,
  imageUploader,
  imagesUploader,
  fileLinkField,
} from "./upload";
import {
  boolIcon,
  colorBox,
  externalLink,
  fallbackDisplay,
  fieldAvatar,
  fieldImage,
  multilineText,
  percentage,
  progressBar,
  quantityUnit,
  relativeTimeField,
  signaturePad,
  stepper,
  tag,
  tags,
  chips,
  bitChipSet,
  enumChipSet,
} from "./display";

const wrapMasked = (
  field: MetaUiField,
  context: SfVuiContext
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    createMaskedTextBox(maskedTextBoxPropsFromField(field, context)),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
};

const wrapOtp = (
  field: MetaUiField,
  context: SfVuiContext
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    createOneTimePasswordInput(
      oneTimePasswordPropsFromField(field, context),
    ),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
};

const wrapSlider = (
  field: MetaUiField,
  context: SfVuiContext
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    createSlider(sliderPropsFromField(field, context)),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
};

const wrapRating = (
  field: MetaUiField,
  context: SfVuiContext
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    createRating(ratingPropsFromField(field, context)),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
};

const fallbackInput = (
  field: MetaUiField,
  context: SfVuiContext,
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
  bitCheckBoxList,
  numberInput,
  positiveNumberInput: (field, context) =>
    numberInput(field, context, { min: 0, ...props }),
  negativenumberInput: (field, context) =>
    numberInput(field, context, { max: 0, ...props }),
  percentInput,
  checkBox: checkbox,
  switch: switchControl,
  Switcher: switchControl,
  switcher,
  datePicker,
  dateTimePicker,
  monthPicker,
  timePicker,
  dateRangePicker,
  mobileInput: (field, context) =>
    wrapMasked(field, context, { ...props, mask: MOBILE_MASK }),
  zipCodeInput: (field, context) =>
    wrapMasked(field, context, { ...props, mask: ZIP_MASK }),
  maskedTextBox: (field, context) =>
    wrapMasked(field, context),
  oneTimePasswordInput: (field, context) =>
    wrapOtp(field, context),
  slider: (field, context) =>
    wrapSlider(field, context),
  rating: (field, context) =>
    wrapRating(field, context),
  colorPicker: (field, context) => {
    const invalid = invalidOf(field, context);
    return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
      createColorPicker(colorPickerPropsFromField(field, context)),
      invalid &&
        h(
          "span",
          { class: "e-error" },
          context.getInvalidMessage?.(field),
        ),
    ]);
  },
  filePicker,
  fileUpload,
  fileUploader,
  filesUploader,
  imagePicker,
  imageUploader,
  imagesUploader,
  image: fieldImage,
  avatar: fieldAvatar,
  progressBar,
  signaturePad,
  stepper,
  relativeTime: relativeTimeField,
  tag,
  tags,
  chips,
  bitChipSet,
  enumChipSet,
  fileLink: fileLinkField,
  externalLink,
  textSpan: fallbackDisplay,
  span: fallbackDisplay,
  multilineText,
  percentage,
  amountText: fallbackDisplay,
  quantityUnit,
  checkIcon: (field, context) => boolIcon(field, context),
  checkedIcon: (field, context) => boolIcon(field, context),
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
  colorBox,
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
  RelativeTime: "relativeTime",
  Image: "image",
  Avatar: "avatar",
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
