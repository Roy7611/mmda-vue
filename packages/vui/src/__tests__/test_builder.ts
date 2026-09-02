import {
  defineComponent,
  h,
  ref,
  watch,
  type PropType,
  type VNode,
  type VNodeArrayChildren,
} from "vue";
import { SqlDataType, type MetaUi, type MetaUiField } from "@mmda/core";
import { AbstractUiBuilder } from "../ui/ui_builder";
import type { UiViewContext } from "../ui/ui_context";
import type { SigninFormProps, SigninFormSlots, SignupFormProps } from "../ui/ui_auth";
import type {
  AppSideBarProps,
  AppTopBarProps,
  ModuleBreadcrumbProps,
  ModuleSearchbarProps,
  ModuleToolbarProps,
} from "../ui/ui_app";
import type { UiFactory, UiFieldFactory } from "../ui/ui_factory";
import type { PropData, UiLayout, UiSlots } from "../ui/ui_layout";
import type { UiListPropsType } from "../ui/ui_list";
import type { UiSplitterPane, UiSplitterProps } from "../ui/ui_factory";
import { treeIdOf, treeLabelOf, type UiTreePropsType } from "../ui/ui_tree";
import type { SearchForRelativeProps, UiSearchField } from "../ui/ui_filter";

type UiContext = UiViewContext<any>;

const stub = (name: string, extra?: PropData): VNode =>
  h("span", { class: "mmda-html-stub", "data-unimplemented": name, ...extra }, "not implemented");

const testLayout: UiLayout = {
  fieldLayout: "vertical",
  fieldMessage: true,
  wrapManyGroup: true,
  maxCols: 12,
  cell: (child, nCol = 1) =>
    h("div", { class: "mmda-cell", style: { gridColumn: `span ${nCol}` } }, child as any),
  row: (children, nCols, props = {}) =>
    h(
      "div",
      {
        class: "mmda-row",
        style: {
          display: "grid",
          gridTemplateColumns: nCols.map((n) => `${n}fr`).join(" "),
          gap: "0.75rem",
        },
        ...props,
      },
      children,
    ),
  column: (children, props = {}) =>
    h(
      "div",
      {
        class: "mmda-column",
        style: { display: "flex", flexDirection: "column", gap: "0.75rem" },
        ...props,
      },
      children,
    ),
  grid: (children, _nCols, props = {}) =>
    h("div", { class: "mmda-grid", ...props }, children),
  listTile: (slots) =>
    h("div", { class: "mmda-list-tile" }, [
      slots.leading?.(),
      h("div", [slots.title(), slots.subtitle?.()]),
      slots.trailing?.(),
    ]),
};

const listedFields = (metaui: MetaUi) => {
  const listed = metaui.getListedFields();
  return listed.length
    ? listed
    : metaui.groups.filter((g) => !g.many).flatMap((g) => g.fields);
};

