import type { MetaUiField } from "@mmda/core";
import type { PropData } from "@mmda/vui";
import {
  DatePickerComponent,
  DateTimePickerComponent,
  TimePickerComponent,
} from "@syncfusion/ej2-vue-calendars";
import { control, type UiContext } from "./utils";

export const datePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(DatePickerComponent as any, field, context, props, {
    format: "yyyy-MM-dd",
  });

export const dateTimePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(DateTimePickerComponent as any, field, context, props, {
    format: "yyyy-MM-dd HH:mm:ss",
  });

export const monthPicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(DatePickerComponent as any, field, context, props, {
    start: "Year",
    depth: "Year",
    format: "yyyy-MM",
  });

export const timePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(TimePickerComponent as any, field, context, props, {
    format: "HH:mm:ss",
  });
