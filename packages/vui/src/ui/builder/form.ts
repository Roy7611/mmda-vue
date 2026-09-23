import { h, type VNode, type VNodeChild } from "vue";
import {
  AbstractUiBuilder,
  MetaModel,
  SqlDataType,
  auth,
  placeFields,
  type MetaUiField,
  type MetaUiGroup,
  type UiAction,
  type UiImageGalleryItem,
  uiCssClass,
  type UiMessageProps,
} from "@mmda/core";
import { type UiFieldGroupType, type UiProps } from "@mmda/core";
import { isImageGalleryShape } from "./tree_data";
import { treeGridSpecFromGroup } from "../factory/tree_grid";
import { wrapRowDetail } from "../factory/list";
import { isActionEnabled } from "../factory/action";
import { GroupCard } from "../../components/GroupCard";
import { GroupTab } from "../../components/GroupTab";
import { translateMessage } from "../../i18n/i18n";
import type { VuiContext } from "../../contexts/vue_ui_context";
import type { VuiViewProps } from "../../contexts/view";
import {
  uploadedFileNames,
  type UiContext,
} from "./helpers";
import type { AbstractConstructor } from "./mixin";

export interface GroupShellProps extends UiProps {
  container?: 'card' | 'fieldset' | 'tab' | 'none'
  region?: string
  many?: boolean
  orientation?: 'vertical' | 'horizontal'
  cols?: number
  headerActions?: VNode | VNode[]
  footer?: VNode | VNode[]
  caption?: string | VNode
}

export interface BuildGroupProps extends UiProps {
  orientation?: 'vertical' | 'horizontal' | 'row' | 'column'
  direction?: 'vertical' | 'horizontal' | 'row' | 'column'
  cols?: number
  container?: 'card' | 'fieldset' | 'tab' | 'none'
  showGroupActions?: boolean
  skipRowDetail?: boolean
  fieldVertical?: boolean
}