function createTestUiFactory(layout: UiLayout = testLayout): UiFactory {
  const button = (props: any, slots?: any) =>
    h(
      "button",
      {
        id: props.id,
        type: props.type ?? "button",
        title: props.tooltip,
        "aria-label": props["aria-label"] ?? props.tooltip,
        disabled: props.disabled === true || props.loading,
        class: ["mmda-button", props.colorRole && `is-${props.colorRole}`, props.class]
          .filter(Boolean)
          .join(" "),
        onClick: props.onClick ?? props.onAction ?? props.command,
      },
      slots?.default?.() ?? [
        props.icon && h("span", { class: ["mmda-icon", props.icon] }),
        props.label || null,
      ],
    );

  const table = <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) => {
    const fields = listedFields(metaui);
    return h("table", { class: "mmda-table" }, [
      h("thead", [h("tr", fields.map((field) => h("th", field.displayLabel)))]),
      h(
        "tbody",
        model.length
          ? model.map((row: any, index) =>
              h(
                "tr",
                {
                  key: props.itemKey?.(row) ?? row.id ?? index,
                  onClick: () => props.onItemClick?.(row),
                  onDblclick: () => props.onItemDoubleClick?.(row),
                },
                fields.map((field) =>
                  h(
                    "td",
                    props.renderCell
                      ? [props.renderCell(field, row, props)]
                      : String(row[field.fieldName] ?? ""),
                  ),
                ),
              ),
            )
          : [h("tr", [h("td", { colspan: Math.max(fields.length, 1) }, "No data")])],
      ),
    ]);
  };

  return {
    layout,
    actionIcons: {},
    viewIcons: {},
    dialogIcons: {},
    resolveIcon: (icon) => icon,
    textSpan: (text, props) => h("span", props, text),
    label: (text, props) => h("label", props, text),
    image: (src, props) => h("img", { src, ...props }),
    icon: (icon, props) => h("span", { class: ["mmda-icon", icon], ...props }),
    badge: ({ value, class: className, ...props }) =>
      h("span", { ...props, class: ["mmda-badge", className] }, String(value)),
    title: (text, props) => h("h1", props, text),
    subtitle: (text, props) => h("h2", props, text),
    link: (props, slots) =>
      h("a", props, slots?.default?.() ?? props.text ?? String(props.href ?? "")),
    input: (value, props = {}) =>
      h("input", {
        class: "mmda-factory-input",
        value: props.modelValue ?? value,
        ...props,
        onInput: (event: Event) => {
          const next = (event.target as HTMLInputElement).value;
          props["onUpdate:modelValue"]?.(next);
          props.onUpdate?.(next);
        },
      }),
    iconField: (value, props) => h("span", props, value),
    dropdown: () => stub("dropdown"),
    button,
    buttonGroup: (buttons, props) => h("div", props, buttons()),
    splitButton: (props) => button(props),
    menuButton: (buttonProps) => button(buttonProps),
    floatingActionButton: (props) => button(props),
    selectButton: (value, props) =>
      button({ ...props, label: String(value ?? props.label ?? "") }),
    actionButton: (action, _t, _resolve, props) =>
      button({ ...action, ...props, onClick: action.onAction }),
    paginator: () => stub("paginator"),
    list: <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) =>
      h(
        "ul",
        { class: "mmda-list" },
        model.map((item, index) =>
          h(
            "li",
            {
              onClick: () => props.onItemClick?.(item),
              onDblclick: () => props.onItemDoubleClick?.(item),
            },
            (props.item?.(item, index) ??
              String((item as any)[metaui.labelField ?? metaui.primaryKey] ?? "")) as any,
          ),
        ),
      ),
    tree: <T>(props: UiTreePropsType<T>) => h(TestTree, props as any),
    table,
    pagableTable: (loader, metadata, props) =>
      table(loader.model.list as any[], metadata.metaui, props as any),
    loading: (props) => h("div", { class: "mmda-loading", ...props }, "Loading…"),
    scrollbar: (content, props) =>
      h("div", { style: { overflow: "auto" }, ...props }, content as any),
    menu: () => stub("menu"),
    panelMenu: () => stub("panelMenu"),
    menubar: () => stub("menubar"),
    dialog: () => stub("dialog"),
    drawer: () => stub("drawer"),
    splitter: (panes, props) => renderTestSplitter(panes, props),
    searchForRelative: () => stub("searchForRelative"),
  } as UiFactory;
}

function createTestFieldFactory(): UiFieldFactory {
  const fallbackDisplay = (
    field: MetaUiField,
    context: UiContext,
    props: PropData = {},
  ) =>
    h(
      "output",
      { class: "mmda-field-display", ...props },
      String(context.displayField(field, props.row) ?? ""),
    );

  const fallbackInput = (field: MetaUiField, context: UiContext, props = {}) => {
    const value = context.getFieldValue(field);
    const isBool = SqlDataType.isBool(field.dataType);
    const isNumber = SqlDataType.isNum(field.dataType);
    const input = h("input", {
      id: field.fieldName,
      name: field.fieldName,
      type: isBool ? "checkbox" : isNumber ? "number" : "text",
      value: isBool ? undefined : (value ?? ""),
      checked: isBool ? Boolean(value) : undefined,
      disabled: context.isFieldReadonly(field),
      required: context.isFieldRequired(field),
      onInput: (event: Event) => {
        const element = event.target as HTMLInputElement;
        context.setFieldValue(
          field,
          isBool ? element.checked : isNumber ? element.valueAsNumber : element.value,
        );
      },
    });
    return h("div", { class: "mmda-field-input", ...props }, input);
  };

  return { fallbackDisplay, fallbackInput };
}

/** Test-only builder. Not a public vui skin. */
export class TestUiBuilder extends AbstractUiBuilder {
  constructor(
    factory = createTestUiFactory(),
    fieldFactory = createTestFieldFactory(),
    layout = factory.layout,
  ) {
    super(factory, fieldFactory, layout);
  }

  buildContainer(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("div", { class: "mmda-container", ...props }, content);
  }

