import type { ChildContextOptions } from "./types";

export type SessionFactory = (
  options: Record<string, unknown>,
  child?: ChildContextOptions,
) => any;

let factory: SessionFactory | undefined;

export function setSessionFactory(fn: SessionFactory) {
  factory = fn;
}

export function createSession(
  options: Record<string, unknown>,
  child?: ChildContextOptions,
) {
  if (!factory) {
    throw new Error("VueUiContext session factory is not set.");
  }
  return factory(options, child);
}
