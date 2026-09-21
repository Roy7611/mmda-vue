/*
 * chrome 文件链接走 factory.fileLink。vui 名是 fileLink。
 * Url / FileLink 别名到本控件。不要 externalLink（那是关联实体）。
 * 图片走 factory.image / imageGallery，不要塞进 FileLink。
 */
import type { MetaUiField } from '@mmda/core'
import {
  fileLinkDownloadableOf,
  fileLinkPreviewKindOf,
  fileLinkUrlOf,
  type UiFileLinkProps,
  type UiProps,
  uiRenderProps
} from '@mmda/core'
import { h, type VNode } from 'vue'
import { getFileInfo } from '../../components/FileIcons'

export type { UiFileLinkPreviewKind, UiFileLinkProps } from '@mmda/core'
export {
  FILE_LINK_APP_PREVIEW_EXTS,
  FILE_LINK_BROWSER_PREVIEW_EXTS,
  fileLinkDownloadableOf,
  fileLinkExtOf,
  fileLinkPreviewKindOf,
  fileLinkUrlOf,
} from '@mmda/core'

export type FileLinkFieldContext = {
  getFieldValue: (field: MetaUiField, row?: unknown) => unknown
  displayField?: (field: MetaUiField, row?: unknown) => unknown
  getModuleAuth?: (entity?: Record<string, any>) =>
    | { allowDownload?: boolean }
    | undefined
}

export function fileLinkLabelOf(props: UiFileLinkProps): string {
  if (props.fileName) return props.fileName
  const url = fileLinkUrlOf(props)
  return getFileInfo(url).fileName || url
}

export function fileLinkIconOf(props: UiFileLinkProps): string {
  if (props.fileIcon) return props.fileIcon
  return getFileInfo(fileLinkUrlOf(props) || props.fileName).fileIcon
}

export function fileLinkModifierClasses(props: UiFileLinkProps): unknown[] {
  const kind = fileLinkPreviewKindOf(props)
  return [
    'mmda-file-link',
    fileLinkDownloadableOf(props) ? undefined : 'mmda-file-link--blocked',
    kind !== 'none' ? 'mmda-file-link--preview' : undefined,
    props.class,
  ]
}

export function openFileLinkPreview(props: UiFileLinkProps): void {
  const url = fileLinkUrlOf(props)
  if (!url) return
  const kind = fileLinkPreviewKindOf(props)
  if (kind === 'app') {
    if (props.onPreview) props.onPreview(url)
    else window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  if (kind === 'browser') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

export function renderFileLink(props: UiFileLinkProps = {}): VNode {
  const url = fileLinkUrlOf(props)
  const label = fileLinkLabelOf(props)
  const icon = fileLinkIconOf(props)
  const downloadable = fileLinkDownloadableOf(props)
  const previewKind = fileLinkPreviewKindOf(props)
  const className = fileLinkModifierClasses(props)
  const iconNode = h('i', {
    class: icon,
    'aria-hidden': 'true',
  })
  const inner = [iconNode, h('span', { class: 'mmda-file-link__name' }, label)]
  const attrs = uiRenderProps(props).attributes

  if (downloadable && url) {
    return h(
      'a',
      {
        ...attrs,
        class: className,
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
        onClick: (event: MouseEvent) => {
          if (previewKind === 'none') return
          event.preventDefault()
          openFileLinkPreview(props)
        },
      },
      inner,
    )
  }

  return h(
    'span',
    {
      ...attrs,
      class: className,
      onClick:
        previewKind !== 'none' && url
          ? () => openFileLinkPreview(props)
          : undefined,
    },
    inner,
  )
}

export function fileLinkPropsFromField(
  field: MetaUiField,
  context: FileLinkFieldContext
): UiFileLinkProps {
  const url = String(
    context.getFieldValue(field) ?? '',
  )
  const displayed = context.displayField?.(field)
  const auth = context.getModuleAuth?.()
  return {
    url,
    fileName:
      (displayed != null && String(displayed) !== url
        ? String(displayed)
        : undefined),
    downloadable: auth?.allowDownload !== false,
  }
}