  buildHeader(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("header", props, content);
  }

  buildAside(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("aside", props, content);
  }

  buildMain(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("main", props, content);
  }

  buildFooter(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("footer", props, content);
  }

  buildAppTopBar(_props: AppTopBarProps = { modules: [], logo: () => null }) {
    return stub("buildAppTopBar", { class: "mmda-app-topbar" });
  }

  buildAppSideBar(_props?: AppSideBarProps) {
    return stub("buildAppSideBar");
  }

  buildAppMenu() {
    return stub("buildAppMenu");
  }

  buildLoading(_context: UiContext, props?: PropData) {
    return h("div", { class: "mmda-loading", ...props }, "Loading…");
  }

  buildError(context: UiContext, props?: PropData) {
    return h("div", { class: "mmda-error", ...props }, context.title);
  }

  buildModuleBreadcrumb(context: UiContext, props: ModuleBreadcrumbProps) {
    const text = [context.title, props.label].filter(Boolean).join(" / ");
    return h("span", { class: "mmda-breadcrumb" }, text || context.title);
  }

  buildModuleToolbar(
    context: UiContext,
    props: ModuleToolbarProps,
    slots?: UiSlots,
  ) {
    return h("div", { class: "mmda-toolbar" }, [
      props.showBreadcrumb === false
        ? null
        : this.buildModuleBreadcrumb(context, {
            module: (context as any).module,
            label: props.breadcrumbLeaf || "",
          }),
      slots?.center?.(),
    ]);
  }

  buildSearchField(_field: UiSearchField) {
    return stub("buildSearchField");
  }

  buildSearchForm() {
    return stub("buildSearchForm");
  }

  buildModuleSearchbar(_context: UiContext, props: ModuleSearchbarProps) {
    return h("div", { class: "mmda-searchbar" }, [
      h("input", {
        class: "mmda-searchbar-input",
        type: "search",
        onChange: (event: Event) => {
          props.onSearch?.((event.target as HTMLInputElement).value);
        },
      }),
      h("button", {
        type: "button",
        class: "mmda-searchbar-refresh",
        onClick: () => props.onRefresh?.(),
      }),
    ]);
  }

  buildSearchForRelative(
    _context: UiContext,
    _field: MetaUiField,
    _props: SearchForRelativeProps,
  ) {
    return stub("buildSearchForRelative");
  }

  buildSigninForm(_props: SigninFormProps, _slots?: SigninFormSlots) {
    return stub("buildSigninForm");
  }

  buildSignupForm(_props: SignupFormProps) {
    return stub("buildSignupForm");
  }
}

function renderTestSplitter(panes: UiSplitterPane[], props: UiSplitterProps = {}) {
  return h(TestSplitter, {
    panes,
    orientation: props.orientation,
    splitterClass: props.class,
    collapseTick: props.collapseTick,
    onCollapsed: props.onCollapsed,
    onExpanded: props.onExpanded,
  });
}

const TestSplitter = defineComponent({
  name: "MmdaTestSplitter",
  props: {
    panes: { type: Array as PropType<UiSplitterPane[]>, required: true },
    orientation: { type: String as PropType<UiSplitterProps["orientation"]> },
    splitterClass: { type: String },
    collapseTick: { type: Number, default: 0 },
    onCollapsed: { type: Function as PropType<UiSplitterProps["onCollapsed"]> },
    onExpanded: { type: Function as PropType<UiSplitterProps["onExpanded"]> },
  },
  setup(props) {
    const collapsed = ref(props.panes.map((pane) => !!pane.collapsed));
    watch(
      () => props.collapseTick,
      (tick, prev) => {
        if (!tick || tick === prev) return;
        collapsed.value = collapsed.value.map((value, index) =>
          index === 0 ? true : value,
        );
      },
    );
    return () => {
      const vertical = props.orientation === "Vertical";
      return h(
        "div",
        {
          class: [
            "mmda-splitter",
            vertical ? "mmda-splitter--vertical" : "mmda-splitter--horizontal",
            props.splitterClass,
          ],
        },
        props.panes.flatMap((pane, index) => {
          const isCollapsed = collapsed.value[index];
          return [
            h(
              "div",
              {
                class: "mmda-splitter-pane",
                "data-collapsible": pane.collapsible ? "true" : undefined,
                "data-collapsed": isCollapsed ? "true" : undefined,
                style: isCollapsed
                  ? { display: "none" }
                  : index === 0
                    ? {
                        [vertical ? "height" : "width"]: pane.size ?? "16rem",
                        flex: "0 0 auto",
                      }
                    : { flex: "1 1 auto", minWidth: 0, minHeight: 0 },
              },
              pane.content,
            ),
            pane.collapsible && index === 0
              ? h("button", {
                  type: "button",
                  class: "mmda-splitter-collapse",
                  "aria-label": isCollapsed ? "expand" : "collapse",
                  onClick: () => {
                    const next = !collapsed.value[index];
                    collapsed.value = collapsed.value.map((value, i) =>
                      i === index ? next : value,
                    );
                    const event = { index, collapsed: next };
                    if (next) props.onCollapsed?.(event);
                    else props.onExpanded?.(event);
                  },
                })
              : null,
          ];
        }),
      );
    };
  },
});

