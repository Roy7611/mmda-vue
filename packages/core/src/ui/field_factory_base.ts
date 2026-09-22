// core 内部用相对路径；自引用 @mmda/core 会让库构建无法解析。
import { SqlDataType } from '../metaui/datatype'
import type { MetaUiField } from '../metaui/metaui_field'
import type { UiContext } from './context'
import type { UiFieldRenderer } from './field_factory'
import type { UiFactory } from './factory'
import {
  autoCompleteBindValue,
  autoCompletePropsFromField,
  routeAutoCompleteField,
} from './factory/autocomplete'
import { avatarPropsFromField } from './factory/avatar'
import {
  bitCheckBoxListPropsFromField,
  checkBoxListPropsFromField,
} from './factory/check_box_list'
import { checkBoxPropsFromField } from './factory/checkbox'
import {
  bitChipSetPropsFromField,
  chipsPropsFromField,
  enumChipSetPropsFromField,
} from './factory/chips'
import { colorPickerPropsFromField } from './factory/color_picker'
import { comboBoxPropsFromField } from './factory/combo_box'
import {
  datePickerPropsFromField,
  monthPickerPropsFromField,
} from './factory/date_picker'
import { dateRangePickerPropsFromField } from './factory/date_range_picker'
import { dateTimePickerPropsFromField } from './factory/date_time_picker'
import { dropDownListPropsFromField } from './factory/drop_down_list'
import {
  MOBILE_MASK,
  ZIP_MASK,
  maskedTextBoxPropsFromField,
} from './factory/masked_text_box'
import {
  multiBitSelectPropsFromField,
  multiItemSelectPropsFromField,
  multiSelectPropsFromField,
  multiTextSelectPropsFromField,
  multiValueSelectPropsFromField,
} from './factory/multi_select'
import { numberInputPropsFromField } from './factory/number_input'
import { oneTimePasswordPropsFromField } from './factory/one_time_password_input'
import { progressBarPropsFromField } from './factory/progress_bar'
import { radioButtonGroupPropsFromField } from './factory/radio_button_group'
import { ratingPropsFromField } from './factory/rating'
import { sliderPropsFromField } from './factory/slider'
import { switchPropsFromField } from './factory/switch'
import { tagAutoCompletePropsFromField } from './factory/tag_auto_complete'
import { textAreaPropsFromField } from './factory/text_area'
import { textInputPropsFromField } from './factory/text_input'
import { timePickerPropsFromField } from './factory/time_picker'
import { treeSelectPropsFromField } from './factory/tree_select'

/**
 * 字段工厂抽象基类：字段名 → 控件工厂的映射表。
 *
 * 每个输入字段成员只做两件事：用 core 的 `*PropsFromField` 把 `MetaUiField`
 * 译成 `UiXxxProps`，再交给皮肤 `factory.xxx` 渲染，最后套一层 {@link control}
 * 加校验错误壳。因此 vui / rui 皮肤只需提供 `factory` 与 `control`（`h` / `createElement`），
 * 不再重复写字段到控件的映射。
 *
 * 框架专属的只读展示（`fallbackDisplay`、`fileLink`、`externalLink`、上传器、图片等）
 * 仍留在皮肤类实现。
 */
export abstract class AbstractUiFieldFactory<
  TNode = unknown,
  TFactory extends UiFactory<TNode> = UiFactory<TNode>,
