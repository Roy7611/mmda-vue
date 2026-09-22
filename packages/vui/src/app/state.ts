export const enum UiDataState {
  NONE = 0,
  LOADING = 1,
  SUCCESS = 2,
  ERROR = 4,
  LOADING_MORE = 8,
}

export interface VuiLoadingState {
  state: UiDataState
  message?: string
}

export function loading(message?: string): VuiLoadingState {
  return { state: UiDataState.LOADING, message }
}

export function success(message?: string): VuiLoadingState {
  return { state: UiDataState.SUCCESS, message }
}

export function error(message?: string): VuiLoadingState {
  return { state: UiDataState.ERROR, message }
}

export type { UniListViewProps } from '@mmda/core'
