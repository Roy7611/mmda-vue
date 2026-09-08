import { h } from "vue";
import type { MetaUiField } from "@mmda/core";
import {
  numberInputPropsFromField,
  type PropData,
} from "@mmda/vui";
import { resolveFieldUnit } from "../factory/utils";
import { createNumberInput } from "../factory/number_input";
import { invalidOf, type UiContext } from "./utils";

const wrapNumber = (
  field: MetaUiField,
  context: UiContext,
  extra: PropData = {},
) => {
  const invalid = invalidOf(field, context);
  const suffix =
    extra.suffix != null && extra.suffix !== ""
      ? String(extra.suffix)
      : resolveFieldUnit(field);
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    createNumberInput(
      numberInputPropsFromField(field, context, {
        ...extra,
        ...(suffix ? { suffix } : {}),
      }),
    ),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

export const numberInput = (
  field: MetaUiField,
  context: UiContext,
  props: PropData = {},
) => wrapNumber(field, context, props);

export const percentInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrapNumber(field, context, {
    kind: "percent",
    min: 0,
    max: 1,
    ...props,
  });
