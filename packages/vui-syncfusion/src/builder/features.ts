import { h, reactive } from "vue";
import type { UiProps } from "@mmda/vui"
import type { SigninFormProps, SignupFormProps, SigninFormSlots } from "@mmda/vui"
import { ButtonComponent } from "@syncfusion/ej2-vue-buttons";
import { TextBoxComponent } from "@syncfusion/ej2-vue-inputs";
import { SfBpmnDiagram } from "../components/SfBpmnDiagram";
import { SfSigninForm } from "../components/SfSigninForm";
import type { UiContext } from "./utils";

export function buildBpmnDiagram(
  flowTrails: any[],
  _context: UiContext,
  props: UiProps = {},
) {
  return h("section", { class: "mmda-flow", ...props }, [
    h(SfBpmnDiagram, {
      nodes: props.nodes,
      connectors: props.connectors,
      readonly: props.readonly ?? true,
      height: props.height,
    }),
    flowTrails?.length
      ? h(
          "ol",
          { class: "mmda-flow__trails" },
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
      class: "mmda-auth-form",
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
