import type { EntitySearchParam } from "../models/entity";
import type { PagedList } from "../models/pagination";

export type {
  UiSelectionMode,
  UiSubGroupView,
} from "./ui_types";
export type { SelectableFn } from "../models/entity";
export * from "./logic_functions";
export * from "./field_logic";
export * from "./group_logic";

export type EntityListSearcher<E = any> = (
  param: EntitySearchParam,
) => Promise<PagedList<E>>;