const TestTree = defineComponent({
  name: "MmdaTestTree",
  props: {
    data: { type: Array, default: () => [] },
    fields: { type: Object, default: undefined },
    selected: { type: [String, Array], default: undefined },
    class: { type: String, default: "" },
    editing: { type: String, default: "" },
    contextMenu: { type: Function, default: undefined },
    showHoverAdd: { type: [Boolean, Function], default: undefined },
    onNodeSelect: { type: Function, default: undefined },
    onExpand: { type: Function, default: undefined },
    onNodeRename: { type: Function, default: undefined },
    onNodeAddChild: { type: Function, default: undefined },
  },
  setup(props: UiTreePropsType) {
    const menu = ref<{ items: { label: string; divider?: boolean }[] } | null>(
      null,
    );
    const hoverId = ref("");
    return () =>
      h("div", { class: "mmda-test-tree-host" }, [
        h(
          "ul",
          {
            class: ["mmda-tree", props.class],
            "data-has-context-menu": props.contextMenu ? "1" : undefined,
          },
          (props.data ?? []).map((node) => {
            const id = treeIdOf(node, props.fields);
            const editing = props.editing && id === String(props.editing);
            const canHover =
              Boolean(props.onNodeAddChild) &&
              props.showHoverAdd !== false &&
              (typeof props.showHoverAdd === "function"
                ? props.showHoverAdd(node)
                : true);
            return h(
              "li",
              {
                class: "mmda-tree-row",
                onClick: () => props.onNodeSelect?.(node),
                onMouseenter: () => {
                  hoverId.value = canHover ? id : "";
                },
                onMouseleave: () => {
                  hoverId.value = "";
                },
                onContextmenu: (event: MouseEvent) => {
                  event.preventDefault();
                  if (!props.contextMenu) {
                    menu.value = null;
                    return;
                  }
                  const items = props.contextMenu(node) ?? [];
                  menu.value = {
                    items: items.map((item) => ({
                      label: item.divider ? "" : (item.label ?? item.name ?? ""),
                      divider: Boolean(item.divider),
                    })),
                  };
                },
              },
              [
                h(
                  "button",
                  {
                    type: "button",
                    class: "mmda-tree-expand",
                    onClick: (event: Event) => {
                      event.stopPropagation();
                      props.onExpand?.(node);
                    },
                  },
                  ">",
                ),
                editing
                  ? h("input", {
                      class: "mmda-tree-rename-input",
                      value: treeLabelOf(node, props.fields),
                      onKeydown: (event: KeyboardEvent) => {
                        if (event.key === "Enter") {
                          props.onNodeRename?.(
                            node,
                            (event.target as HTMLInputElement).value,
                          );
                        }
                      },
                      onBlur: (event: Event) =>
                        props.onNodeRename?.(
                          node,
                          (event.target as HTMLInputElement).value,
                        ),
                    })
                  : h(
                      "span",
                      { class: "mmda-tree-label" },
                      treeLabelOf(node, props.fields),
                    ),
                canHover && hoverId.value === id
                  ? h(
                      "button",
                      {
                        type: "button",
                        class: "mmda-tree-hover-add",
                        onClick: (event: Event) => {
                          event.stopPropagation();
                          props.onNodeAddChild?.(node);
                        },
                      },
                      "+",
                    )
                  : null,
              ],
            );
          }),
        ),
        menu.value
          ? h(
              "div",
              { class: "mmda-test-tree-menu", role: "menu" },
              menu.value.items.map((item) =>
                item.divider
                  ? h("div", { class: "mmda-test-tree-menu-divider" })
                  : h("div", { class: "mmda-test-tree-menu-item" }, item.label),
              ),
            )
          : null,
      ]);
  },
});
