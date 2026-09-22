import { registerLicense } from "@syncfusion/ej2-base";
import "./style.css";
import "./fontawesome.css";

export { SfReactUiBuilder } from "./builder";
export { SfReactUiFactory } from "./factory";
export { SfReactUiFieldFactory } from "./field_factory";
export { SfReactUiLayout } from "./layout";
export {
  SfReactUiOverlay,
  sfReactUiOverlay,
  SfReactUiOverlayHost,
} from "./overlay";
export * from "./syncfusion_i18n";
import { installSyncfusionLocale } from "./syncfusion_i18n";
export * from "./components";

export interface MmdaSyncfusionOptions {
  licenseKey?: string;
  /** MMDA/React locale (`zh` / `en` / `zh-Hant`) or a raw EJ2 L10n pack. */
  locale?: string | Record<string, unknown>;
}

function resolveLicense(options: MmdaSyncfusionOptions) {
  if (options.licenseKey) return options.licenseKey;
  try {
    return (import.meta as any).env?.VITE_SYNCFUSION_LICENSE as
      string | undefined;
  } catch {
    return undefined;
  }
}

/** Installs Syncfusion license and locale. */
export function installSyncfusion(options: MmdaSyncfusionOptions = {}): void {
  const key = resolveLicense(options);
  if (key) registerLicense(key);
  installSyncfusionLocale(options.locale);
}
