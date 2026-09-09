import type { MetaUiField } from '@mmda/core'
import { h, type VNode } from 'vue'
import type {UiProps} from '../layout/layout'
import {
  createFileUploader,
  createFilesUploader,
  createImageUploader,
  createImagesUploader,
} from '../../components/FileUploaderHost'
import {
  fileLinkLabelOf,
  fileLinkPropsFromField,
  renderFileLink,
} from './file_link'
import {
  fileUploaderPropsFromField,
  filesUploaderPropsFromField,
  type FileUploaderFieldContext,
} from './file_uploader'
import {
  imageUploaderPropsFromField,
  imagesUploaderPropsFromField,
} from './image_uploader'

type Ctx = FileUploaderFieldContext & {
  editing?: boolean
}

async function editImageFromContext(
  context: Ctx,
  src: string,
): Promise<File | void> {
  const ui = context.uiBuilder
  if (ui?.imageEditorPlugin?.installed !== true || !ui.buildImageEditor) {
    return
  }
  return new Promise((resolve) => {
    const node = ui.buildImageEditor({
      src,
      onSave: (result: { blob: Blob }) => {
        const name = src.split(/[\\/]/).pop() || 'image.png'
        resolve(
          new File([result.blob], name, {
            type: result.blob.type || 'image/png',
          }),
        )
      },
    })
    if (ui.buildDialog) {
      ui.buildDialog(node, { title: nameFromSrc(src) })
    }
  })
}

function nameFromSrc(src: string): string {
  return src.split(/[?#]/)[0].split(/[\\/]/).pop() || src
}

function previewFileFromContext(context: Ctx, url: string): void {
  const ui = context.uiBuilder
  if (ui?.buildFilePreview && ui.buildDialog) {
    ui.buildDialog(ui.buildFilePreview(url, { height: '70vh' }), {
      title: fileLinkLabelOf({ url }),
    })
    return
  }
}

const imageReadonly = (
  field: MetaUiField,
  context: Ctx,
  extra: UiProps,
): VNode => {
  const src = String(context.getFieldValue(field, extra.row) ?? '')
  return h('img', {
    class: 'mmda-image',
    src,
    alt: extra.alt as string | undefined,
  })
}

export function renderFileUploaderField(
  field: MetaUiField,
  context: Ctx,
  extra: UiProps = {},
): VNode {
  const props = fileUploaderPropsFromField(field, context, extra)
  if (props.readOnly) {
    return renderFileLink(fileLinkPropsFromField(field, context, extra))
  }
  return createFileUploader(props)
}

export function renderFilesUploaderField(
  field: MetaUiField,
  context: Ctx,
  extra: UiProps = {},
): VNode {
  return createFilesUploader(
    filesUploaderPropsFromField(field, context, extra),
  )
}

export function renderImageUploaderField(
  field: MetaUiField,
  context: Ctx,
  extra: UiProps = {},
): VNode {
  const showImageEditor =
    extra.showImageEditor === true ||
    context.uiBuilder?.imageEditorPlugin?.installed === true
  const props = imageUploaderPropsFromField(field, context, {
    ...extra,
    showImageEditor,
    editImage:
      extra.editImage ??
      ((src: string) => editImageFromContext(context, src)),
  })
  if (props.readOnly) return imageReadonly(field, context, extra)
  return createImageUploader(props)
}

export function renderImagesUploaderField(
  field: MetaUiField,
  context: Ctx,
  extra: UiProps = {},
): VNode {
  const showImageEditor =
    extra.showImageEditor === true ||
    context.uiBuilder?.imageEditorPlugin?.installed === true
  return createImagesUploader(
    imagesUploaderPropsFromField(field, context, {
      ...extra,
      showImageEditor,
      editImage:
        extra.editImage ??
        ((src: string) => editImageFromContext(context, src)),
    }),
  )
}

export function renderFileLinkField(
  field: MetaUiField,
  context: Ctx,
  extra: UiProps = {},
): VNode {
  const preview =
    extra.preview === true
      ? true
      : extra.preview === false
        ? false
        : undefined
  const ui = context.uiBuilder
  return renderFileLink(
    fileLinkPropsFromField(field, context, {
      ...extra,
      preview,
      onPreview:
        extra.onPreview ??
        (ui?.buildFilePreview && ui.buildDialog
          ? (url: string) => previewFileFromContext(context, url)
          : undefined),
    }),
  )
}
