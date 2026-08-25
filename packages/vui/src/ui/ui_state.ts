export const enum UiDataState {
  NONE = 0,
  LOADING = 1,
  SUCCESS = 2,
  ERROR = 4,
  LOADING_MORE = 8,
}

export interface UiLoadingState {
  state: UiDataState
  message?: string
}

export function loading(message?: string): UiLoadingState {
  return { state: UiDataState.LOADING, message }
}

export function success(message?: string): UiLoadingState {
  return { state: UiDataState.SUCCESS, message }
}

export function error(message?: string): UiLoadingState {
  return { state: UiDataState.ERROR, message }
}

/** 移动端列表项展示约定，实现仍在后续 UiViewContext。 */
export interface UniListViewProps {
  titleKey?: string
  subtitle?: string | ((data: any) => string) | undefined
  subtitleKey?: string
  noteKey?: string
  thumbKey?: string
  thumbSize?: string
  showImage?: boolean
  imageKey?: string
  showSearch?: boolean
}
