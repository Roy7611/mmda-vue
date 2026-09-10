import type { MetaUiField, MetaUiGroup, UiFieldValidation, UiValidation } from "@mmda/core";
import type { Constructor } from "./types";

export function WithValidate<TBase extends Constructor>(Base: TBase) {
  return class Validate extends Base {
    async validate() {
      let valid = true;
      for (const group of this.metaUi.groups) {
        if ((await this.validateGroup(group)) > 0) valid = false;
      }
      const summary = (this.validationState.summary ??= { errorNum: 0 });
      summary.errorNum = valid
        ? 0
        : this.countValidationErrors(this.validationState);
      return valid;
    }

    validateField(
      field: MetaUiField | string,
      value = this.getFieldValue(field),
    ) {
      const fld = this.resolveField(field);
      return this.validateSingleField(
        fld,
        value,
        this.model as Record<string, any>,
        this.validationState,
      );
    }

    async validateGroup(group: MetaUiGroup | string) {
      const grp = this.resolveGroup(group);
      if (this.isGroupHidden(grp)) return 0;
      if (!grp.many) {
        return grp.fields.reduce(
          (count: number, field: MetaUiField) =>
            count +
            this.validateSingleField(
              field,
              this.getFieldValue(field),
              this.model as Record<string, any>,
              this.validationState,
            ),
          0,
        );
      }

      const rows =
        ((this.model as Record<string, any>)[grp.groupName] as Record<
          string,
          any
        >[]) ?? [];
      const groupState = (this.validationState[grp.groupName] ??=
        {}) as UiValidation;
      let errorCount = grp.requiredAny && rows.length === 0 ? 1 : 0;
      rows.forEach((row, index) => {
        const rowKey = String(row.rowNum ?? row.id ?? index);
        const rowState = (groupState[rowKey] ??= {
          rowNum: rowKey,
          summary: { errorNum: 0 },
        }) as UiValidation;
        const rowContext = this.subGroupItemContext(grp, row);
        let rowErrors = 0;
        for (const field of grp.groupUi?.groups.flatMap((g: MetaUiGroup) => g.fields) ?? []) {
          rowErrors += rowContext.validateSingleField(
            field,
            rowContext.getFieldValue(field),
            row,
            rowState,
          );
        }
        const summary = (rowState.summary ??= { errorNum: 0 });
        summary.errorNum = rowErrors;
        errorCount += rowErrors;
      });
      return errorCount;
    }

    resetValidation() {
      for (const state of Object.values(this.validationState)) {
        if (state && typeof state === "object" && "touched" in state) {
          (state as UiFieldValidation).touched = false;
          (state as UiFieldValidation).message = "";
          if ("warning" in state) (state as UiFieldValidation).warning = "";
        }
      }
    }

    hasFieldError(field: MetaUiField | string) {
      return this.getInvalidMessage(field) !== "";
    }

    isInvalid(field: MetaUiField | string) {
      const state = this.validationState[this.resolveField(field).fieldName];
      return !!(
        state &&
        typeof state === "object" &&
        "touched" in state &&
        (state as UiFieldValidation).touched &&
        (state as UiFieldValidation).message
      );
    }

    getInvalidMessage(field: MetaUiField | string) {
      const state = this.validationState[this.resolveField(field).fieldName];
      return state &&
        typeof state === "object" &&
        "message" in state &&
        typeof (state as UiFieldValidation).message === "string"
        ? (state as UiFieldValidation).message
        : "";
    }

    getFieldError(field: MetaUiField | string) {
      return this.getInvalidMessage(field);
    }

    setFieldError(field: MetaUiField | string, error: string) {
      const name = this.resolveField(field).fieldName;
      const state = (this.validationState[name] ??= {
        touched: true,
        message: "",
      }) as UiFieldValidation;
      state.touched = true;
      state.message = error;
    }

    hasGroupError(group: MetaUiGroup | string) {
      const state = this.validationState[this.resolveGroup(group).groupName];
      return this.countValidationErrors(state) > 0;
    }

    collectInvalidMessages(value: unknown = this.validationState): string[] {
      if (!value || typeof value !== "object") return [];
      if ("touched" in value && "message" in value) {
        const message = (value as UiFieldValidation).message;
        return message ? [this.translate(String(message))] : [];
      }
      const out: string[] = [];
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        if (key === "summary" || key === "rowNum") continue;
        if (
          child &&
          typeof child === "object" &&
          "touched" in child &&
          "message" in child
        ) {
          const message = (child as UiFieldValidation).message;
          if (!message) continue;
          let label = key;
          try {
            const field = this.resolveField(key);
            label = this.t(field.displayLabel) || key;
          } catch {
            /* nested / unknown key */
          }
          out.push(`${label}：${this.translate(String(message))}`);
          continue;
        }
        out.push(...this.collectInvalidMessages(child));
      }
      return out;
    }
  };
}
