import { DateTime } from "luxon";
import { isDateRangeKind } from "./date_range";
import {
  FieldFilter,
  FilterModel,
  type SetFieldFilter,
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

export interface DatePeriodTreeNode {
  id: string;
  text: string;
  children?: DatePeriodTreeNode[];
}

const sqlBound = (dt: DateTime) => dt.toFormat(SQL_DT);

function uniqueDays(values?: unknown[]): string[] {
  const days = new Set<string>();
  for (const value of values ?? []) {
    const token = DatePeriodToken.parse(value);
    if (token && DAY.test(token)) days.add(token);
  }
  return [...days].sort();
}

function rangeToBetween(range: HalfOpenDateRange): FieldFilter {
  return FieldFilter.between(sqlBound(range.start), sqlBound(range.next));
}

function expandDateSetFilter(filter: SetFieldFilter): FieldFilter {
  const tokens = filter.values
    .map((value) => DatePeriodToken.parse(value) ?? String(value ?? ""))
    .filter(DatePeriodToken.is);
  const ranges = HalfOpenDateRange.merge(
    tokens
      .map(HalfOpenDateRange.fromToken)
      .filter((item): item is HalfOpenDateRange => item != null),
  );
  if (!ranges.length) return FieldFilter.clone(filter);
  if (filter.operator === "NOT_IN") return FieldFilter.clone(filter);
  if (ranges.length === 1) return rangeToBetween(ranges[0]!);
  return FieldFilter.join(
    "OR",
    ranges.map((range) => rangeToBetween(range)),
  );
}

function expandFieldFilter(filter: FieldFilter): FieldFilter {
  const bag = filter as FieldFilter & {
    filterModels?: FieldFilter[];
    conditions?: FieldFilter[];
    values?: unknown[];
    value?: unknown;
  };
  if (bag.filterType === "multi") {
    return {
      ...bag,
      filterModels: (bag.filterModels ?? []).map(expandFieldFilter),
    };
  }
  if (bag.filterType === "join") {
    return {
      ...bag,
      conditions: (bag.conditions ?? []).map(expandFieldFilter),
    };
  }
  if (
    bag.filterType === "date" &&
    (bag.operator === "WITHIN" || isDateRangeKind(bag.value))
  ) {
    return FieldFilter.clone(bag);
  }
  if (
    bag.filterType === "set" &&
    bag.values != null &&
    DatePeriodToken.isSet(bag.values) &&
    bag.operator !== "NOT_IN"
  ) {
    return expandDateSetFilter(bag as SetFieldFilter);
  }
  return FieldFilter.clone(bag);
}

export namespace DatePeriodToken {
  export function is(value: unknown): value is DatePeriodToken {
    if (typeof value !== "string") return false;
    const token = value.trim();
    return YEAR.test(token) || MONTH.test(token) || DAY.test(token);
  }

  export function parse(value: unknown): string | undefined {
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

  export function isSet(values: unknown[]): boolean {
    return values.length > 0 && values.every((value) => is(value));
  }

  export function compact(selected: unknown[], pivotDays?: string[]): string[] {
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
        pivot.filter((day) => !covered.has(day)).map((day) => day.slice(0, 7)),
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

  export function expandLeaves(
    tokens: unknown[],
    pivotDays: string[] = [],
  ): string[] {
    const pivot = uniqueDays(pivotDays);
    const days = new Set<string>();
    for (const raw of tokens) {
      const token = parse(raw) ?? String(raw ?? "");
      if (DAY.test(token)) {
        days.add(token);
        continue;
      }
      if (MONTH.test(token)) {
        pivot
          .filter((day) => day.startsWith(`${token}-`))
          .forEach((day) => days.add(day));
        continue;
      }
      if (YEAR.test(token)) {
        pivot
          .filter((day) => day.startsWith(`${token}-`))
          .forEach((day) => days.add(day));
      }
    }
    return [...days].sort();
  }

  export function normalize(raw: unknown): string[] {
    const tokens: string[] = [];
    const seen = new Set<string>();
    const walk = (item: unknown) => {
      if (item == null) return;
      if (Array.isArray(item)) {
        item.forEach(walk);
        return;
      }
      if (typeof item === "object") {
        const record = item as Record<string, unknown>;
        walk(
          record.date ??
            record.day ??
            record.value ??
            record.start ??
            record.d,
        );
        Object.values(record).forEach(walk);
        return;
      }
      const token = parse(item);
      if (token && is(token) && !seen.has(token)) {
        seen.add(token);
        tokens.push(token);
      }
    };
    walk(raw);
    return tokens;
  }

  export function days(raw: unknown): string[] {
    return normalize(raw).filter((token) => DAY.test(token));
  }
}

export namespace HalfOpenDateRange {
  export function fromToken(token: string): HalfOpenDateRange | undefined {
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
      return {
        start: start.startOf("day"),
        next: start.plus({ days: 1 }).startOf("day"),
      };
    }
    return undefined;
  }

  export function merge(ranges: HalfOpenDateRange[]): HalfOpenDateRange[] {
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
}

export namespace DatePeriodTreeNode {
  export function fromTokens(
    tokens: unknown[],
    labels?: { month?: string },
  ): DatePeriodTreeNode[] {
    const list = DatePeriodToken.normalize(tokens);
    const years: DatePeriodTreeNode[] = [];
    const yearMap = new Map<string, DatePeriodTreeNode>();
    const monthMap = new Map<string, DatePeriodTreeNode>();
    const monthSuffix = labels?.month ?? "";

    const ensureYear = (id: string) => {
      let node = yearMap.get(id);
      if (!node) {
        node = { id, text: id, children: [] };
        yearMap.set(id, node);
        years.push(node);
      }
      return node;
    };
    const ensureMonth = (id: string) => {
      let node = monthMap.get(id);
      if (!node) {
        const year = ensureYear(id.slice(0, 4));
        const monthNum = Number(id.slice(5, 7));
        node = {
          id,
          text: Number.isFinite(monthNum) ? `${monthNum}${monthSuffix}` : id,
          children: [],
        };
        monthMap.set(id, node);
        year.children!.push(node);
      }
      return node;
    };

    for (const token of list) {
      if (YEAR.test(token)) {
        ensureYear(token);
        continue;
      }
      if (MONTH.test(token)) {
        ensureMonth(token);
        continue;
      }
      if (DAY.test(token)) {
        const month = ensureMonth(token.slice(0, 7));
        if (!month.children!.some((child) => child.id === token)) {
          month.children!.push({ id: token, text: token.slice(8, 10) });
        }
      }
    }
    return years;
  }
}

function expandDates(model?: FilterModel): FilterModel | undefined {
  if (model == null) return undefined;
  const next: FilterModel = {};
  for (const [field, filter] of Object.entries(model)) {
    const expanded = FieldFilter.compact(expandFieldFilter(filter));
    if (expanded) next[field] = expanded;
  }
  return Object.keys(next).length ? next : undefined;
}

FilterModel.expandDates = expandDates;
