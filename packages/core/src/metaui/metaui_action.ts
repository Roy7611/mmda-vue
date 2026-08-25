import type { Predicate } from './metaui_field'

export type ActionCallback = (...args: any[]) => any

/** 按钮/行为的界面元数据。 */
export interface EntityAction {
  [index: string]: any
  name: string
  icon?: string
  label?: string
  role?: string
  redirectTo?: string
  description?: string
  param?: any
  disabled?: boolean
  group?: string
  view?: string
  onAction?: ActionCallback
  visible?: Predicate
}

export enum EntityActionType {
  CREATE = 'create',
  CONFIRM = 'confirm',
  CANCEL = 'cancel',
  EDIT = 'edit',
  SAVE = 'save',
  DELETE = 'delete',
  DELETEALL = 'deleteAll',
  PRINT = 'print',
  IMPORT = 'import',
  EXPORT = 'export',
  REFRESH = 'refresh',
  BACK = 'back',
  ADD = 'add',
  REMOVE = 'remove',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  CLEAR = 'clear',
  RESET = 'reset',
  SEARCH = 'search',
  ADDCHILD = 'addChild',
  REMOVECHILD = 'removeChild',
}

const action = (
  type: EntityActionType,
  role: string,
  onAction: ActionCallback,
): EntityAction => ({
  id: `${type}-button`,
  name: type,
  role,
  onAction,
})

export const entityActionFactory: Record<
  string,
  (onAction: ActionCallback) => EntityAction
> = {
  back: cb => action(EntityActionType.BACK, 'secondary', cb),
  create: cb => action(EntityActionType.CREATE, 'primary', cb),
  confirm: cb => action(EntityActionType.CONFIRM, 'primary', cb),
  cancel: cb => action(EntityActionType.CANCEL, 'danger', cb),
  edit: cb => action(EntityActionType.EDIT, 'info', cb),
  save: cb => action(EntityActionType.SAVE, 'success', cb),
  delete: cb => action(EntityActionType.DELETE, 'danger', cb),
  deleteAll: cb => action(EntityActionType.DELETEALL, 'danger', cb),
  print: cb => action(EntityActionType.PRINT, 'info', cb),
  import: cb => action(EntityActionType.IMPORT, 'primary', cb),
  export: cb => action(EntityActionType.EXPORT, 'info', cb),
  refresh: cb => action(EntityActionType.REFRESH, 'info', cb),
  add: cb => action(EntityActionType.ADD, 'primary', cb),
  remove: cb => action(EntityActionType.REMOVE, 'danger', cb),
}
