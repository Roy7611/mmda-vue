import { createElement, type ReactElement, type ReactNode } from "react";
import { RuiFactory } from "@mmda/rui";
import type {
  TranslateFn,
  UiButtonProps,
  UiButtonSlots,
  UiDialogProps,
  UiRenderer,
  UiToastProps,
  UiNodeProps,
  UiProps,
  UiTableProps,
  UiGridProps,
  UiTreeGridProps,
} from "@mmda/core";
import {
  createActionButton,
  createButton,
  createButtonGroup,
  createDropDownButton,
  createFloatingActionButton,
  createMoreMenuButton,
  createSelectButtonGroup,
  createSplitButton,
} from "./factory/buttons";
import { createTextInput } from "./factory/text_input";
import {
  createBitCheckBoxList,
  createCheckBox,
  createCheckBoxList,
  createChips,
  createColorPicker,
  createMaskedTextBox,
  createNumberInput,
  createOneTimePasswordInput,
  createRadioButtonGroup,
  createRating,
  createSlider,
  createSwitch,
  createTextArea,
} from "./factory/inputs";
import {
  createCalendar,
  createDatePicker,
  createDateRangePicker,
  createDateTimePicker,
  createMonthPicker,
  createTimePicker,
} from "./factory/calendars";
import {
  createAutoComplete,
  createComboBox,
  createDropDownList,
  createMultiBitSelect,
  createMultiItemSelect,
  createMultiSelect,
  createMultiTextSelect,
  createMultiValueSelect,
  createTagAutoComplete,
  createTreeSelect,
} from "./factory/selects";
import {
  createAvatar,
  createBadge,
  createBreadcrumb,
  createCard,
  createDivider,
  createError,
  createLoading,
  createMessage,
  createProgressBar,
  createSkeleton,
  createTabs,
  createToolbar,
  createTooltip,
} from "./factory/display";
import {
  createCarousel,
  createContextMenu,
  createDrawer,
  createList,
  createPaginator,
  createSidebar,
  createSplitter,
  createTree,
} from "./factory/navigation";
import {
  createFileLink,
  createFilesUploader,
  createFileUploader,
  createImageGallery,
  createImageUploader,
  createImagesUploader,
} from "./factory/uploads";
import {
  createSearchRelative,
  createSignaturePad,
  createStepper,
} from "./factory/misc";
import { createBarcode } from "./factory/barcode";
import { createQrCode } from "./factory/qrcode";
import { createSpeechToText } from "./factory/speech_to_text";
import { createInplaceEditor } from "./factory/inplace_editor";
import { createQueryBuilder } from "./factory/query_builder";
import { createTable, createGrid } from "./factory/table";
import { createTreeGrid } from "./factory/tree_grid";
import { SfRuiLayout } from "./layout";
import { sfRuiOverlay } from "./overlay";

/**
 * Syncfusion EJ2 React 皮肤工厂。
 *
 * 5 个纯 HTML 壳方法继承自 core `AbstractUiFactory`；本类补齐 Syncfusion
 * 真实控件、图标表与弹层。table / grid / treeGrid / queryBuilder /
 * inplaceEditor / speechToText / barcode / qrCode 均已接 Syncfusion EJ2
 * React 控件，不再使用 null 存根。
 */
export class SfRuiFactory extends RuiFactory {
  constructor(
    renderer: UiRenderer<ReactNode, UiNodeProps> = new SfRuiLayout(),
  ) {
    super(renderer);
  }

  nativeInplaceEdit = true;

  // —— 真实控件 ——
  button = createButton;
  textInput = createTextInput;
  buttonGroup = createButtonGroup;
  selectButtonGroup = createSelectButtonGroup;
  splitButton = createSplitButton;
  dropDownButton = createDropDownButton;
  moreMenuButton = createMoreMenuButton;
  floatingActionButton = createFloatingActionButton;
  textArea = createTextArea;
  numberInput = createNumberInput;
  checkBox = createCheckBox;
  switch = createSwitch;
  radioButtonGroup = createRadioButtonGroup;
  checkBoxList = createCheckBoxList;
  bitCheckBoxList = createBitCheckBoxList;
  maskedTextBox = createMaskedTextBox;
  oneTimePasswordInput = createOneTimePasswordInput;
  colorPicker = createColorPicker;
  slider = createSlider;
  rating = createRating;
  chips = createChips;
  datePicker = createDatePicker;
  monthPicker = createMonthPicker;
  dateTimePicker = createDateTimePicker;
  timePicker = createTimePicker;
  dateRangePicker = createDateRangePicker;
  calendar = createCalendar;
  dropDownList = createDropDownList;
  comboBox = createComboBox;
  multiSelect = createMultiSelect;
  multiItemSelect = createMultiItemSelect;
  multiValueSelect = createMultiValueSelect;
  multiTextSelect = createMultiTextSelect;
  multiBitSelect = createMultiBitSelect;
  treeSelect = createTreeSelect;
  dropDownTree = createTreeSelect;
  autoComplete = createAutoComplete;
  tagAutoComplete = createTagAutoComplete;
  badge = createBadge;
  message = createMessage;
  avatar = createAvatar;
  breadcrumb = createBreadcrumb;
  card = createCard;
  divider = createDivider;
  tooltip = createTooltip;
  tabs = createTabs;
  toolbar = createToolbar;
  splitter = createSplitter;
  sidebar = createSidebar;
  drawer = createDrawer;
  contextMenu = createContextMenu;
  carousel = createCarousel;
  list = createList;
  tree = createTree;
  paginator = createPaginator;
  progressBar = createProgressBar;
  skeleton = createSkeleton;
  loading = createLoading;
  error = createError;
  searchRelative = createSearchRelative;
  fileLink = createFileLink;
  fileUploader = createFileUploader;
  filesUploader = createFilesUploader;
  imageUploader = createImageUploader;
  imagesUploader = createImagesUploader;
  imageGallery = createImageGallery;
  stepper = createStepper;
  signaturePad = createSignaturePad;
  queryBuilder = createQueryBuilder;
  inplaceEditor = createInplaceEditor;
  speechToText = createSpeechToText;
  barcode = createBarcode;
  qrCode = createQrCode;

