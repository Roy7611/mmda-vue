import { h } from "vue";
import type { UiProps, SyncfusionUiFactory, UiSlots } from "@mmda/vui"
import { switchArgs } from "@mmda/core"
import { createIconVNode, MATERIAL_SYMBOL_PREFIX, bindListDisplayRenderers, wrapListFamilyPaginator } from "@mmda/vui"
import { syncfusionLayout } from "../syncfusion_layout";
import { patchChoiceFilter } from "./grid_inject";
import { createTableRenderer } from "./table";
import { buttonRenderers, createButton } from "./buttons";
import { createBadge } from "./badge";
import { createAvatar } from "./avatar";
import { createBarcode } from "./barcode";
import { createQrCode } from "./qrcode";
import { createBreadcrumb } from "./breadcrumb";
import { createCalendar } from "./calendar";
import { createCarousel } from "./carousel";
import { createCheckBox } from "./checkbox";
import { createSwitch } from "./switch";
import { createCheckBoxList, createBitCheckBoxList } from "./check_box_list";
import { createChips } from "./chips";
import { createContextMenu } from "./context_menu";
import { createCard } from "./card";
import { createDivider } from "./divider";
import { createTooltip } from "./tooltip";
import { createInplaceEditor } from "./inplace_editor";
import { createColorPicker } from "./color_picker";
import { createMaskedTextBox } from "./masked_text_box";
import { createOneTimePasswordInput } from "./one_time_password_input";
import { createQueryBuilder } from "./query_builder";
import { createSlider } from "./slider";
import { createRating } from "./rating";
import { createTabs } from "./tabs";
import { createToolbar } from "./toolbar";
import { createNumberInput } from "./number_input";
import { createTextArea } from "./text_area";
import { createTextInput } from "./text_input";
import { createProgressBar } from "./progress_bar";
import { createSignaturePad } from "./signature_pad";
import { createStepper } from "./stepper";
import { createTimeline } from "./timeline";
import { createSkeleton } from "./skeleton";
import { createLoading } from "./loading";
import { createSpeechToText } from "./speech_to_text";
import { createDatePicker } from "./date_picker";
import { createDateTimePicker } from "./date_time_picker";
import { createTimePicker } from "./time_picker";
import { createDateRangePicker } from "./date_range_picker";
import { createDropDownList } from "./drop_down_list";
import { createRadioButtonGroup } from "./radio_button_group";
import { createMultiSelect, createMultiItemSelect, createMultiValueSelect, createMultiTextSelect, createMultiBitSelect } from "./multi_select";
import { createTreeSelect } from "./tree_select";
import { createComboBox } from "./combo_box";
import { createAutoComplete } from "./autocomplete";
import { createTagAutoComplete } from "./tag_auto_complete";
import { overlayRenderers } from "./overlays";
import { createSplitterRenderer } from "./splitter";
import { mediaRenderers } from "./media";
import { navigationRenderers } from "./navigation";
import { treeGridRenderers } from "./tree_grid";
import { miscellaneousRenderers } from "./miscellaneous";

export { autoFitSyncfusionListGrid } from "./grid";
export { splitterEventIndex } from "./splitter";
export { resolveFieldUnit } from "./utils";
export { SfGridHost, SfGridLoadingHost, SfGrid } from "./grid";
export { SfSplitter } from "./splitter";

import "./grid_inject";

