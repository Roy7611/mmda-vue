import { DateTime } from "luxon";
import {
  betweenFilter,
  cloneFieldFilter,
  compactFieldFilter,
  joinFilter,
  type EntityFieldFilter,
  type EntityFilterModel,
  type EntitySetFieldFilter,
} from "./entity_search";

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH = /^(\d{4})-(\d{2})$/;
const YEAR = /^(\d{4})$/;
const SQL_DT = "yyyy-MM-dd HH:mm:ss";

export type DatePeriodToken = string;

export interface HalfOpenDateRange {
  start: DateTime;
  next: DateTime;
}

export function isDatePeriodToken(value: unknown): value is DatePeriodToken {
  if (typeof value !== "string") return false;
  const token = value.trim();
  return YEAR.test(token) || MONTH.test(token) || DAY.test(token);
}

export function toDatePeriodToken(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return DateTime.fromJSDate(value).toFormat("yyyy-MM-dd");
  }
  if (typeof value !== "string") return undefined;
  const raw = value.trim();
  const day = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (day) return day[1];
  if (MONTH.test(raw) || YEAR.test(raw)) return raw;
  return undefined;
}

export function dateTokenToHalfOpen(
  token: string,
): HalfOpenDateRange | undefined {
  const t = token.trim();
  if (YEAR.test(t)) {
    const start = DateTime.fromObject({ year: Number(t), month: 1, day: 1 });
    if (!start.isValid) return undefined;
    return { start, next: start.plus({ years: 1 }) };
  }
  if (MONTH.test(t)) {
    const [year, month] = t.split("-").map(Number);
    const start = DateTime.fromObject({ year, month, day: 1 });
    if (!start.isValid) return undefined;
    return { start, next: start.plus({ months: 1 }) };
  }
  if (DAY.test(t)) {
    const start = DateTime.fromISO(t);
    if (!start.isValid) return undefined;
    return { start: start.startOf("day"), next: start.plus({ days: 1 }).startOf("day") };
  }
  return undefined;
}

export function mergeHalfOpenRanges(
  ranges: HalfOpenDateRange[],
): HalfOpenDateRange[] {
  const sorted = [...ranges].sort(
    (a, b) => a.start.toMillis() - b.start.toMillis(),
  );
  const merged: HalfOpenDateRange[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && last.next.toMillis() >= range.start.toMillis()) {
      if (range.next.toMillis() > last.next.toMillis()) last.next = range.next;
    } else {
      merged.push({ start: range.start, next: range.next });
    }
  }
  return merged;
}

const sqlBound = (dt: DateTime) => dt.toFormat(SQL_DT);

function rangeToBetween(range: HalfOpenDateRange): EntityFieldFilter {
  return betweenFilter(sqlBound(range.start), sqlBound(range.next));
}

export function isDatePeriodSet(values: unknown[]): boolean {
  return values.length > 0 && values.every((value) => isDatePeriodToken(value));
}

/**
 * Excel 日叶子对照 pivot 全选则收成年/月 token。
 */
export function compactDateSet(
  selected: unknown[],
  pivotDays?: string[],
): string[] {
  const days = uniqueDays(selected);
  if (!days.length) return [];
  const pivot = uniqueDays(pivotDays?.length ? pivotDays : days);
  const selectedSet = new Set(days);
  const covered = new Set<string>();
  const tokens: string[] = [];

  const years = [...new Set(pivot.map((day) => day.slice(0, 4)))].sort();
  for (const year of years) {
    const yearDays = pivot.filter((day) => day.startsWith(`${year}-`));
    if (yearDays.length && yearDays.every((day) => selectedSet.has(day))) {
      tokens.push(year);
      yearDays.forEach((day) => covered.add(day));
    }
  }

  const months = [
    ...new Set(
      pivot
        .filter((day) => !covered.has(day))
        .map((day) => day.slice(0, 7)),
    ),
  ].sort();
  for (const month of months) {
    const monthDays = pivot.filter((day) => day.startsWith(`${month}-`));
    if (monthDays.length && monthDays.every((day) => selectedSet.has(day))) {
      tokens.push(month);
      monthDays.forEach((day) => covered.add(day));
    }
  }

  for (const day of days) {
    if (!covered.has(day)) tokens.push(day);
  }
  return tokens.sort();
}