> {
  [key: string]: any

  constructor(protected readonly factory: TFactory) {}

  /** 给裸控件套校验错误壳。vui 用 `h`，rui 用 `createElement`。 */
  protected abstract control(
    field: MetaUiField,
    context: UiContext,
    node: TNode,
  ): TNode

  /** 皮肤里实现（vui 额外带 row）。 */
  protected abstract numberInput: UiFieldRenderer<TNode>

  protected searchRelative(field: MetaUiField, context: UiContext): TNode {
    return this.factory.searchRelative({
      modelValue: context.getFieldValue(field),
      toSearch: () => context.select(field),
      optionLabel: undefined,
      dataKey: field.reference?.refFlds?.[0] ?? 'value',
      placeholder: field.placeholder,
      onUpdate: (value) => context.setFieldValue(field, value),
    })
  }

  fallbackInput: UiFieldRenderer<TNode> = (field, context) => {
    if (
      field.reference &&
      (field.reference.hasOne ||
        (field.reference.isRef && field.reference.refRepository))
    ) {
      return this.searchRelative(field, context)
    }
    if (field.reference?.refOptions?.length) {
      return this.dropDownList(field, context)
    }
    if (SqlDataType.isBool(field.dataType)) return this.checkBox(field, context)
    if (SqlDataType.isNum(field.dataType)) return this.numberInput(field, context)
    if (SqlDataType.isDate(field.dataType)) return this.datePicker(field, context)
    return this.textInput(field, context)
  }

  textInput: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.textInput(textInputPropsFromField(field, context)),
    )

  textArea: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.textArea(textAreaPropsFromField(field, context)),
    )

  password: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.textInput({
        ...textInputPropsFromField(field, context),
        type: 'Password',
      }),
    )

  percentInput: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.numberInput({
        ...numberInputPropsFromField(field, context),
        kind: 'percent',
      }),
    )

  positiveNumberInput: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.numberInput({
        ...numberInputPropsFromField(field, context),
        min: 0,
      }),
    )

  negativeNumberInput: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.numberInput({
        ...numberInputPropsFromField(field, context),
        max: 0,
      }),
    )

  maskedTextBox: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.maskedTextBox(maskedTextBoxPropsFromField(field, context)),
    )

  oneTimePasswordInput: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.oneTimePasswordInput(
        oneTimePasswordPropsFromField(field, context),
      ),
    )

  mobileInput: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.maskedTextBox(
        maskedTextBoxPropsFromField(field, context, { mask: MOBILE_MASK }),
      ),
    )

  zipCodeInput: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.maskedTextBox(
        maskedTextBoxPropsFromField(field, context, { mask: ZIP_MASK }),
      ),
    )

  datePicker: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.datePicker(datePickerPropsFromField(field, context)),
    )

  dateTimePicker: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.dateTimePicker(dateTimePickerPropsFromField(field, context)),
    )

  monthPicker: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.monthPicker(monthPickerPropsFromField(field, context)),
    )

  timePicker: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.timePicker(timePickerPropsFromField(field, context)),
    )

  dateRangePicker: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.dateRangePicker(dateRangePickerPropsFromField(field, context)),
    )

  dropDownList: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.dropDownList(dropDownListPropsFromField(field, context)),
    )

  comboBox: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.comboBox(comboBoxPropsFromField(field, context)),
    )

  autoComplete: UiFieldRenderer<TNode> = (field, context) => {
    const route = routeAutoCompleteField(field)
    if (route === 'dropDownList') return this.dropDownList(field, context)
    if (route === 'searchBox') return this.searchRelative(field, context)
    const reference = field.reference?.isRef ? field.reference : undefined
    return this.control(
      field,
      context,
      this.factory.autoComplete({
        value: autoCompleteBindValue(context.getFieldValue(field), {
          reference,
        }),
        ...autoCompletePropsFromField(field),
        disabled: context.isFieldReadonly(field),
        onChange: (value) => context.setFieldValue(field, value),
      }),
    )
  }

  tagAutoComplete: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.tagAutoComplete(tagAutoCompletePropsFromField(field, context)),
    )

  treeSelect: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.treeSelect(treeSelectPropsFromField(field, context)),
    )

  radioButtonGroup: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.radioButtonGroup(
        radioButtonGroupPropsFromField(field, context),
      ),
    )

  multiSelect: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiSelect(multiSelectPropsFromField(field, context)),
    )

  multiItemSelect: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiItemSelect(
        multiItemSelectPropsFromField(field, context),
      ),
    )

  multiValueSelect: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiValueSelect(
        multiValueSelectPropsFromField(field, context),
      ),
    )

  multiTextSelect: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiTextSelect(
        multiTextSelectPropsFromField(field, context),
      ),
    )

  multiBitSelect: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiBitSelect(multiBitSelectPropsFromField(field, context)),
    )

  checkBoxList: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.checkBoxList(checkBoxListPropsFromField(field, context)),
    )

  bitCheckBoxList: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.bitCheckBoxList(
        bitCheckBoxListPropsFromField(field, context),
      ),
    )

  checkBox: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.checkBox(checkBoxPropsFromField(field, context)),
    )

  switch: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.switch(switchPropsFromField(field, context)),
    )

  slider: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.slider(sliderPropsFromField(field, context)),
    )

  rating: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.rating(ratingPropsFromField(field, context)),
    )

  colorPicker: UiFieldRenderer<TNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.colorPicker(colorPickerPropsFromField(field, context)),
    )

  chips: UiFieldRenderer<TNode> = (field, context) =>
    this.factory.chips(chipsPropsFromField(field, context))

  tags = this.chips

  enumChipSet: UiFieldRenderer<TNode> = (field, context) =>
    this.factory.chips(enumChipSetPropsFromField(field, context))

  bitChipSet: UiFieldRenderer<TNode> = (field, context) =>
    this.factory.chips(bitChipSetPropsFromField(field, context))

  avatar: UiFieldRenderer<TNode> = (field, context) =>
    this.factory.avatar(avatarPropsFromField(field, context))

  progressBar: UiFieldRenderer<TNode> = (field, context) =>
    this.factory.progressBar(progressBarPropsFromField(field, context))
}