export function createSyncfusionUiFactory(): SyncfusionUiFactory {
  patchChoiceFilter();
  const button = createButton;

  const factory: any = {
    layout: syncfusionLayout,
    nativeInplaceEdit: true,
    actionIcons: {
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
      "auto-fit-columns": "e-icons e-auto-fit-all-column",
      settings: "e-icons e-settings",
      more: "e-icons e-more-vertical-1",
      file: "e-icons e-file",
      "eye-slash": "fas fa-eye-slash",
      "dnd-vert": `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      "drag-indicator": `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      "freeze-column-right": "e-icons e-spacing-before",
      "freeze-column-left": "e-icons e-spacing-after",
      unlock: "e-icons e-unlock",
    },
    viewIcons: {
      index: "e-icons e-list-unordered",
      details: "e-icons e-eye",
      create: "e-icons e-plus",
      edit: "e-icons e-edit",
    },
    dialogIcons: {
      success: "e-icons e-circle-check",
      info: "e-icons e-circle-info",
      warning: "e-icons e-warning",
      error: "e-icons e-circle-close",
    },
    resolveIcon(icon: string) {
      if (!icon) return "";
      if (icon.startsWith("e-icons") || icon.startsWith("e-")) return icon;
      if (/\bfa[srbld]?\b|fa-/.test(icon)) return icon;
      if (icon.startsWith("pi ")) {
        const name = icon.replace(/^pi pi-/, "");
        return factory.actionIcons[name] ?? `e-icons e-${name}`;
      }
      return factory.actionIcons[icon] ?? `e-icons e-${icon}`;
    },
    textSpan: (text: any, props: any) => h("span", props, text),
    label: (text: any, props: any) => h("label", props, text),
    icon: (name: string, props: any) =>
      createIconVNode(factory.resolveIcon(name), props),
    badge: (props: any) => createBadge(props),
    avatar: (props: any) =>
      createAvatar(props, (name: string) => factory.resolveIcon(name)),
    barcode: (props: any) => createBarcode(props),
    qrCode: (props: any) => createQrCode(props),
    breadcrumb: (props: any) =>
      createBreadcrumb(props, (name: string) => factory.resolveIcon(name)),
    calendar: (props: any) => createCalendar(props),
    carousel: (props: any) => createCarousel(props),
    checkBox: (props: any) => createCheckBox(props),
    switch: (value?: any, props?: any) =>
      createSwitch(switchArgs(value, props)),
    checkBoxList: (props: any) => createCheckBoxList(props),
    bitCheckBoxList: (props: any) => createBitCheckBoxList(props),
    chips: (props: any) =>
      createChips(props, (name: string) => factory.resolveIcon(name)),
    contextMenu: (props: any) =>
      createContextMenu(props, (name: string) => factory.resolveIcon(name)),
    card: (props: any, slots?: any) => createCard(props, slots),
    divider: (props: any = {}) => createDivider(props),
    tooltip: (props: any = {}, slots?: any) => createTooltip(props, slots),
    inplaceEditor: (props: any = {}, slots?: any) =>
      createInplaceEditor(props, slots),
    colorPicker: (props: any) => createColorPicker(props),
    maskedTextBox: (props: any) => createMaskedTextBox(props),
    oneTimePasswordInput: (props: any) => createOneTimePasswordInput(props),
    queryBuilder: (props: any) => createQueryBuilder(props),
    slider: (props: any) => createSlider(props),
    rating: (props: any) => createRating(props),
    tabs: (props: any) => createTabs(props),
    toolbar: (props: any, slots?: any) => createToolbar(props, slots),
    numberInput: (props: any) => createNumberInput(props),
    textInput: (props: any) => createTextInput(props),
    textArea: (props: any) => createTextArea(props),
    progressBar: (props: any) => createProgressBar(props),
    signaturePad: (props: any) => createSignaturePad(props),
    stepper: (props: any) =>
      createStepper(props, (name: string) => factory.resolveIcon(name)),
    timeline: (props: any) =>
      createTimeline(props, (name: string) => factory.resolveIcon(name)),
    skeleton: (props: any = {}) => createSkeleton(props),
    loading: (props: any = {}) => createLoading(props),
    speechToText: (props: any = {}) => createSpeechToText(props),
    datePicker: (props: any) => createDatePicker(props),
    monthPicker: (props: any) =>
      createDatePicker({
        ...props,
        precision: "month",
        format: props.format ?? "yyyy-MM",
      }),
    dateTimePicker: (props: any) => createDateTimePicker(props),
    timePicker: (props: any) => createTimePicker(props),
    dateRangePicker: (props: any) => createDateRangePicker(props),
    dropDownList: (props: any) => createDropDownList(props),
    radioButtonGroup: (props: any) => createRadioButtonGroup(props),
    multiSelect: (props: any) => createMultiSelect(props),
    multiItemSelect: (props: any) => createMultiItemSelect(props),
    multiValueSelect: (props: any) => createMultiValueSelect(props),
    multiTextSelect: (props: any) => createMultiTextSelect(props),
    multiBitSelect: (props: any) => createMultiBitSelect(props),
    treeSelect: createTreeSelect,
    dropDownTree: createTreeSelect,
    comboBox: (props: any) => createComboBox(props),
    title: (text: any, props: any) => h("h2", props, text),
    subtitle: (text: any, props: any) => h("h3", props, text),
    link: (props: any, slots: any) =>
      h(
        "a",
        { ...props, class: ["e-link", props.class] },
        slots?.default?.() ?? props.text,
      ),
    iconField: (value: any, props: UiProps = {}) =>
      h("span", { class: "e-input-group" }, [
        props.icon && h("span", { class: factory.resolveIcon(props.icon) }),
        createTextInput({
          ...props,
          value: props.modelValue ?? value,
        }),
      ]),
    autoComplete: (value: string, props: UiProps = {}) =>
      createAutoComplete(value, props),
    tagAutoComplete: (value: string, props: UiProps = {}) =>
      createTagAutoComplete(value, props),
    formField: (props: UiProps = {}, slots?: UiSlots) =>
      h(
        "div",
        { class: ["mmda-form-field", "mmda-sf-form-field", props.class], style: props.style },
        [
          props.label
            ? h(
                "label",
                { class: "mmda-form-field__label" },
                String(props.label),
              )
            : null,
          slots?.default?.() ??
            createTextInput({
              ...props,
              value: props.modelValue,
              onChange: props.onChange ?? props.onUpdate ?? props["onUpdate:modelValue"],
            }),
        ],
      ),
    ...navigationRenderers,
    ...treeGridRenderers,
    ...mediaRenderers,
    ...miscellaneousRenderers,
  };

  Object.assign(
    factory,
    buttonRenderers(factory, button),
    overlayRenderers(),
  );
  factory.splitter = createSplitterRenderer();
  factory.table = createTableRenderer({
    button,
    paginator: factory.paginator,
    resolveIcon: (icon: string) => factory.resolveIcon(icon),
  });
  wrapListFamilyPaginator(factory, ["list", "treeGrid"], "mmda-sf-pagable");
  factory.pagableTable = (loader: any, metadata: any, props: any) =>
    factory.table(loader.model.list as any[], metadata.metaUi, {
      ...props,
      pagination: props.pagination ?? loader.model.pagination,
      onPage: props.onPage,
    });
  bindListDisplayRenderers(factory);

  return factory as SyncfusionUiFactory;
}
