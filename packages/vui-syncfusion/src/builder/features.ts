import { h, reactive } from "vue";
import type { PropData } from "@mmda/vui";
import type {
  SigninFormProps,
  SignupFormProps,
  SigninFormSlots,
  UiGanttViewProps,
} from "@mmda/vui";
import { ButtonComponent } from "@syncfusion/ej2-vue-buttons";
import { TextBoxComponent } from "@syncfusion/ej2-vue-inputs";
import { SfBpmnDiagram } from "../components/SfBpmnDiagram";
import { SfBarcodeGenerator, SfQRCodeGenerator } from "../components/SfBarcode";
import { SfSigninForm } from "../components/SfSigninForm";
import { defineAsyncComponent } from "vue";
import type { UiContext } from "./utils";

const SfGanttChart = defineAsyncComponent(() =>
  import("../components/SfGanttChart").then((m) => m.SfGanttChart),
);

export function buildGanttView(_context: UiContext, props: UiGanttViewProps) {
  return h(SfGanttChart, {
    tasks: props.tasks,
    links: props.links,
    columns: props.columns,
    height: props.height ?? "100%",
    readonly: props.readonly,
    allowTaskDrag: props.allowTaskDrag ?? true,
    allowTaskResize: props.allowTaskResize ?? true,
    allowLinks: props.allowLinks ?? true,
    allowRowReorder: props.allowRowReorder ?? false,
    viewMode: props.viewMode ?? "week",
    loading: props.loading,
    locale: props.locale,
    onReady: props.onReady,
    onTaskChange: props.onTaskChange,
    onLinkChange: props.onLinkChange,
    onTaskSelect: props.onTaskSelect,
    onTaskDblClick: props.onTaskDblClick,
    onRowReorder: props.onRowReorder,
  });
}

export function buildBpmnDiagram(
  flowTrails: any[],
  _context: UiContext,
  props: PropData = {},
) {
  return h("section", { class: "mmda-sf-flow", ...props }, [
    h(SfBpmnDiagram, {
      nodes: props.nodes,
      connectors: props.connectors,
      readonly: props.readonly ?? true,
      height: props.height,
    }),
    flowTrails?.length
      ? h(
          "ol",
          { class: "mmda-sf-flow__trails" },
          flowTrails.map((item) =>
            h(
              "li",
              { key: item.id ?? item.name },
              item.label ?? item.name ?? String(item),
            ),
          ),
        )
      : undefined,
  ]);
}

export function buildQrcode(value: string, props: PropData = {}) {
  return h(SfQRCodeGenerator, { value, ...props });
}

export function buildBarcode(value: string, props: PropData = {}) {
  return h(SfBarcodeGenerator, { value, ...props });
}

export function buildSigninForm(props: SigninFormProps, slots?: SigninFormSlots) {
  return h(SfSigninForm, props, slots);
}

export function buildSignupForm(props: SignupFormProps) {
  const user = reactive({
    mobile: "",
    password: "",
    vcode: "",
    agreed: true,
  });
  return h(
    "form",
    {
      class: "mmda-sf-auth-form",
      onSubmit: (event: Event) => {
        event.preventDefault();
        props.onSignup?.(user);
      },
    },
    [
      h(TextBoxComponent as any, {
        placeholder: "Mobile",
        value: user.mobile,
        input: (args: any) => (user.mobile = args.value),
      }),
      h(TextBoxComponent as any, {
        placeholder: "Password",
        type: "password",
        value: user.password,
        input: (args: any) => (user.password = args.value),
      }),
        h(TextBoxComponent as any, {
          placeholder: "Verification code",
          value: user.vcode,
          input: (args: any) => (user.vcode = args.value),
        }),
        h(ButtonComponent as any, { content: "Sign up", isPrimary: true }),
    ],
  );
}