  table<T>(props: UiTableProps<T, ReactNode>): ReactNode {
    return createTable(props, {
      resolveIconCss: (icon) => this.iconCssOf(icon ?? ""),
    });
  }

  grid<T>(props: UiGridProps<T, ReactNode>): ReactNode {
    return createGrid(props, {
      resolveIconCss: (icon) => this.iconCssOf(icon ?? ""),
    });
  }

  treeGrid<T>(props: UiTreeGridProps<T, ReactNode>): ReactNode {
    return createTreeGrid(props, (icon) => this.iconCssOf(icon ?? ""));
  }

  formField = (
    props: UiProps,
    slots?: { default?: () => ReactNode },
  ): ReactElement =>
    this.el(
      "div",
      {
        className: ["mmda-form-field", (props as any).class]
          .filter(Boolean)
          .join(" "),
      },
      (props as any).label
        ? this.el(
            "label",
            { className: "mmda-form-field__label" },
            String((props as any).label),
          )
        : null,
      slots?.default?.() ?? this.textInput(props as any),
    );

  link = (props: any, slots?: any): ReactElement =>
    this.el(
      "a",
      {
        href: props.href,
        target: props.target,
        className: ["e-link", props.class].filter(Boolean).join(" "),
        style: props.style,
      },
      slots?.default?.() ?? props.text,
    );

  // —— React 特有抽象成员 ——
  actionButton = (
    action: { onAction?: () => void; label?: string; name?: string },
    t: TranslateFn,
    _resolve?: boolean,
    props?: UiButtonProps,
  ): ReactElement =>
    createActionButton(action, t, (icon) => this.iconCssOf(icon), props);

  actionIcons: Record<string, string> = {
    details: "e-icons e-eye",
    create: "e-icons e-plus",
    edit: "e-icons e-edit",
    save: "e-icons e-save",
    cancel: "e-icons e-close",
    delete: "e-icons e-trash",
    clear: "e-icons e-erase",
    add: "e-icons e-plus",
    refresh: "e-icons e-refresh",
    search: "e-icons e-search",
    reset: "e-icons e-filter-clear",
    back: "e-icons e-chevron-left",
    import: "e-icons e-upload-1",
    export: "e-icons e-download",
    print: "e-icons e-print",
    execute: "e-icons e-play",
    do: "e-icons e-play",
    "auto-fit-columns": "e-icons e-auto-fit-all-column",
    settings: "e-icons e-settings",
    more: "e-icons e-more-vertical-1",
    file: "e-icons e-file",
    "page-layout": "e-icons e-table",
    "eye-slash": "fas fa-eye-slash",
    "dnd-vert": "material-symbols-rounded drag_indicator",
    "drag-indicator": "material-symbols-rounded drag_indicator",
    "freeze-column-right": "e-icons e-spacing-before",
    "freeze-column-left": "e-icons e-spacing-after",
    unlock: "e-icons e-unlock",
    "align-left": "e-icons e-align-left",
    "align-center": "e-icons e-align-center",
    "align-right": "e-icons e-align-right",
  };

  viewIcons = {
    index: "e-icons e-list-unordered",
    details: "e-icons e-eye",
    create: "e-icons e-plus",
    edit: "e-icons e-edit",
  };

  dialogIcons = {
    success: "e-icons e-circle-check",
    info: "e-icons e-circle-info",
    warning: "e-icons e-warning",
    error: "e-icons e-circle-close",
  };

  iconCssOf(icon: string): string {
    if (!icon) return this.actionIcons.execute;
    if (
      icon.startsWith("e-icons") ||
      icon.startsWith("e-") ||
      icon.startsWith("fas") ||
      icon.startsWith("fa-")
    ) {
      return icon;
    }
    if (icon.startsWith("pi ")) {
      const name = icon.replace(/^pi pi-/, "");
      return this.actionIcons[name] ?? `e-icons e-${name}`;
    }
    return this.actionIcons[icon] ?? `e-icons e-${icon}`;
  }

  resolveIcon(icon: string): ReactElement | null {
    const css = this.iconCssOf(icon);
    return css ? createElement("i", { className: css }) : null;
  }

  // —— 应用级方法（委托给 sfRuiOverlay）——
  toast = (props: UiToastProps): void => sfRuiOverlay.toast(props);

  confirm = (message: string): Promise<boolean> =>
    sfRuiOverlay.confirm({ message });

  dialog = (props: UiDialogProps, content?: ReactNode) =>
    sfRuiOverlay.dialog(content ?? null, props);
}
