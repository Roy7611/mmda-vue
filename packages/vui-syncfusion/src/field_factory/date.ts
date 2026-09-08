import { h } from "vue";
import type { MetaUiField } from "@mmda/core";
import {
  datePickerPropsFromField,
  dateRangePickerPropsFromField,
  dateTimePickerPropsFromField,
  monthPickerPropsFromField,
  timePickerPropsFromField,
  type PropData,
} from "@mmda/vui";
import { createDatePicker } from "../factory/date_picker";
import { createDateTimePicker } from "../factory/date_time_picker";
import { createTimePicker } from "../factory/time_picker";
import { createDateRangePicker } from "../factory/date_range_picker";
import { invalidOf, type UiContext } from "./utils";

const wrap = (field: MetaUiField, context: UiContext, child: ReturnType<typeof h>) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    child,
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

export const datePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrap(
    field,
    context,
    createDatePicker(datePickerPropsFromField(field, context, props ?? {})),
  );

export const dateTimePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrap(
    field,
    context,
    createDateTimePicker(
      dateTimePickerPropsFromField(field, context, props ?? {}),
    ),
  );

export const monthPicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrap(
    field,
    context,
    createDatePicker(monthPickerPropsFromField(field, context, props ?? {})),
  );

export const timePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrap(
    field,
    context,
    createTimePicker(timePickerPropsFromField(field, context, props ?? {})),
  );

export const dateRangePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrap(
    field,
    context,
    createDateRangePicker(
      dateRangePickerPropsFromField(field, context, props ?? {}),
    ),
  );
