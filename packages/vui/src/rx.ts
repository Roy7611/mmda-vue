import { reactive,isReactive, type UnwrapNestedRefs } from "vue";

export type Rx<T> = UnwrapNestedRefs<T>;

export function rx<T extends object>(value: T): Rx<T> {
  if(isReactive(value)) return value as Rx<T>;
  return reactive<T>(value);
}