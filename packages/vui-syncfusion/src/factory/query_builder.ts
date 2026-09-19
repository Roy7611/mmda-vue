import { h } from "vue";
import { QueryBuilderComponent } from "@syncfusion/ej2-vue-querybuilder";
import type { UiQueryBuilderProps } from '@mmda/core';
import { emitQueryBuilderChange, queryBuilderColumnsOf, queryBuilderModifierClasses, queryBuilderValueOf } from "@mmda/vui"
import {
  advancedToQueryBuilderRule,
  queryBuilderColumnsToEj2,
  queryBuilderRuleToAdvanced,
} from "./ej2_query";
import { uiRenderProps } from "@mmda/core"

export function createQueryBuilder(props: UiQueryBuilderProps) {
  const {
    fields: _fields,
    columns: _columns,
    value: _value,
    modelValue: _modelValue,
    disabled,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const columns = queryBuilderColumnsOf(props);
  const cssClass = queryBuilderModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(QueryBuilderComponent as any, {
    ...rest,
    ...uiRenderProps(props).attributes,
    columns: queryBuilderColumnsToEj2(columns),
    rule: advancedToQueryBuilderRule(queryBuilderValueOf(props), columns),
    readonly: disabled === true,
    cssClass,
    change: (args: { rule?: unknown }) => {
      emitQueryBuilderChange(
        props,
        queryBuilderRuleToAdvanced(args?.rule as any),
      );
    },
  });
}
