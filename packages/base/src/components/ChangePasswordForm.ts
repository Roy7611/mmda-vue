import { defineComponent, h, reactive } from "vue";
import { useI18n } from "vue-i18n";

export const ChangePasswordForm = defineComponent({
  name: "ChangePasswordForm",
  emits: ["getTepModel"],
  setup(_props, { emit }) {
    const { t } = useI18n();
    const data = reactive({
      userID: "",
      newPwd: "",
      newPwdAgain: "",
    });
    const emitModel = () => emit("getTepModel", data);
    return () =>
      h(
        "div",
        {
          class: "mmda-change-password",
          style: { display: "grid", gap: "12px" },
        },
        [
          h("label", [
            t("auth.newPassword"),
            h("input", {
              type: "password",
              autocomplete: "new-password",
              onInput: (event: Event) => {
                data.newPwd = (event.target as HTMLInputElement).value;
                emitModel();
              },
            }),
          ]),
          h("label", [
            t("auth.confirmNewPassword"),
            h("input", {
              type: "password",
              autocomplete: "new-password",
              onInput: (event: Event) => {
                data.newPwdAgain = (event.target as HTMLInputElement).value;
                emitModel();
              },
            }),
          ]),
        ],
      );
  },
});

export const changeUsePwd = ChangePasswordForm;
