import type { MetaUiGroup } from "@mmda/core";
import { MetaModel } from "@mmda/core";
import { translateMessage } from "../../i18n/i18n";

export type UiContext = import("../ui_context").UiViewContext<any>;

const hiddenDeletedSubRowStyle = (data: any) =>
  MetaModel.deleted(data) ? { display: "none" } : undefined;

/** Card zone: primary (main column incl. tails) | secondary (summary/aside). */
export const groupZone = (group: MetaUiGroup) =>
  group.isSecondary() ? "secondary" : "primary";

/** 同区内：主表组（!many）在前并按 groupName；子表组按 groupIdx。 */
const compareViewGroups = (a: MetaUiGroup, b: MetaUiGroup) => {
  if (a.many !== b.many) return a.many ? 1 : -1;
  if (a.many) {
    return (a.groupIdx ?? 0) - (b.groupIdx ?? 0);
  }
  return a.groupName.localeCompare(b.groupName);
};

export const sortViewGroups = (groups: MetaUiGroup[]) =>
  [...groups].sort(compareViewGroups);

export { hiddenDeletedSubRowStyle };

const uploadedFileName = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const file = value as Record<string, unknown>;
    return String(file.fileName ?? file.fileUrl ?? file.url ?? file.path ?? "");
  }
  return String(value ?? "");
};

export const uploadedFileNames = async (response: any): Promise<string[]> => {
  if (response === false || response == null) return [];
  if (Array.isArray(response)) return response.map(uploadedFileName);
  if (Array.isArray(response.data)) return response.data.map(uploadedFileName);
  if (typeof response === "string") return [response];
  if (typeof response.text !== "function") return [];
  if ("ok" in response && !response.ok) {
    throw new Error(
      translateMessage("upload.httpFail", { status: response.status }),
    );
  }
  const text = await response.text();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map(uploadedFileName);
    if (Array.isArray(parsed.data)) return parsed.data.map(uploadedFileName);
    if (typeof parsed === "string") return [parsed];
  } catch {
    return [text];
  }
  return [];
};
