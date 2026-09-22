import { createElement, useState, type ReactNode } from "react";

export interface SfSigninFormProps {
  loading?: boolean;
  error?: string;
  onSubmit?: (values: { username: string; password: string }) => void;
  children?: ReactNode;
}

export function SfSigninForm(props: SfSigninFormProps): ReactNode {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return createElement(
    "form",
    {
      className: "mmda-signin-form",
      onSubmit: (event: any) => {
        event.preventDefault();
        props.onSubmit?.({ username, password });
      },
    },
    createElement(
      "label",
      null,
      createElement("span", null, "用户名"),
      createElement("input", {
        value: username,
        autoComplete: "username",
        onChange: (event: any) => setUsername(event.target.value),
      }),
    ),
    createElement(
      "label",
      null,
      createElement("span", null, "密码"),
      createElement("input", {
        type: "password",
        value: password,
        autoComplete: "current-password",
        onChange: (event: any) => setPassword(event.target.value),
      }),
    ),
    props.error
      ? createElement("div", { className: "mmda-signin-error" }, props.error)
      : null,
    createElement(
      "button",
      { type: "submit", disabled: props.loading },
      "登录",
    ),
    props.children,
  );
}
