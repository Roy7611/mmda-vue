import { DEFAULT_PAGE_SIZE_OPTIONS, MetaUiFieldAlignmentEnum, SqlDataType, columnFilterKindOf, hasFilterType, resolveColumnFilterTypes, simpleFilterTypeOf, MetaUiFieldFilterType, type EntityFilterModel, type EntityFilterOperator, type MetaUi, type MetaUiField } from "@mmda/core";

export const EMPTY_SELECTION: unknown[] = [];

/** 稳定引用，避免 Pager 因 pageSizes 新数组而销毁重建下拉 */
export const STABLE_PAGE_SIZE_OPTIONS = DEFAULT_PAGE_SIZE_OPTIONS.map(String);

/**
 * 行虚拟滚动的缓冲块大小（非服务端 pageSize）。
 * EJ2：enableVirtualization 与 allowPaging 互斥，大页（如 1000）只能靠虚拟滚动减 DOM。
 */
export const VIRTUAL_ROW_PAGE_SIZE = 50;

/** 缺 listSize 时的占位列宽（不再在建表时 autoFit）。 */
export const DEFAULT_LIST_COLUMN_WIDTH = 120;

export const invoke = (value: unknown) =>
  typeof value === "function" ? (value as () => unknown)() : value;

/** 单位：优先 metacol.suffix；否则 formatter 若为纯单位文本（天、KG）也可用作后缀。 */
export const resolveFieldUnit = (field: MetaUiField): string => {
  const suffix = field.suffix?.trim();
  if (suffix) return suffix;
  const formatter = field.formatter?.trim();
  if (
    formatter &&
    formatter.length <= 12 &&
    !/[#0nNpPcCydDhHmMsSfF*?[\]]/.test(formatter)
  ) {
    return formatter;
  }
  return "";
};

export const listedFields = (metaUi: MetaUi) => {
  const fields = metaUi.getListedFields();
  return fields.length
    ? fields
    : metaUi.groups
        .filter((group) => !group.many)
        .flatMap((group) => group.fields);
};

export const gridColumnType = (field: MetaUiField) => {
  if (SqlDataType.isBool(field.dataType)) return "boolean";
  if (SqlDataType.isDateTime(field.dataType)) return "datetime";
  if (SqlDataType.isDate(field.dataType)) return "date";
  if (SqlDataType.isNum(field.dataType) && !field.reference) return "number";
  return "string";
};

/**
 * 日期列必须给非 null 的 format。EJ2 getCustomDateFormat 对 `typeof null === 'object'`
 * 会走对象分支并读 format.type，直接抛错。
 */
export const gridColumnFormat = (field: MetaUiField) => {
  if (field.formatter != null && field.formatter !== "") return field.formatter;
  if (SqlDataType.isDateTime(field.dataType)) {
    return { type: "dateTime", format: "yyyy-MM-dd HH:mm:ss" };
  }
  if (SqlDataType.isDate(field.dataType)) {
    return { type: "date", format: "yyyy-MM-dd" };
  }
  return undefined;
};

/** Left | Right | Center | Justify — 有 MetaUiField.align 用配置；否则数值右、枚举/其它左。 */
export const gridTextAlign = (
  field: MetaUiField,
): "Left" | "Right" | "Center" | "Justify" => {
  if (field.align) {
    const mapped = MetaUiFieldAlignmentEnum.valueOf(field.align);
    if (mapped) {
      return `${mapped.charAt(0).toUpperCase()}${mapped.slice(1)}` as
        | "Left"
        | "Right"
        | "Center"
        | "Justify";
    }
  }
  if (
    field.reference?.isEnum ||
    field.reference?.isRef ||
    field.reference?.hasOne
  ) {
    return "Left";
  }
  if (SqlDataType.isNum(field.dataType)) return "Right";
  return "Left";
};

export const gridTextAlignCss = (
  align: "Left" | "Right" | "Center" | "Justify",
) => align.toLowerCase();

export const gridFilterOperator = (operator?: string) => {
  const operators: Record<string, EntityFilterOperator> = {
    equal: "EQ",
    notequal: "NEQ",
    greaterthan: "GT",
    greaterthanorequal: "GE",
    lessthan: "LT",
    lessthanorequal: "LE",
    startswith: "STARTS_WITH",
    endswith: "ENDS_WITH",
    contains: "CONTAINS",
    doesnotcontain: "NOT_CONTAINS",
  };
  return operators[String(operator ?? "").toLowerCase()] ?? "EQ";
};

export const isChoiceFilterField = (field: MetaUiField) =>
  hasFilterType(
    resolveColumnFilterTypes(field),
    MetaUiFieldFilterType.SET,
  );

/** Column.template 名 ↔ Grid 命名 slot */
export const cellSlotName = (fieldName: string) =>
  `mmdaCell_${String(fieldName).replace(/[^\w]/g, "_")}`;

export const isEnumReference = (ref: NonNullable<MetaUiField["reference"]>) =>
  Boolean(ref.isEnum || (ref as { refType?: string }).refType === "ENUM");

/** EJ2 dropdownedit 默认 query 是 where(列名)+select(列名)。只清空 queries，保留原 Query 实例。 */
export const bindReferenceDropdown = (dropdown: any, rebuildList = false) => {
  if (!dropdown?.query) return;
  if (Array.isArray(dropdown.query.queries)) {
    dropdown.query.queries = [];
  }
  if (rebuildList) {
    try {
      dropdown.setListData?.(dropdown.dataSource);
    } catch {
      /* created 时 list 可能尚未挂上 */
    }
  }
};

/** Grid / TreeGrid 引用列编辑：选项只认 refOptions，值/标签只走 valueOf / labelOf。 */
export const referenceEditParams = (field: MetaUiField) => {
  const ref = field.reference;
  if (!ref) return undefined;
  const refFlds = ref.refFlds?.length ? ref.refFlds : ["value", "text"];
  const valueKey = refFlds[0] ?? "value";
  const textKey = refFlds[1] ?? valueKey;
  const options = [...(ref.refOptions ?? [])];
  if (isEnumReference(ref) && options.length === 0) return undefined;
  const dataSource = options.map((option) => {
    const value = ref.valueOf(option);
    return {
      ...(option as object),
      [valueKey]: value,
      [textKey]: String(ref.labelOf(option) ?? ""),
      [field.fieldName]: value,
    };
  });
  return {
    params: {
      dataSource,
      fields: { value: valueKey, text: textKey },
      allowFiltering: true,
      created() {
        bindReferenceDropdown(this, true);
      },
      beforeOpen() {
        bindReferenceDropdown(this);
      },
    },
  };
};

export const columnEditType = (field: MetaUiField) =>
  field.reference
    ? "dropdownedit"
    : SqlDataType.isBool(field.dataType)
      ? "booleanedit"
      : SqlDataType.isDateTime(field.dataType)
        ? "datetimepickeredit"
        : SqlDataType.isDate(field.dataType)
          ? "datepickeredit"
          : SqlDataType.isNum(field.dataType)
            ? "numericedit"
            : "defaultedit";

export const refreshRefEditParams = (column: any, field: MetaUiField) => {
  const edit = referenceEditParams(field);
  if (!edit || !column) return;
  column.edit = {
    ...(column.edit ?? {}),
    params: {
      ...(column.edit?.params ?? {}),
      ...edit.params,
    },
  };
};

export const choiceFilterDataSource = (field: MetaUiField) => {
  const ref = field.reference;
  if (!ref) return [];
  return (ref.refOptions ?? []).map((option) => ({
    [field.fieldName]: ref.valueOf(option),
    text: String(ref.labelOf(option) ?? ""),
    __mmdaChoice: true,
  }));
};

const flattenFilterPredicates = (
  predicates: any[] | undefined,
  parentJoin?: string,
): any[] => {
  const items: any[] = [];
  for (const predicate of predicates ?? []) {
    if (Array.isArray(predicate?.predicates) && predicate.predicates.length) {
      const join = String(predicate.condition ?? parentJoin ?? "and").toLowerCase();
      items.push(...flattenFilterPredicates(predicate.predicates, join));
      continue;
    }
    if (predicate?.field) items.push({ ...predicate, join: parentJoin });
  }
  return items;
};

const simpleTypeOf = (field: MetaUiField): "text" | "number" | "date" =>
  simpleFilterTypeOf(field);

const isSetLikeOperator = (operator: string) =>
  ["equal", "in", "notequal", "notin"].includes(operator);

const flattenValues = (items: any[]) =>
  items.flatMap((item) => (Array.isArray(item.value) ? item.value : [item.value]));

const toSimpleFilter = (item: any, field: MetaUiField) => ({
  filterType: simpleTypeOf(field),
  operator: gridFilterOperator(item.operator),
  value: item.value,
});

const joinOperatorOf = (items: any[]): "AND" | "OR" =>
  items.some((item) => String(item.join ?? "and").toLowerCase() === "or")
    ? "OR"
    : "AND";

const toCompareFilter = (items: any[], field: MetaUiField) => {
  if (items.length === 1) return toSimpleFilter(items[0], field);
  return {
    filterType: "join" as const,
    operator: joinOperatorOf(items),
    conditions: items.map((item) => toSimpleFilter(item, field)),
  };
};

const toSetFilter = (items: any[], field: MetaUiField) => {
  const operators = items.map((item) => String(item.operator ?? "").toLowerCase());
  const allNotEqual = operators.every(
    (op) => op === "notequal" || op === "notin",
  );
  return {
    filterType: "set" as const,
    operator: allNotEqual ? ("NOT_IN" as const) : ("IN" as const),
    values: flattenValues(items),
  };
};

export const gridFiltersToModel = (
  predicates: any[] | undefined,
  fields: MetaUiField[],
): EntityFilterModel => {
  const grouped = new Map<string, any[]>();
  for (const item of flattenFilterPredicates(predicates)) {
    const name = String(item.field);
    const list = grouped.get(name) ?? [];
    list.push(item);
    grouped.set(name, list);
  }

  const model: EntityFilterModel = {};
  for (const [fieldName, items] of grouped) {
    const field = fields.find((value) => value.fieldName === fieldName);
    if (!field) continue;
    if (columnFilterKindOf(field) === "boolean") {
      const item = items[items.length - 1];
      model[fieldName] = {
        filterType: "boolean",
        value: item.value == null ? null : Boolean(item.value),
      };
      continue;
    }
    const operators = items.map((item) =>
      String(item.operator ?? "").toLowerCase(),
    );
    const values = flattenValues(items);
    const lower = items.find((item) =>
      ["greaterthan", "greaterthanorequal"].includes(
        String(item.operator ?? "").toLowerCase(),
      ),
    );
    const upper = items.find((item) =>
      ["lessthan", "lessthanorequal"].includes(
        String(item.operator ?? "").toLowerCase(),
      ),
    );
    const compareType = simpleFilterTypeOf(field);
    if (
      (compareType === "date" || compareType === "number") &&
      lower &&
      upper
    ) {
      model[fieldName] = {
        filterType: compareType,
        operator: "BETWEEN",
        value: lower.value,
        valueTo: upper.value,
      };
      continue;
    }
    // SET 位现在也挂在 date/text（Excel 勾选）上，不能把单段 Menu equal 一律当成 set。
    // 纯 set 列、in/notin、数组值、或多段 equal → set；单段标量 equal → 比较条件。
    const kind = columnFilterKindOf(field);
    const setLikeCount = items.filter((item) =>
      isSetLikeOperator(String(item.operator ?? "").toLowerCase()),
    ).length;
    const compareItems = items.filter((item) => {
      const op = String(item.operator ?? "").toLowerCase();
      if (op === "in" || op === "notin") return false;
      if (Array.isArray(item.value) && isSetLikeOperator(op)) return false;
      if (kind === "set" && isSetLikeOperator(op)) return false;
      if (kind === "multi" && isSetLikeOperator(op) && setLikeCount > 1) {
        return false;
      }
      return true;
    });
    const setItems = items.filter((item) => !compareItems.includes(item));
    const allEqual = operators.every((op) => op === "equal" || op === "in");
    const allNotEqual = operators.every(
      (op) => op === "notequal" || op === "notin",
    );
    if (!compareItems.length && setItems.length) {
      model[fieldName] = toSetFilter(setItems, field);
      continue;
    }
    if (
      !setItems.length &&
      values.length &&
      (allEqual || allNotEqual) &&
      values.length > 1
    ) {
      model[fieldName] = toSetFilter(items, field);
      continue;
    }
    if (compareItems.length && setItems.length) {
      model[fieldName] = {
        filterType: "multi",
        filterModels: [toCompareFilter(compareItems, field), toSetFilter(setItems, field)],
      };
      continue;
    }
    model[fieldName] = toCompareFilter(compareItems.length ? compareItems : items, field);
  }
  return model;
};

/** EJ2 Button types-and-styles：`e-primary` / `e-success` / `e-info` / `e-warning` / `e-danger`，可与 `e-outline` / `e-flat` 叠用。无 colorRole 不加色。 */
export const cssClassFor = (role?: string) => {
  const roles: Record<string, string> = {
    primary: "e-primary",
    secondary: "e-secondary",
    success: "e-success",
    info: "e-info",
    warning: "e-warning",
    warn: "e-warning",
    danger: "e-danger",
    error: "e-danger",
  };
  return role ? roles[role] ?? "" : "";
};

/** EJ2 Vue Dialog：纯文本 header 经 compile 会渲染为空，需包一层 HTML。 */
export const dialogHeaderHtml = (value?: string) => {
  if (!value) return value;
  if (/<[^>]+>/.test(value)) return value;
  return `<span class="mmda-dialog__title">${value}</span>`;
};

export const buttonSurfaceClass = (buttonType?: string) => {
  if (buttonType === "text" || buttonType === "link") return "e-flat";
  if (buttonType === "outlined") return "e-outline";
  return "";
};

export const splitButtonSurfaceClass = (buttonType?: string) => {
  if (buttonType === "text" || buttonType === "link")
    return "mmda-split--flat";
  if (buttonType === "outlined") return "mmda-split--outline";
  if (buttonType === "tonal") return "mmda-split--tonal";
  return "";
};

export const splitButtonRoleClass = (props: {
  buttonType?: string;
  colorRole?: string;
  severity?: string;
  shape?: string;
}) => {
  const flat = props.buttonType === "text" || props.buttonType === "link";
  const role = props.colorRole ?? props.severity;
  if (flat && props.shape !== "round" && props.shape !== "circle") {
    if (role === "secondary") return "mmda-split--secondary";
    return "";
  }
  if (props.buttonType === "outlined") return "";
  return cssClassFor(role);
};

export const buttonRoleClass = (props: {
  buttonType?: string;
  colorRole?: string;
  severity?: string;
  shape?: string;
}) => {
  return cssClassFor(props.colorRole ?? props.severity);
};

export const normalizeAction = (action: any, t?: (key: string) => string): any => {
  if (action.divider === true) {
    return { separator: true };
  }
  return {
    text:
      action.label ??
      (action.name && t ? t(`action.${action.name}`) : action.name),
    iconCss: action.icon,
    disabled: action.disabled === true,
    separator: false,
    id: action.name,
    items: Array.isArray(action.items)
      ? action.items.map((child: any) => normalizeAction(child, t))
      : undefined,
  };
};

export const findAction = (actions: any[], id?: string): any => {
  if (!id) return undefined;
  for (const action of actions) {
    if (action.name === id || action.id === id || action.label === id)
      return action;
    if (Array.isArray(action.items)) {
      const nested = findAction(action.items, id);
      if (nested) return nested;
    }
  }
  return undefined;
};

export const normalizeMenuItem = (item: any): any => {
  if (!item || typeof item !== "object") return item;
  const children = Array.isArray(item.items)
    ? item.items.map((child: any) => normalizeMenuItem(child))
    : undefined;
  return {
    id: item.key ?? item.moduleCode,
    text: item.label,
    iconCss: item.icon,
    url: item.url,
    route: item.route,
    moduleCode: item.moduleCode,
    disabled: item.disabled,
    items: children?.length ? children : undefined,
  };
};

/** 按钮点击（添加/清除）前先提交所有原位编辑单元格，避免 Batch 未落盘就被 dataSource 刷新冲掉。 */
export const flushAllInplaceEdits = () => {
  if (typeof document === "undefined") return;
  document.querySelectorAll(".e-grid.mmda-table").forEach((element) => {
    const grid = (element as any).ej2_instances?.[0];
    if (!grid) return;
    try {
      grid.saveCell?.();
      grid.editModule?.saveCell?.();
    } catch {
      /* ignore */
    }
  });
};
