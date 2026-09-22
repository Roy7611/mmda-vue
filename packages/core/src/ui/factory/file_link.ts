import type { UiProps } from '../props'
import type { MetaUiField } from '../../metaui/metaui_field'
export type UiFileLinkPreviewKind = 'none' | 'app' | 'browser'

export const FILE_LINK_APP_PREVIEW_EXTS = ['xlsx', 'xls', 'docx', 'doc'] as const

export const FILE_LINK_BROWSER_PREVIEW_EXTS = ['pdf', 'txt', 'csv'] as const

export interface UiFileLinkProps extends UiProps {
  url?: string
  downloadable?: boolean
  preview?: boolean
  fileName?: string
  fileIcon?: string
  onPreview?: (url: string) => void
}

export function fileLinkUrlOf(props: UiFileLinkProps): string {
  return String(props.url ?? '').trim()
}

export function fileLinkDownloadableOf(props: UiFileLinkProps): boolean {
  return props.downloadable !== false
}

export function fileLinkExtOf(url: string, fileName?: string): string {
  const name = fileName || url
  const slash = name.lastIndexOf('/')
  const base = slash >= 0 ? name.slice(slash + 1) : name
  const q = base.indexOf('?')
  const clean = q >= 0 ? base.slice(0, q) : base
  const dot = clean.lastIndexOf('.')
  if (dot < 0) return ''
  return clean.slice(dot + 1).toLowerCase()
}

export function fileLinkPreviewKindOf(
  props: UiFileLinkProps,
): UiFileLinkPreviewKind {
  if (props.preview !== true) return 'none'
  const ext = fileLinkExtOf(fileLinkUrlOf(props), props.fileName)
  if ((FILE_LINK_APP_PREVIEW_EXTS as readonly string[]).includes(ext)) return 'app'
  if ((FILE_LINK_BROWSER_PREVIEW_EXTS as readonly string[]).includes(ext)) {
    return 'browser'
  }
  return 'none'
}

export type FileLinkFieldContext = {
  getFieldValue: (field: MetaUiField, row?: any) => unknown
  displayField?: (field: MetaUiField, row?: any) => unknown
  getModuleAuth?: (
    entity?: Record<string, any>,
  ) => { allowDownload?: boolean } | undefined
}

export function fileLinkPropsFromField(
  field: MetaUiField,
  context: FileLinkFieldContext,
): UiFileLinkProps {
  const url = String(context.getFieldValue(field) ?? '')
  const displayed = context.displayField?.(field)
  const auth = context.getModuleAuth?.()
  return {
    url,
    fileName:
      displayed != null && String(displayed) !== url
        ? String(displayed)
        : undefined,
    downloadable: auth?.allowDownload !== false,
  }
}
