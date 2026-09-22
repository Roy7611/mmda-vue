import { createElement, type ReactElement } from "react";
import { QueryBuilderComponent } from "@syncfusion/ej2-react-querybuilder";
import {
  queryBuilderColumnsOf,
  queryBuilderModifierClasses,
  queryBuilderValueOf,
  type UiQueryBuilderProps,
} from "@mmda/core";
import {
  advancedToQueryBuilderRule,
  queryBuilderColumnsToEj2,
  queryBuilderRuleToAdvanced,
} from "./ej2_query";
import { joinClass, sfHtmlAttributes } from "./utils";

export function createQueryBuilder(props: UiQueryBuilderProps): ReactElement {
  const { disabled } = props;
  const columns = queryBuilderColumnsOf(props);
  return createElement(QueryBuilderComponent as any, {
    htmlAttributes: sfHtmlAttributes(props),
    columns: queryBuilderColumnsToEj2(columns),
    rule: advancedToQueryBuilderRule(queryBuilderValueOf(props), columns),
    readonly: disabled === true,
    cssClass: joinClass(queryBuilderModifierClasses(props)),
    change: (args: { rule?: unknown }) => {
      props.onChange?.(queryBuilderRuleToAdvanced(args?.rule as any));
    },
  });
}
