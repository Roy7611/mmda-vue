// @ts-nocheck
import { h, type VNode, type VNodeChild } from "vue";
import {
  MetaModel,
  SqlDataType,
  auth,
  type MetaUiField,
  type MetaUiGroup,
} from "@mmda/core";
import {
  layoutField,
  layoutFieldGroup,
  layoutPage,
  type FieldGroupDirection,
  type PropData,
  type UiDirection,
} from "../ui_layout";
import { isImageGalleryShape } from "../ui_tree_data";
import { treeGridSpecFromGroup } from "../ui_tree_grid";
import { isActionEnabled } from "../ui_action";
import { MmdaGroupCard } from "../components/GroupCard";
import { translateMessage } from "../../i18n/i18n";
import { UiViewContext } from "../ui_context";
import type { UiViewPropsType } from "../ui_view";
import type { UiGanttChartProps, UiGanttViewProps } from "../ui_gantt";
import {
  groupZone,
  hiddenDeletedSubRowStyle,
  sortViewGroups,
  uploadedFileNames,
  type UiContext,
} from "./helpers";
import type { VueUiBuilderHost } from "../ui_builder";

type Host = VueUiBuilderHost;

export function attachFormBuilder(ctor: { prototype: Host }) {
  Object.assign(ctor.prototype, {
    labelFor(field: MetaUiField, props?: PropData) {
      return h(
        "label",
        { for: field.fieldName, key: field.fieldName, ...props },
        field.displayLabel,
      );
    },
    
    editFor(field: MetaUiField, context: UiContext, props: PropData = {}) {
      const logic = context.getFieldLogic(field) as any;
      const renderer =
        logic?.customEditor ??
        (field.editor ? this.fldFactory[field.editor] : undefined) ??
        this.fldFactory.fallbackInput;
      return renderer(field, context, props);
    },
    
    fieldDisplayName(field: MetaUiField) {
      if (field.renderer) return field.renderer;
      if (SqlDataType.isBool(field.dataType)) return "checkedIcon";
      return "textSpan";
    },
    
    displayFor(field: MetaUiField, context: UiContext, props: PropData = {}) {
      const logic = context.getFieldLogic(field) as any;
      const renderer =
        logic?.customRenderer ??
        this.fldFactory[this.fieldDisplayName(field)] ??
        this.fldFactory.fallbackDisplay;
      return renderer(field, context, props);
    },
    
    buildField(field, context, props = {}) {
      if (context.isFieldHidden(field)) return h("span", { hidden: true });
      const {
        editing: editingProp,
        direction,
        isReadonly,
        ...controlProps
      } = props;
      const editing = editingProp ?? context.editing;
      // 对齐老代码：编辑页中只读字段走 renderer（文本），不用 editor
      const useEditor = editing && !context.isFieldReadonly(field) && !isReadonly;
      const control = useEditor
        ? this.editFor(field, context, controlProps)
        : this.displayFor(field, context, controlProps);
      const runtime = context as any;
      const invalid = useEditor && runtime.isInvalid?.(field);
      const message =
        invalid && this.layout.fieldMessage
          ? h(
              "small",
              { class: "mmda-field-error" },
              runtime.getInvalidMessage?.(field),
            )
          : undefined;
      return layoutField({
        label: this.labelFor(field),
        control,
        message,
        direction:
          (direction as UiDirection | undefined) ?? this.layout.fieldLayout,
        props: { key: field.fieldName },
      });
    },
    
    buildResponsiveField(field, context, props = {}) {
      return this.buildField(field, context, props);
    },
    
    groupWrapClass(group: MetaUiGroup, props: PropData = {}) {
      const raw = String(props.region ?? groupZone(group));
      // accept legacy region names from callers
      const zone =
        raw === "secondary" || raw === "summary" ? "secondary" : "primary";
      const many = props.many === true || group.many;
      return ["mmda-group", many ? "sub" : "master", zone, props.class]
        .filter(Boolean)
        .join(" ");
    },
    
    /** 组内容容器：字段/表格布局归这里管，Card 只做外壳 */
    wrapGroupContent(body: VNode | VNode[], props: PropData = {}) {
      return h(
        "div",
        { class: ["mmda-group-body", props.class].filter(Boolean) },
        body,
      );
    },
    
    /** FieldSet 外壳：骑边 legend（经典） */
    buildGroupFieldSet(
      group: MetaUiGroup,
      body: VNode | VNode[],
      props: PropData = {},
    ) {
      const {
        container: _container,
        region: _region,
        many: _many,
        direction: _direction,
        cols: _cols,
        class: _className,
        ...rest
      } = props;
      return h(
        "fieldset",
        { class: this.groupWrapClass(group, props), ...rest },
        [
          h("legend", { class: "mmda-group-title" }, group.groupLabel),
          this.wrapGroupContent(body),
        ],
      );
    },
    
    /** Card 外壳：可折叠 header；内容由 wrapGroupContent 自管布局 */
    buildGroupCard(
      group: MetaUiGroup,
      body: VNode | VNode[],
      props: PropData = {},
    ) {
      const {
        container: _container,
        region: _region,
        many: _many,
        direction: _direction,
        cols: _cols,
        class: _className,
        headerActions,
        ...rest
      } = props;
      return h(
        MmdaGroupCard,
        {
          title: group.groupLabel,
          expanded: group.expanded !== false,
          class: this.groupWrapClass(group, props),
          ...rest,
        },
        {
          default: () => this.wrapGroupContent(body),
          actions: headerActions ? () => headerActions : undefined,
        },
      );
    },
    
    /** 子表 header 工具栏（对齐老代码 Panel icons）— 平面图标，文案进 tooltip */
    buildGroupHeaderActions(group: MetaUiGroup, context: UiContext) {
      const runtime = context as UiViewContext;
      const actions = runtime.getGroupActions?.(group) ?? [];
      if (!actions.length) return undefined;
      const t = (message: any) => context.t(message);
      return h(
        "div",
        { class: "mmda-group-action-group" },
        actions.map((action) => {
          const label = action.label
            ? t(action.label)
            : action.name
              ? t(`action.${action.name}`)
              : action.name;
          return this.factory.actionButton(action, t, true, {
            id: `${action.name}-${group.groupName}-button`,
            label: "",
            tooltip: action.tooltip ?? label,
            buttonType: "text",
            shape: "round",
            class: "mmda-group-action",
            "aria-label": label,
            disabled: !isActionEnabled(action, context.model, context),
          });
        }),
      );
    },
    
    wrapGroup(group: MetaUiGroup, body: VNode | VNode[], props: PropData = {}) {
      const shell = props.container ?? "card";
      if (shell === "fieldset") {
        return this.buildGroupFieldSet(group, body, props);
      }
      return this.buildGroupCard(group, body, props);
    },
    
    buildGroup(group, context, children, props = {}) {
      if (context.isGroupHidden(group)) return h("span", { hidden: true });
      const {
        direction = group.isSecondary() ? "column" : "row",
        cols = group.isSecondary() ? 1 : 2,
        container = "card",
        class: className,
        showGroupActions = true,
        ...fieldProps
      } = props;
      const wrapProps: PropData = {
        container,
        class: className,
        region: groupZone(group),
        many: group.many,
      };
      if (group.many && group.groupUi) {
        const rows =
          ((context.model as Record<string, any>)[group.groupName] as any[]) ??
          [];
        const groupCtx = (context as UiViewContext).subGroupContext(group);
        const readOnlyRows = !context.editing;
        const groupLogic = context.getGroupLogic(group) as any;
        const customGroupView = context.editing
          ? (groupLogic?.customEditor ?? groupLogic?.customRenderer)
          : groupLogic?.customRenderer;
        if (typeof customGroupView === "function") {
          if (showGroupActions !== false) {
            wrapProps.headerActions = this.buildGroupHeaderActions(
              group,
              context,
            );
          }
          return this.wrapGroup(
            group,
            customGroupView(group, context, props),
            wrapProps,
          );
        }
        if (
          isImageGalleryShape(group.displayShape) &&
          this.factory.imageGallery
        ) {
          const shapeKey = group.shapeKey || "mediaFile";
          const uploadMediaFiles = async (
            files: File[],
            control: {
              signal: AbortSignal;
              onProgress: (progress: number) => void;
            },
          ) => {
            const runtime = context as any;
            const fetchApi = runtime.app?.api?.fetchApi;
            const logic = runtime.logic;
            const modelId = runtime.model?.id;
            let response: any;
            if (runtime.uploading?.value != null) runtime.uploading.value = true;
            try {
              if (
                fetchApi?.uploadFiles &&
                logic?.buildEntityURL &&
                modelId != null
              ) {
                const url = logic.buildEntityURL({
                  service: "files",
                  path: String(modelId),
                  action: "multi",
                });
                response = await fetchApi.uploadFiles(
                  url,
                  files.map((file) => ({
                    fieldName: "files",
                    data: file,
                    fileName: file.name,
                  })),
                  {
                    signal: control.signal,
                    onUploadProgress: (event: {
                      loaded: number;
                      total?: number;
                      progress?: number;
                    }) => {
                      const ratio =
                        event.progress ??
                        (event.total ? event.loaded / event.total : 0);
                      control.onProgress(ratio * 100);
                    },
                  },
                );
              } else if (typeof runtime.uploadFiles === "function") {
                response = await runtime.uploadFiles(files, {
                  repository: logic?.repository,
                  path: modelId,
                  action: "multi",
                  service: "files",
                });
              } else {
                throw new Error(translateMessage("upload.unsupported"));
              }
    
              const urls = await uploadedFileNames(response);
              if (urls.length !== files.length || urls.some((url) => !url)) {
                throw new Error(translateMessage("upload.fileCountMismatch"));
              }
              const added = [];
              for (let index = 0; index < urls.length; index += 1) {
                const item = await runtime.createSubGroupItems({
                  group,
                  source: {
                    [shapeKey]: urls[index],
                    mediaType: 0,
                    description: files[index]?.name ?? "",
                  },
                  target: runtime.model,
                });
                runtime.addSubGroupItem(group, item);
                added.push(item);
              }
              return added;
            } finally {
              if (runtime.uploading?.value != null)
                runtime.uploading.value = false;
            }
          };
          const gallery = this.factory.imageGallery(
            rows
              .map((row) => ({
                src: String(row?.[shapeKey] ?? ""),
                thumbnail: String(row?.thumbnail ?? row?.[shapeKey] ?? ""),
                alt: String(row?.description ?? ""),
                title: String(row?.description ?? ""),
                description: String(row?.description ?? ""),
                data: row,
              }))
              .filter((item) => item.src),
            {
              onItemDblclick: (item: { data?: unknown }) =>
                (context as any).subGroupItem?.(group, item.data),
            },
          );
          const uploader =
            context.editing && this.factory.filesUploader
              ? this.factory.filesUploader({
                  upload: uploadMediaFiles,
                  multiple: true,
                  autoUpload: true,
                  disabled: (context.model as any)?.id == null,
                  allowedExtensions: ".bmp,.gif,.jpeg,.jpg,.png,.webp",
                  dropText:
                    (context.model as any)?.id == null
                      ? (context.translate("upload.saveBeforeImage") as string)
                      : (context.translate("upload.dropImages") as string),
                  chooseText: context.translate("action.chooseImage") as string,
                  onSuccess: () =>
                    (context as any).app?.toast(context as any, {
                      severity: "success",
                      detail: context.translate("upload.imageSuccess"),
                      life: 3000,
                    }),
                  onError: (error: unknown) =>
                    (context as any).app?.toast(context as any, {
                      severity: "error",
                      detail:
                        error instanceof Error
                          ? error.message
                          : (context.translate("upload.imageFail") as string),
                      life: 3000,
                    }),
                })
              : undefined;
          if (showGroupActions !== false) {
            wrapProps.headerActions = this.buildGroupHeaderActions(
              group,
              context,
            );
          }
          return this.wrapGroup(
            group,
            layoutFieldGroup({
              fields: [uploader, gallery].filter(Boolean) as VNode[],
              direction: "table",
              cols: 1,
            }),
            wrapProps,
          );
        }
        const nativeGridEditing = this.factory.nativeInplaceEdit === true;
        const nativeInplaceEdit =
          nativeGridEditing && groupLogic?.inplaceEditable !== false;
        const listedFields = group.groupUi.getListedFields();
        const tableFields = listedFields.length
          ? listedFields
          : group.groupUi.groups
              .filter((childGroup) => !childGroup.many)
              .flatMap((childGroup) => childGroup.fields);
        const editableFields = tableFields
          .filter((field) => {
            const fieldLogic = groupCtx.getFieldLogic(field) as any;
            return (
              !readOnlyRows &&
              (nativeGridEditing
                ? nativeInplaceEdit && fieldLogic?.inplaceEditable !== false
                : fieldLogic?.inplaceEditable === true) &&
              !groupCtx.isFieldReadonly(field) &&
              !groupCtx.isFieldHidden(field)
            );
          })
          .map((field) => field.fieldName);
        const treeSpec = treeGridSpecFromGroup(group, rows);
        const gridProps = {
            enableSort: false,
            enableGroup: false,
            showGridlines: true,
            readOnlyRows,
            inplaceEdit: nativeGridEditing,
            inplaceEditStart: groupLogic?.inplaceEditStart ?? "excel",
            editableFields,
            canEditCell: (item: any, field: MetaUiField) => {
              const rowCtx = groupCtx.with(item);
              if (
                !(
                  nativeInplaceEdit &&
                  (item as { editable?: boolean }).editable !== false &&
                  !rowCtx.isFieldReadonly(field) &&
                  !rowCtx.isFieldHidden(field)
                )
              ) {
                return false;
              }
              // 权限列：模块 allowOps 不支持的操作不进编、不显示复选框
              if (
                SqlDataType.isBool(field.dataType) &&
                String(field.fieldName).startsWith("allow") &&
                (item as { allowOps?: number }).allowOps != null
              ) {
                const flags = auth(
                  (item as { allowOps?: number }).allowOps ?? 0,
                ) as Record<string, boolean>;
                if (!flags[field.fieldName]) return false;
              }
              return true;
            },
            onCellSave: (item: any, field: MetaUiField, value: unknown) => {
              const rowCtx = groupCtx.with(item);
              if (treeSpec) {
                rowCtx.setFieldValue(field, value);
                return !rowCtx.getFieldError?.(field);
              }
              let normalized = value;
              if (
                field.reference &&
                (value == null || typeof value !== "object")
              ) {
                normalized =
                  field.reference.refOptions.find(
                    (option) => field.reference!.valueOf(option) === value,
                  ) ?? value;
              }
              MetaModel.setFieldValue(item, field, normalized);
              rowCtx.setFieldValue(field, normalized);
              return !rowCtx.getFieldError?.(field);
            },
            rowStyle: hiddenDeletedSubRowStyle,
            onItemDoubleClick: (item: any) =>
              (context as any).subGroupItem?.(group, item),
            group,
            groupUi: group.groupUi,
            isTree: Boolean(treeSpec),
            rowMenu: readOnlyRows
              ? undefined
              : (item: any) =>
                  this.subGroupRowMenu(context, group, item),
          };
        const table = treeSpec
          ? this.buildTreeGrid(
              rows,
              group.groupUi,
              (row) => (readOnlyRows ? groupCtx : groupCtx.with(row)),
              {
                ...gridProps,
                ...treeSpec,
              },
            )
          : this.tableWithCells(
              rows,
              group.groupUi,
              (row) => (readOnlyRows ? groupCtx : groupCtx.with(row)),
              gridProps,
            );
        if (showGroupActions !== false) {
          wrapProps.headerActions = this.buildGroupHeaderActions(group, context);
        }
        return this.wrapGroup(
          group,
          layoutFieldGroup({
            fields: [table],
            direction: "table",
            cols: 1,
          }),
          wrapProps,
        );
      }
      const fields =
        children ??
        group.fields
          .filter((field) => !context.isFieldHidden(field))
          .map((field) => this.buildField(field, context, fieldProps));
      return this.wrapGroup(
        group,
        layoutFieldGroup({
          fields,
          direction: direction as FieldGroupDirection,
          cols: cols as 1 | 2 | 3,
        }),
        wrapProps,
      );
    },
    
    buildBpmnDiagram(
      flowTrails: any[],
      _context: UiContext,
      props?: PropData,
    ): VNode {
      return h(
        "section",
        props,
        flowTrails.map((item) => h("div", String(item))),
      );
    },
    
    buildGanttView(_context: UiContext, props: UiGanttViewProps): VNode {
      const count = props.tasks?.length ?? 0;
      return h("section", { class: "mmda-gantt-stub", ...props }, [
        count
          ? h("p", `${count} tasks (skin required)`)
          : h("p", "Gantt (skin required)"),
      ]);
    },
    
    buildGanttChart(context: UiContext, props: UiGanttChartProps): VNode {
      return this.buildGanttView(context, props);
    },
    
    buildAttachmentGroup(context: UiContext, props?: PropData): VNode {
      const attachments =
        ((context.model as Record<string, any>).attachments as
          { fileName?: string }[] | undefined) ?? [];
      const title = context.translate("attachments") || "Attachments";
      const body = attachments.length
        ? h(
            "ul",
            attachments.map((item) => h("li", item.fileName ?? "")),
          )
        : h("p", context.translate("empty.attachments") || "No attachments");
      return this.wrapGroup(
        {
          groupLabel: title,
          many: false,
          isSecondary: () => true,
          isTails: () => false,
        } as MetaUiGroup,
        body,
        { region: "secondary", class: "mmda-attachments", ...props },
      );
    },
    
    buildView(context: UiContext, props: UiViewPropsType = {}): VNode {
      const groups = context.metaui.groups.filter(
        (group) => !context.isGroupHidden(group),
      );
      const primaryCols = props.primaryCols ?? 2;
      // 主区：主表组（按 groupName）→ 子表组（按 groupIdx）
      const primary = sortViewGroups(
        groups.filter((group) => group.isPrimary()),
      ).map((group) =>
        this.buildGroup(group, context, undefined, {
          direction: "row",
          cols: primaryCols,
        }),
      );
      const summary: VNode[] = [];
      const attachments = (context.model as Record<string, any>).attachments;
      // 右边栏：附件等先渲染，概要分组始终放最后
      if (
        !context.editing &&
        props.showAttachments !== false &&
        Array.isArray(attachments) &&
        this.buildAttachmentGroup
      ) {
        summary.push(this.buildAttachmentGroup(context));
      }
      if (props.showSecondaryGroup !== false) {
        summary.push(
          ...sortViewGroups(groups.filter((group) => group.isSecondary())).map(
            (group) =>
              this.buildGroup(group, context, undefined, {
                direction: "column",
                cols: 1,
              }),
          ),
        );
      }
      const tails = sortViewGroups(groups.filter((group) => group.isTails())).map(
        (group) =>
          this.buildGroup(group, context, undefined, {
            direction: "row",
            cols: primaryCols,
          }),
      );
      const runtime = context as any;
      const toolbar =
        props.showToolbar === false
          ? null
          : (props.toolbar?.() ??
            this.buildModuleToolbar(context, {
              showBreadcrumb: props.showBreadcrumb ?? true,
              showActions: props.showActions ?? true,
            }));
      const pagePrimary = props.content
        ? [h("div", props.content() as any)]
        : [
            ...(props.header ? [h("div", props.header() as any)] : []),
            ...primary,
          ];
      const page = layoutPage({
        toolbar: toolbar as VNodeChild,
        stickyToolbar: props.stickyToolbar ?? true,
        primary: pagePrimary,
        summary: props.content ? [] : summary,
        tails: props.content ? [] : tails,
        footer: props.footer?.(),
        props: { class: "mmda-view", role: runtime.view },
      });
      return context.editing
        ? h(
            "form",
            {
              class: "mmda-form",
              style: { height: "100%", minHeight: 0, overflow: "hidden" },
            },
            page,
          )
        : page;
    },
  } as any);
}