export function expandDateSetLeaves(
  tokens: unknown[],
  pivotDays: string[] = [],
): string[] {
  const pivot = uniqueDays(pivotDays);
  const days = new Set<string>();
  for (const raw of tokens) {
    const token = toDatePeriodToken(raw) ?? String(raw ?? "");
    if (DAY.test(token)) {
      days.add(token);
      continue;
    }
    if (MONTH.test(token)) {
      pivot.filter((day) => day.startsWith(`${token}-`)).forEach((day) => days.add(day));
      continue;
    }
    if (YEAR.test(token)) {
      pivot.filter((day) => day.startsWith(`${token}-`)).forEach((day) => days.add(day));
    }
  }
  return [...days].sort();
}

function uniqueDays(values?: unknown[]): string[] {
  const days = new Set<string>();
  for (const value of values ?? []) {
    const token = toDatePeriodToken(value);
    if (token && DAY.test(token)) days.add(token);
  }
  return [...days].sort();
}

export function expandDateSetFilter(
  filter: EntitySetFieldFilter,
): EntityFieldFilter {
  const tokens = filter.values
    .map((value) => toDatePeriodToken(value) ?? String(value ?? ""))
    .filter(isDatePeriodToken);
  const ranges = mergeHalfOpenRanges(
    tokens
      .map(dateTokenToHalfOpen)
      .filter((item): item is HalfOpenDateRange => item != null),
  );
  if (!ranges.length) return cloneFieldFilter(filter);
  if (filter.operator === "NOT_IN") return cloneFieldFilter(filter);
  if (ranges.length === 1) return rangeToBetween(ranges[0]!);
  return joinFilter(
    "OR",
    ranges.map((range) => rangeToBetween(range)),
  );
}

function expandFieldFilter(filter: EntityFieldFilter): EntityFieldFilter {
  if (filter.filterType === "multi") {
    return {
      ...filter,
      filterModels: filter.filterModels.map(expandFieldFilter),
    };
  }
  if (filter.filterType === "join") {
    return {
      ...filter,
      conditions: filter.conditions.map(expandFieldFilter),
    };
  }
  if (filter.filterType === "date" && filter.dateKind) {
    return cloneFieldFilter(filter);
  }
  if (
    filter.filterType === "set" &&
    isDatePeriodSet(filter.values) &&
    filter.operator !== "NOT_IN"
  ) {
    return expandDateSetFilter(filter);
  }
  return cloneFieldFilter(filter);
}

/** 绝对日期 set token → BETWEEN / join OR。不展开 dateKind。 */
export function expandDateFilters(
  model?: EntityFilterModel,
): EntityFilterModel | undefined {
  if (model == null) return undefined;
  const next: EntityFilterModel = {};
  for (const [field, filter] of Object.entries(model)) {
    const expanded = compactFieldFilter(expandFieldFilter(filter));
    if (expanded) next[field] = expanded;
  }
  return Object.keys(next).length ? next : undefined;
}

export function normalizePivotDates(raw: unknown): string[] {
  const days = new Set<string>();
  const walk = (item: unknown) => {
    if (item == null) return;
    if (Array.isArray(item)) {
      item.forEach(walk);
      return;
    }
    if (typeof item === "object") {
      const record = item as Record<string, unknown>;
      walk(record.date ?? record.day ?? record.value ?? record.start);
      Object.values(record).forEach(walk);
      return;
    }
    const token = toDatePeriodToken(item);
    if (token && DAY.test(token)) days.add(token);
  };
  walk(raw);
  return [...days].sort();
}
