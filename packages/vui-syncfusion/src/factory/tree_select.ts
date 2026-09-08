import { h, reactive } from "vue";
import { DropDownTreeComponent } from "@syncfusion/ej2-vue-dropdowns";
import type { UiTreeSelectProps } from "@mmda/vui";
import {
  htmlAttributesOf,
  treeSelectNodesOf,
  type UiTreeFields,
} from "@mmda/vui";

function idKey(fields?: UiTreeFields) {
  return typeof fields?.id === "string" ? fields.id : "id";
}

function textKey(fields?: UiTreeFields) {
  return typeof fields?.label === "string" ? fields.label : "label";
}

function childKey(fields?: UiTreeFields) {
  return typeof fields?.children === "string" ? fields.children : "children";
}

function sfMode(display?: UiTreeSelectProps["selectedDisplay"]) {
  if (display === "chips") return "Box";
  if (display === "delimiter") return "Delimiter";
  if (display === "custom") return "Custom";
  return "Default";
}

function sfValue(props: UiTreeSelectProps): string[] {
  const raw = props.value ?? props.modelValue;
  if (props.selectionMode === "checkbox") {
    const list = Array.isArray(raw) ? raw : raw == null || raw === "" ? [] : [raw];
    return list.map(String);
  }
  if (raw == null || raw === "") return [];
  return [String(raw)];
}

function emitValue(props: UiTreeSelectProps, ids: string[]) {
  const next =
    props.selectionMode === "checkbox" ? ids : (ids[0] ?? null);
  props.onChange?.(next);
  props["onUpdate:modelValue"]?.(next);
  props.onUpdate?.(next);
}

export function createTreeSelect(props: UiTreeSelectProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    data: _data,
    fields,
    placeholder,
    disabled,
    allowFiltering,
    selectionMode,
    showClear,
    selectedDisplay,
    delimiter,
    popupHeight,
    popupWidth,
    showSelectAll,
    selectAllLabel,
    header,
    item,
    selected,
    loadMode,
    onExpand,
    loadRoots,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    treeShape: _treeShape,
    shapeKey: _shapeKey,
    ...rest
  } = props;

  const checkbox = selectionMode === "checkbox";
  const nodes = reactive(treeSelectNodesOf(props) as any[]);
  if (loadMode === "lazy" && loadRoots) {
    void Promise.resolve(loadRoots()).then((rows) => {
      nodes.splice(0, nodes.length, ...((rows ?? []) as any[]));
    });
  }

  const cssClass = ["mmda-tree-select", props.class]
    .flat()
    .filter(Boolean)
    .join(" ");

  const mappedFields: Record<string, unknown> = {
    dataSource: nodes,
    value: idKey(fields),
    text: textKey(fields),
    child: childKey(fields),
  };
  if (typeof fields?.icon === "string") mappedFields.iconCss = fields.icon;
  if (typeof fields?.parentId === "string") {
    mappedFields.parentValue = fields.parentId;
  }

  return h(DropDownTreeComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    fields: mappedFields,
    value: sfValue(props),
    placeholder,
    enabled: disabled !== true,
    allowFiltering: allowFiltering !== false,
    showCheckBox: checkbox,
    allowMultiSelection: checkbox,
    showClearButton: showClear !== false,
    mode: sfMode(selectedDisplay),
    delimiterChar: delimiter,
    popupHeight,
    popupWidth,
    showSelectAll: checkbox ? showSelectAll : false,
    selectAllText: selectAllLabel,
    cssClass,
    headerTemplate: header,
    itemTemplate: item,
    customTemplate: selected,
    treeSettings: {
      autoCheck: checkbox,
      loadOnDemand: loadMode === "lazy",
    },
    nodeExpanding: (args: { node?: unknown }) => {
      const node = (args?.node as { src?: unknown })?.src ?? args?.node;
      if (node != null) void Promise.resolve(onExpand?.(node));
    },
    change: (args: { value?: string[] }) => {
      emitValue(props, (args?.value ?? []).map(String));
    },
  });
}

export function createDropDownTree(props: UiTreeSelectProps) {
  return createTreeSelect(props);
}
