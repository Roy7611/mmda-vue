// @ts-nocheck
import { h, type VNode, type VNodeChild } from "vue";
import {
  MetaModel,
  SqlDataType,
  auth,
  type MetaUiField,
  type MetaUiGroup,
  type UiMessageProps,
} from "@mmda/core";
import { type UiFieldGroupOrientation, type UiProps } from "../layout/layout";
import { isImageGalleryShape } from "./tree_data";
import { treeGridSpecFromGroup } from "../factory/tree_grid";
import { wrapRowDetail } from "../factory/list";
import { isActionEnabled } from "../factory/action";
import { MmdaGroupCard } from "../../components/GroupCard";
import { translateMessage } from "../../i18n/i18n";
import type { VueUiContext } from "../../contexts/vue_ui_context";
import type { UiViewPropsType } from "../../contexts/view";
import {
  groupZone,
  hiddenDeletedSubRowStyle,
  sortViewGroups,
  uploadedFileNames,
  type UiContext,
} from "./helpers";
import type { AbstractConstructor } from "./mixin";

export function WithForm<TBase extends AbstractConstructor>(Base: TBase) {
  abstract class FormBuilder extends Base {

    labelFor(field: MetaUiField, props?: UiProps) {
      return h(
        "label",
        { for: field.fieldName, key: field.fieldName, ...props },
        field.displayLabel,
      );
    }

    /**
     * @deprecated 用 `fldFactory.editFor`（已含默认 layoutField）。
     * 保留薄委托，避免皮肤/测试瞬时全断。
     */
    editFor(field: MetaUiField, context: UiContext, props: UiProps = {}) {
      return this.fldFactory.editFor(field, context, props);
    }

    fieldDisplayName(field: MetaUiField) {
      if (field.renderer) return field.renderer;
      if (SqlDataType.isBool(field.dataType)) return "checkedIcon";
      return "textSpan";
    }

    /**
     * @deprecated 用 `fldFactory.displayFor`（已含默认 layoutField）。
     */
    displayFor(field: MetaUiField, context: UiContext, props: UiProps = {}) {
      return this.fldFactory.displayFor(field, context, props);
    }

    /**
     * @deprecated 用 `fldFactory.render`。按会话自动选编辑/显示并套字段布局。
     */
    buildField(field, context, props = {}) {
      return this.fldFactory.render(field, context, props);
    }

    buildResponsiveField(field, context, props = {}) {
      return this.fldFactory.render(field, context, props);
    }
    
    groupWrapClass(group: MetaUiGroup, props: UiProps = {}) {
      const raw = String(props.region ?? groupZone(group));
      // accept legacy region names from callers
      const zone =
        raw === "secondary" || raw === "summary" ? "secondary" : "primary";
      const many = props.many === true || group.many;
      return ["mmda-group", many ? "sub" : "master", zone, props.class]
        .filter(Boolean)
        .join(" ");
    }
    
    /** 组内容容器：字段/表格布局归这里管，Card 只做外壳 */
    wrapGroupContent(body: VNode | VNode[], props: UiProps = {}) {
      return h(
        "div",
        { class: ["mmda-group-body", props.class].filter(Boolean) },
        body,
      );
    }
    
    /** FieldSet 外壳：骑边 legend（经典） */
    buildGroupFieldSet(
      group: MetaUiGroup,
      body: VNode | VNode[],
      props: UiProps = {}
    ) {
      const {
        container: _container,
        region: _region,
        many: _many,
        orientation: _orientation,
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
    }
    
    /** Card 外壳：可折叠 header；内容由 wrapGroupContent 自管布局 */
    buildGroupCard(
      group: MetaUiGroup,
      body: VNode | VNode[],
      props: UiProps = {}
    ) {
      const {
        container: _container,
        region: _region,
        many: _many,
        orientation: _orientation,
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
    }
    
    /** 子表 header 工具栏（对齐老代码 Panel icons）— 平面图标，文案进 tooltip */
    buildGroupHeaderActions(group: MetaUiGroup, context: UiContext) {
      const runtime = context as VueUiContext;
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
    }
    
    wrapGroup(group: MetaUiGroup, body: VNode | VNode[], props: UiProps = {}) {
      const shell = props.container ?? "card";
      if (shell === "none") {
        return Array.isArray(body) ? h("div", body) : body;
      }
      if (shell === "fieldset") {
        return this.buildGroupFieldSet(group, body, props);
      }
      return this.buildGroupCard(group, body, props);
    }
    
    buildGroup(group, context, children?: any, props = {}) {
      if (context.isGroupHidden(group)) return h("span", { hidden: true });
        const {
        orientation: orientationProp,
        direction: directionProp,
        cols = group.isSecondary() ? 1 : 2,
        container = "card",
        class: className,
        showGroupActions = true,
        skipRowDetail = false,
        ...fieldProps
      } = props;
      const orientation =
        orientationProp ??
        directionProp ??
        (group.isSecondary() ? "column" : "row");
      const wrapProps: UiProps = {
        container,
        class: className,
        region: groupZone(group),
        many: group.many,
      };
      if (group.many && group.groupUi) {
        const rows =
          ((context.model as Record<string, any>)[group.groupName] as any[]) ??
          [];
        const groupCtx = (context as VueUiContext).subGroupContext(group);
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
          const uploadOneImage = async (
            file: File,
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
                  [
                    {
                      fieldName: "files",
                      data: file,
                      fileName: file.name,
                    },
                  ],
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
              } else if (typeof runtime.uploadFile === "function") {
                response = await runtime.uploadFile(file, {
                  repository: logic?.repository,
                  path: modelId,
                  action: "multi",
                  service: "files",
                  signal: control.signal,
                });
              } else if (typeof runtime.uploadFiles === "function") {
                response = await runtime.uploadFiles([file], {
                  repository: logic?.repository,
                  path: modelId,
                  action: "multi",
                  service: "files",
                });
              } else {
                throw new Error(translateMessage("upload.unsupported"));
              }

              const urls = await uploadedFileNames(response);
              const fileUrl = urls[0];
              if (!fileUrl) {
                throw new Error(translateMessage("upload.fileCountMismatch"));
              }
              const item = await runtime.createSubGroupItems({
                group,
                source: {
                  [shapeKey]: fileUrl,
                  mediaType: 0,
                  description: file.name,
                },
                target: runtime.model,
              });
              runtime.addSubGroupItem(group, item);
              return fileUrl;
            } finally {
              if (runtime.uploading?.value != null)
                runtime.uploading.value = false;
            }
          };
          const galleryItems = rows
            .map((row) => ({
              src: String(row?.[shapeKey] ?? ""),
              thumbnail: String(row?.thumbnail ?? row?.[shapeKey] ?? ""),
              alt: String(row?.description ?? ""),
              title: String(row?.description ?? ""),
              description: String(row?.description ?? ""),
              data: row,
            }))
            .filter((item) => item.src);
          const gallery = !context.editing
            ? this.factory.imageGallery(galleryItems, {
                onItemDblclick: (item: { data?: unknown }) =>
                  (context as any).subGroupItem?.(group, item.data),
              })
            : undefined;
          const uploader =
            context.editing && this.factory.imagesUploader
              ? this.factory.imagesUploader({
                  urls: galleryItems.map((item) => item.src),
                  autoUpload: true,
                  allowedExtensions: ".bmp,.gif,.jpeg,.jpg,.png,.webp",
                  dropText: context.translate("upload.dropImages") as string,
                  showImageEditor:
                    this.imageEditorPlugin?.installed === true,
                  onUpload: uploadOneImage,
                  onRemove: (item: { url?: string }) => {
                    const runtime = context as any;
                    const row = rows.find(
                      (entry) => String(entry?.[shapeKey] ?? "") === item.url,
                    );
                    if (row) runtime.removeSubGroupItem?.(group, row);
                  },
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
            this.layout.layoutFieldGroup({
              fields: [uploader, gallery].filter(Boolean) as VNode[],
              orientation: "table",
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
        const fieldCellEditors: Record<
          string,
          {
            canEdit?:
              | boolean
              | ((field: MetaUiField, item: any) => boolean);
            onSave?: (
              field: MetaUiField,
              item: any,
              value: unknown,
              previousValue?: unknown,
            ) => boolean | void;
          }
        > = {};
        for (const field of tableFields) {
          const fieldLogic = groupCtx.getFieldLogic(field) as any;
          const locked =
            readOnlyRows ||
            !nativeInplaceEdit ||
            fieldLogic?.inplaceEditable === false ||
            groupCtx.isFieldReadonly(field) ||
            groupCtx.isFieldHidden(field);
          if (locked) {
            fieldCellEditors[field.fieldName] = { canEdit: false };
            continue;
          }
          // 权限列：模块 allowOps 不支持的操作不进编
          if (
            SqlDataType.isBool(field.dataType) &&
            String(field.fieldName).startsWith("allow")
          ) {
            fieldCellEditors[field.fieldName] = {
              canEdit: (_f, item) => {
                if ((item as { editable?: boolean }).editable === false) {
                  return false;
                }
                if ((item as { allowOps?: number }).allowOps == null) {
                  return true;
                }
                const flags = auth(
                  (item as { allowOps?: number }).allowOps ?? 0,
                ) as Record<string, boolean>;
                return Boolean(flags[field.fieldName]);
              },
            };
          }
        }
        const treeSpec = treeGridSpecFromGroup(group, rows);
        const defaultCellSave = (
          field: MetaUiField,
          item: any,
          value: unknown,
        ) => {
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
        };
        const gridProps = {
            display: nativeGridEditing ? "grid" : "table",
            sortable: false,
            groupable: false,
            pageable: false,
            filterable: false,
            showGridlines: true,
            readOnlyRows,
            editable: nativeInplaceEdit && !readOnlyRows,
            inplaceEditStart: groupLogic?.inplaceEditStart ?? "excel",
            fieldCellEditors,
            defaultCellSave,
            rowStyle: hiddenDeletedSubRowStyle,
            onItemDoubleClick: (item: any) =>
              (context as any).subGroupItem?.(group, item),
            group,
            groupUi: group.groupUi,
            isTree: Boolean(treeSpec),
            class: skipRowDetail ? "mmda-row-detail" : className,
            height: skipRowDetail ? "auto" : undefined,
            rowActions: readOnlyRows
              ? undefined
              : (item: any) =>
                  this.subGroupRowActions(context, group, item),
          };
        const detailGroupName = skipRowDetail
          ? undefined
          : groupLogic?.rowDetailGroup;
        const detailGroup =
          detailGroupName && group.groupUi
            ? group.groupUi.getGroup(detailGroupName)
            : undefined;
        if (detailGroup?.many) {
          gridProps.rowDetail = {
            expandAll: true,
            detail: (row: any) => {
              const rowCtx = groupCtx.with(row);
              return wrapRowDetail(
                this.buildGroup(detailGroup, rowCtx, undefined, {
                  container: "none",
                  skipRowDetail: true,
                  showGroupActions: true,
                }),
              );
            },
          };
        }
        const table = treeSpec
          ? this.buildTreeGrid(
              rows,
              group.groupUi,
              (row) => (readOnlyRows ? groupCtx : groupCtx.with(row)),
              {
                ...gridProps,
                ...treeSpec,
                display: "treeGrid",
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
          this.layout.layoutFieldGroup({
            fields: [table],
            orientation: "table",
            cols: 1,
          }),
          wrapProps,
        );
      }
      // 主表字段行：走 fldFactory.render（内含默认 layoutField）
      const fields =
        children ??
        group.fields
          .filter((field) => !context.isFieldHidden(field))
          .map((field) => this.fldFactory.render(field, context, fieldProps));
      return this.wrapGroup(
        group,
        this.layout.layoutFieldGroup({
          fields,
          orientation: orientation as UiFieldGroupOrientation,
          cols: cols as 1 | 2 | 3,
        }),
        wrapProps,
      );
    }
    
    buildBpmnDiagram(
      flowTrails: any[],
      _context: UiContext,
      props?: UiProps,
    ): VNode {
      return h(
        "section",
        props,
        flowTrails.map((item) => h("div", String(item))),
      );
    }
    
    buildAttachmentGroup(context: UiContext, props?: UiProps): VNode {
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
    }
    
    buildView(context: any, props: UiViewPropsType = {}): VNode {
      const groups = context.metaUi.groups.filter(
        (group) => !context.isGroupHidden(group),
      );
      const nestedRowDetail = new Set(
        groups
          .map((group) => context.getGroupLogic(group)?.rowDetailGroup)
          .filter((name): name is string => Boolean(name)),
      );
      const viewGroups = groups.filter(
        (group) => !nestedRowDetail.has(group.groupName),
      );
      const primaryCols = props.primaryCols ?? 2;
      // 主区：主表组（按 groupName）→ 子表组（按 groupIdx）
      const primary = sortViewGroups(
        viewGroups.filter((group) => group.isPrimary()),
      ).map((group) =>
        this.buildGroup(group, context, undefined, {
          orientation: "row",
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
          ...sortViewGroups(viewGroups.filter((group) => group.isSecondary())).map(
            (group) =>
              this.buildGroup(group, context, undefined, {
                orientation: "column",
                cols: 1,
              }),
          ),
        );
      }
      const tails = sortViewGroups(viewGroups.filter((group) => group.isTails())).map(
        (group) =>
          this.buildGroup(group, context, undefined, {
            orientation: "row",
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
      const notice = runtime.pageNotice?.value as UiMessageProps | null | undefined;
      const banner =
        notice && notice.visible !== false
          ? (this.factory.message?.({
              ...notice,
              onClose: () => {
                notice.onClose?.();
                if (runtime.pageNotice) runtime.pageNotice.value = null;
              },
            }) ??
            h(
              "div",
              {
                class: [
                  "mmda-message",
                  `is-${notice.severity ?? "info"}`,
                  notice.cssClass,
                ],
                role: "status",
              },
              [
                h("span", { class: "mmda-message-content" }, notice.content ?? ""),
                notice.showCloseIcon !== false
                  ? h(
                      "button",
                      {
                        type: "button",
                        class: "mmda-message-close",
                        "aria-label": "Close",
                        onClick: () => {
                          notice.onClose?.();
                          if (runtime.pageNotice) runtime.pageNotice.value = null;
                        },
                      },
                      "×",
                    )
                  : null,
              ],
            ))
          : undefined;
      const page = this.layout.layoutPage({
        toolbar: toolbar as VNode,
        banner,
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
    }
  }
  return FormBuilder;
}
