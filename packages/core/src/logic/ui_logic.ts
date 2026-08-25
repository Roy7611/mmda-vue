import type { EntitySearchParam } from "../models/entity";
import type { PagedList } from "../models/pagination";

export type {
  PropsMapper,
  SubGroupItemTransformParam,
  UiSelectionMode,
  UiSubGroupMode,
  Watermark,
  UiGroupWatermark,
} from "./ui_types";
export type { SelectableFn } from "../models/entity";
export type { RefFilterFn } from "../metaui/metaui_field";

export type EntityListSearcher<E = any> = (
  param: EntitySearchParam,
) => Promise<PagedList<E>>;

export * from "./field_logic";
export * from "./group_logic";
