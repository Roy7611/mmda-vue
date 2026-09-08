import { h, type VNode } from "vue";

export type PlainTableColumn = {
  header?: unknown;
  field?: string;
  style?: unknown;
  expander?: boolean;
  body?: (slot: { data: any; index: number }) => unknown;
};

export function plainTableColumn(
  props: PlainTableColumn,
  slots?: { body?: PlainTableColumn["body"] },
): PlainTableColumn {
  return { ...props, body: slots?.body ?? props.body };
}

export function renderPlainTable(
  data: any[] = [],
  columns: PlainTableColumn[] = [],
  props: Record<string, any> = {},
  slots?: {
    expansion?: (slot: { data: any; index: number }) => unknown;
    empty?: () => unknown;
  },
): VNode {
  const expansion = slots?.expansion ?? props.expansion;
  const expandedRows = props.expandedRows as Record<string, unknown> | undefined;
  const dataKey = props.dataKey;
  const rowKeyOf = (row: any, index: number) => {
    if (typeof dataKey === "function") return String(dataKey(row));
    if (typeof dataKey === "string") return String(row?.[dataKey] ?? index);
    return String(row?.id ?? index);
  };
  if (!(data ?? []).length && slots?.empty) {
    return h(
      "div",
      { class: ["mmda-plain-table", props.class], style: props.style },
      slots.empty() as any,
    );
  }
  return h(
    "div",
    { class: ["mmda-plain-table", props.class], style: props.style },
    [
      h("table", { class: "mmda-plain-table__table" }, [
        h(
          "thead",
          h(
            "tr",
            columns.map((col, i) =>
              h(
                "th",
                { key: col.field ?? i, style: col.style as any },
                typeof col.header === "function"
                  ? (col.header as () => unknown)()
                  : ((col.header ?? col.field) as any),
              ),
            ),
          ),
        ),
        h(
          "tbody",
          (data ?? []).flatMap((row, index) => {
            const key = rowKeyOf(row, index);
            const cells = h(
              "tr",
              {
                key,
                onDblclick: () => props.onItemDoubleClick?.(row),
              },
              columns.map((col, i) =>
                h(
                  "td",
                  { key: col.field ?? i, style: col.style as any },
                  col.body
                    ? (col.body({ data: row, index }) as any)
                    : row?.[col.field as string],
                ),
              ),
            );
            if (!expansion || !expandedRows?.[key]) return [cells];
            return [
              cells,
              h("tr", { key: `${key}-detail` }, [
                h(
                  "td",
                  { colspan: columns.length },
                  expansion({ data: row, index }) as any,
                ),
              ]),
            ];
          }),
        ),
      ]),
    ],
  );
}
