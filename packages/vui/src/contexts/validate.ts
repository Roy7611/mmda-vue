// @ts-nocheck
import type { MetaUiField, MetaUiGroup, UiFieldValidation } from "@mmda/core";
import type { UiViewContext } from "./view_context";

type Host = UiViewContext<any>;

export function attachContextValidate(ctor: { prototype: Host }) {
  Object.assign(ctor.prototype, {
    async validate() {
      let valid = true;
      for (const group of this.metaui.groups) {
        if ((await this.validateGroup(group)) > 0) valid = false;
      }
      const summary = (this.validationState.summary ??= { errorNum: 0 });
      summary.errorNum = valid
        ? 0
        : this.countValidationErrors(this.validationState);
      return valid;
    },

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
    },

    async validateGroup(group: MetaUiGroup | string) {
      const grp = this.resolveGroup(group);
      if (this.isGroupHidden(grp)) return 0;
      if (!grp.many) {
        return grp.fields.reduce(
          (count, field) =>
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
        const rowContext = this.subGroupItemContext(grp, row as Entity);
        let rowErrors = 0;
        for (const field of grp.groupUi?.groups.flatMap((g) => g.fields) ?? []) {
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
    },

    resetValidation() {
      for (const state of Object.values(this.validationState)) {
        if (state && typeof state === "object" && "touched" in state) {
          state.touched = false;
          state.message = "";
          if ("warning" in state) state.warning = "";
        }
      }
    },

    hasFieldError(field: MetaUiField | string) {
      return this.getInvalidMessage(field) !== "";
    },

    isInvalid(field: MetaUiField | string) {
      const state = this.validationState[this.resolveField(field).fieldName];
      return !!(
        state &&
        typeof state === "object" &&
        "touched" in state &&
        state.touched &&
        state.message
      );
    },

    getInvalidMessage(field: MetaUiField | string) {
      const state = this.validationState[this.resolveField(field).fieldName];
      return state &&
        typeof state === "object" &&
        "message" in state &&
        typeof state.message === "string"
        ? state.message
        : "";
    },

    getFieldError(field: MetaUiField | string) {
      return this.getInvalidMessage(field);
    },

    setFieldError(field: MetaUiField | string, error: string) {
      const name = this.resolveField(field).fieldName;
      const state = (this.validationState[name] ??= {
        touched: true,
        message: "",
      }) as UiFieldValidation;
      state.touched = true;
      state.message = error;
    },
    hasGroupError(group: MetaUiGroup | string) {
      const state = this.validationState[this.resolveGroup(group).groupName];
      return this.countValidationErrors(state) > 0;
    },
  });
}
