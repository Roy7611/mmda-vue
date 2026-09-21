import { h } from "vue";
import type { MetaUiField } from "@mmda/core";
import { numberInputPropsFromField } from "@mmda/core"
import { type UiProps } from "@mmda/vui"
import { resolveFieldUnit } from "../factory/utils";
import { createNumberInput } from "../factory/number_input";
import { invalidOf, type UiContext } from "./utils";

const wrapNumber = (
  field: MetaUiField,
  context: UiContext
) => {
  const invalid = invalidOf(field, context);
  const suffix = resolveFieldUnit(field);
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    createNumberInput({
      ...numberInputPropsFromField(field, context),
      ...(suffix ? { suffix } : {}),
    },
    ),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
};

export const numberInput = (
  field: MetaUiField,
  context: UiContext,
  props: UiProps = {},
) => wrapNumber(field, context);

export const percentInput = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapNumber(field, context, {
    kind: "percent",
    min: 0,
    max: 1,
    ...props,
  });