export function WithForm<TBase extends AbstractConstructor>(Base: TBase) {
  abstract class FormBuilder extends Base {

    /**
     * 强制编辑行（标签 + 输入）。按 `MetaUiField` 选 `fieldFactory` 里的控件，再套 `layout` 排。
     * 校验文案由皮肤控件自绘。控件：`customEditor` ?? `field.editor` ?? `fallbackInput`。
     */
    editFor(field: MetaUiField, context: UiContext) {
      return this.wrapFieldRow(field, context, {}, true);
    }

    fieldDisplayName(field: MetaUiField) {
      if (field.renderer) return field.renderer;
      if (SqlDataType.isBool(field.dataType)) return "checkedIcon";
      return "textSpan";
    }

    /**
     * 强制只读行（标签 + 展示）。
     * 控件：`customRenderer` ?? `field.renderer`（bool 默认 `checkedIcon`）?? `fallbackDisplay`。
     */
    displayFor(field: MetaUiField, context: UiContext) {
      return this.wrapFieldRow(field, context, {}, false);
    }

    /** 按会话状态自动选编辑/显示行并套字段布局。 */
    buildField(field: MetaUiField, context: UiContext) {
      return this.renderFieldRow(field, context, {});
    }

    buildResponsiveField(field: MetaUiField, context: UiContext) {
      return this.renderFieldRow(field, context, {});
    }
    
    /** Card 外壳：可折叠 header；内容由 wrapGroupContent 自管布局 */
    buildGroupCard(
      group: MetaUiGroup,
      body: VNode | VNode[],
      props: GroupShellProps = {}
    ) {
      const {
        container: _container,
        region: _region,
        many: _many,
        orientation: _orientation,
        cols: _cols,
        class: _className,
        headerActions,
        footer,
        ...rest
      } = props;
      return h(
        GroupCard,
        {
          title: group.groupLabel,
          expanded: group.expanded !== false,
          class: this.groupWrapClass(group, props),
          ...rest,
        },
        {
          default: () => this.wrapGroupContent(body),
          actions: headerActions ? () => headerActions : undefined,
          footer: footer ? () => footer : undefined,
        },
      );
    }

    /**
     * Tab 页内组壳：无标题镜像、无折叠；可选 caption / actions / footer。
     * 与 GroupCard 分立，不要往 Card 上加 showTitle。
     */
    buildGroupTab(
      group: MetaUiGroup,
      body: VNode | VNode[],
      props: GroupShellProps = {},
    ) {
      const {
        container: _container,
        region: _region,
        many: _many,
        orientation: _orientation,
        cols: _cols,
        class: _className,
        headerActions,
        caption,
        footer,
        ...rest
      } = props;
      return h(
        GroupTab,
        {
          caption: typeof caption === "string" ? caption : undefined,
          class: this.groupWrapClass(group, props),
          ...rest,
        },
        {
          default: () => body,
          actions: headerActions ? () => headerActions : undefined,
          footer: footer ? () => footer : undefined,
        },
      );
    }
    
    /** 子表 header 工具栏（对齐老代码 Panel icons）— 平面图标，文案进 tooltip */
    buildGroupHeaderActions(group: MetaUiGroup, context: UiContext) {
      const runtime = context as VuiContext;
      const actions = runtime.getGroupActions?.(group) ?? [];
      if (!actions.length) return undefined;
      const t = (message: any) => context.t(message);
      return h(
        "div",
        { class: uiCssClass("group", "action-group") },
        actions.map((action: UiAction) => {
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
            class: uiCssClass("group", "action"),
            "aria-label": label,
            disabled: !isActionEnabled(action, context.model, context),
          });
        }),
      );
    }
    
    wrapGroup(group: MetaUiGroup, body: VNode | VNode[], props: GroupShellProps = {}) {
      const shell = props.container ?? "card";
      if (shell === "none") {
        return Array.isArray(body) ? this.renderer.render("div", {}, body) : body;
      }
      if (shell === "fieldset") {
        return this.buildGroupFieldSet(group, body, props);
      }
      if (shell === "tab") {
        return this.buildGroupTab(group, body, props);
      }
      return this.buildGroupCard(group, body, props);
    }
    
    /**
     * 组内容前后插片：`prepend` + 内容 + `append`（编辑态用 `customEditPrepend` / `customEditAppend`）。
     * 与 `customEditor` / `customRenderer` **正交**：后两者换中间那块，这两个只在前 / 后各加一段
     * （例：表格上方加扫码输入、尾部显示编辑动态）。
     */
    wrapGroupSlots(
      group: MetaUiGroup,
      context: UiContext,
      props: BuildGroupProps,
      body: VNode | VNode[],
    ): VNode[] {
      const groupLogic = context.getGroupLogic(group);
      const prependView = context.editing
        ? groupLogic?.customEditPrepend
        : groupLogic?.customPrepend;
      const appendView = context.editing
        ? groupLogic?.customEditAppend
        : groupLogic?.customAppend;
      return [
        ...(typeof prependView === "function"
          ? [prependView(group, context, props)]
          : []),
        ...(Array.isArray(body) ? body : [body]),
        ...(typeof appendView === "function"
          ? [appendView(group, context, props)]
          : []),
      ];
    }

    buildGroup(group: MetaUiGroup, context: UiContext, children?: VNode[] | null, props: BuildGroupProps = {}) {
      if (context.isGroupHidden(group)) {
        return this.renderer.render(
          "span",
          { attributes: { htmlAttributes: { hidden: true } } },
          [],
        )
      }
        const {
        orientation: orientationProp,
        direction: directionProp,
        cols = group.isSecondary() ? 1 : 2,
        container = "card",
        class: className,
        showGroupActions = true,
        skipRowDetail = false,
        fieldVertical,
        ...fieldProps
      } = props;
      const orientation =
        orientationProp ??
        directionProp ??
        (group.isSecondary() ? "column" : "row");
      const wrapProps: GroupShellProps = {
        container,
        class: className,
        region: AbstractUiBuilder.groupZone(group),
        many: group.many,
      };
      if (group.many && group.groupUi) {
        const rows =
          ((context.model as Record<string, any>)[group.groupName] as any[]) ??
          [];
        const groupCtx = (context as VuiContext).subGroupContext(group);
        const readOnlyRows = !context.editing;
        const groupLogic = context.getGroupLogic(group);
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
            this.wrapGroupSlots(
              group,
              context,
              props,
              customGroupView(group, context, props),
            ),
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
            ? this.factory.imageGallery({
                items: galleryItems,
                onItemDblclick: (item: UiImageGalleryItem) =>
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
                    this.hasPlugin("image-editor"),
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
          this.layout.fieldGroupLayout = { type: 'grid', gridCols: 1 }
          return this.wrapGroup(
            group,
            this.wrapGroupSlots(
              group,
              context,
              props,
              this.layout.layoutFieldGroup({
                fields: [uploader, gallery].filter(Boolean) as VNode[],
              }),
            ),
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
              .flatMap((childGroup) => childGroup.fields ?? []);
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
          const fieldLogic = groupCtx.getFieldLogic(field);
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
                ) as unknown as Record<string, boolean>;
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
            return !rowCtx.getInvalidMessage(field);
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
          return !rowCtx.getInvalidMessage(field);
        };
        const gridProps: Record<string, any> = {
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
            rowStyle: (item: unknown) => AbstractUiBuilder.deletedSubRowStyle(item),
            onItemDoubleClick: (item: any) =>
              (context as any).subGroupItem?.(group, item),
            group,
            groupUi: group.groupUi,
            isTree: Boolean(treeSpec),
            class: skipRowDetail ? "mmda-row-detail" : className,
            // 子表无索引页高度链；agnaive 据此走 autoHeight（与 Syncfusion 无分页行为一致）
            height: "auto",
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
              (row: any) => (readOnlyRows ? groupCtx : groupCtx.with(row)),
              {
                ...gridProps,
                ...treeSpec,
                display: "treeGrid",
              },
            )
          : this.tableWithCells(
              rows,
              group.groupUi,
              (row: any) => (readOnlyRows ? groupCtx : groupCtx.with(row)),
              gridProps,
            );
        if (showGroupActions !== false) {
          wrapProps.headerActions = this.buildGroupHeaderActions(group, context);
        }
        this.layout.fieldGroupLayout = { type: 'grid', gridCols: 1 }
        return this.wrapGroup(
          group,
          this.wrapGroupSlots(
            group,
            context,
            props,
            this.layout.layoutFieldGroup({
              fields: [table],
            }),
          ),
          wrapProps,
        );
      }
      // 主表字段行：按编辑态选编辑/显示并套默认 layoutField；先装箱再写坐标
      const gridCols = (cols as 1 | 2 | 3) ?? 2
      const fields =
        children ??
        (() => {
          const visible = (group.fields ?? []).filter(
            (field: MetaUiField) => !context.isFieldHidden(field),
          )
          const packed = placeFields(
            gridCols,
            visible.map((field: MetaUiField) => ({
              colSpan: field.colSpan,
              rowSpan: field.rowSpan,
            })),
          )
          return visible.map((field: MetaUiField, index: number) => {
            const cell = packed[index]!
            return this.renderFieldRow(field, context, {
              ...fieldProps,
              ...(fieldVertical ? { fieldVertical: true } : {}),
              gridColumn: `${cell.column + 1} / span ${cell.colSpan}`,
              gridRow: `${cell.row + 1} / span ${cell.rowSpan}`,
            })
          })
        })()
      const groupType: UiFieldGroupType =
        orientation === 'column' ? 'column' : 'grid'
      this.layout.fieldGroupLayout = {
        type: groupType,
        gridCols,
      }
      return this.wrapGroup(
        group,
        this.layout.layoutFieldGroup({
          fields,
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
    
    buildView(context: UiContext, props: VuiViewProps = {}): VNode {
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
      const pageLayout =
        props.pageLayout === "tabs" || props.pageLayout === "cards"
          ? props.pageLayout
          : this.layout.pageLayout === "tabs"
            ? "tabs"
            : "cards";
      const runtime = context as any;
      // 对话框内（isInDialog）默认不画模块顶栏，避免与底栏取消/确定重复；
      // 显式 showToolbar:true 可恢复。
      const toolbarVisible = props.showToolbar ?? !runtime.isInDialog;
      const toolbar =
        toolbarVisible === false
          ? null
          : (props.toolbar?.() ??
            (runtime.editing
              ? this.buildEditTopbar(context, {
                  showBreadcrumb: props.showBreadcrumb ?? true,
                  showActions: props.showActions ?? true,
                })
              : this.buildDetailsTopbar(context, {
                  showBreadcrumb: props.showBreadcrumb ?? true,
                  showActions: props.showActions ?? true,
                })));
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

      let pagePrimary: VNode[];
      let summary: VNode[] = [];
      let tails: VNode[] = [];
      let emphasis: VNode | undefined;

      if (props.content) {
        pagePrimary = [
          ...(props.header ? [h("div", props.header() as any)] : []),
          h("div", props.content() as any),
        ];
      } else if (pageLayout === "tabs") {
        // emphasis：emphasized 字段只读展示（displayFor）；tabs 内同一字段仍可编辑
        const seen = new Set<string>();
        const emphasizedFields: MetaUiField[] = [];
        for (const group of viewGroups) {
          for (const field of group.fields ?? []) {
            if (
              field.emphasized &&
              !context.isFieldHidden(field) &&
              !seen.has(field.fieldName)
            ) {
              seen.add(field.fieldName);
              emphasizedFields.push(field);
            }
          }
        }
        if (emphasizedFields.length > 0) {
          emphasis = this.layout.row(
            emphasizedFields.map((field) =>
              this.wrapFieldRow(field, context, {}, false),
            ),
            emphasizedFields.map((field) => Math.max(1, field.colSpan ?? 1)),
          );
        }
        const tabGroups = AbstractUiBuilder.sortViewGroups([
          ...viewGroups.filter((group) => group.isPrimary()),
          ...(props.showSecondaryGroup !== false
            ? viewGroups.filter((group) => group.isSecondary())
            : []),
          ...viewGroups.filter((group) => group.isTails()),
        ]);
        const tabItems = tabGroups.map((group) => ({
          name: group.groupName,
          header: group.groupLabel || group.groupName,
          content: this.buildGroup(group, context, undefined, {
            container: "tab",
            orientation: "row",
            cols: primaryCols,
          }),
        }));
        const attachments = (context.model as Record<string, any>).attachments;
        if (
          !context.editing &&
          props.showAttachments !== false &&
          Array.isArray(attachments) &&
          this.buildAttachmentGroup
        ) {
          tabItems.push({
            name: "attachments",
            header: context.translate?.("attachments") || "Attachments",
            content: this.buildAttachmentGroup(context),
          });
        }
        const tabsNode =
          this.factory.tabs?.({
            items: tabItems,
            headerPlacement: "Top",
            scrollable: true,
            heightAdjustMode: "Fill",
            loadOn: "Demand",
            headerStyle: "fill",
          }) ?? h("div", tabItems.map((item) => item.content));
        pagePrimary = [
          ...(props.header ? [h("div", props.header() as any)] : []),
          tabsNode,
        ];
      } else {
        // cards：主区主表组 → 子表组；右边栏附件 + 概要；尾栏
        const primary = AbstractUiBuilder.sortViewGroups(
          viewGroups.filter((group) => group.isPrimary()),
        ).map((group) =>
          this.buildGroup(group, context, undefined, {
            orientation: "row",
            cols: primaryCols,
          }),
        );
        const attachments = (context.model as Record<string, any>).attachments;
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
            ...AbstractUiBuilder.sortViewGroups(
              viewGroups.filter((group) => group.isSecondary()),
            ).map((group) =>
              this.buildGroup(group, context, undefined, {
                orientation: "column",
                cols: 1,
              }),
            ),
          );
        }
        tails = AbstractUiBuilder.sortViewGroups(
          viewGroups.filter((group) => group.isTails()),
        ).map((group) =>
          this.buildGroup(group, context, undefined, {
            orientation: "row",
            cols: primaryCols,
          }),
        );
        pagePrimary = [
          ...(props.header ? [h("div", props.header() as any)] : []),
          ...primary,
        ];
      }

      const page = this.layout.layoutPage({
        pageLayout,
        toolbar: toolbar as VNode,
        banner,
        emphasis,
        primary: pagePrimary,
        summary,
        tails,
        footer: props.footer?.(),
      });
      // 页根即 .mmda-page；内滚由 .mmda-view__one .mmda-page 承担（工作区占用 mmda-view）
      return context.editing
        ? this.renderer.render(
            "form",
            {
              class: "mmda-form",
              style: { height: "100%", minHeight: 0, overflow: "hidden" },
            },
            [page],
          )
        : page;
    }
  }
  return FormBuilder;
}
