import type { Entity } from "@mmda/core";
import {
  UiBuildContext,
  type UiBuildContextOptions,
} from "../ui/ui_build_context";

/** 屏级上下文工厂。行为由 `view` 在 UiViewContext / UiBuildContext 内分支。 */
export function createUiBuildContext<E extends Entity>(
  options: UiBuildContextOptions<E>,
): UiBuildContext<any> {
  return new UiBuildContext(options);
}
