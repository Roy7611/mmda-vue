import { defineComponent, h, nextTick, onBeforeUnmount, ref, type PropType, type VNode } from 'vue'
import { getFileInfo } from './FileIcons'
import {
  fileKeyOf,
  fileUploaderAcceptOf,
  fileUploaderAutoUploadOf,
  fileUploaderModifierClasses,
  fileUploaderTakeOne,
  filesUploaderShowDropAreaOf,
  type UiFileUploadItem,
  type UiFileUploaderController,
  type UiFileUploaderProps,
  type UiFilesUploaderProps,
  type UiFileUploadControl,
} from '../ui/factory/file_uploader'
import { renderFileLink } from '../ui/factory/file_link'
import { IMAGE_UPLOADER_EXTENSIONS } from '../ui/factory/image_uploader'
import type {
  UiImageUploaderProps,
  UiImagesUploaderProps,
} from '../ui/factory/image_uploader'

type Kind = 'file' | 'image'

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

const formatTime = (ms: number) => {
  try {
    return new Date(ms).toLocaleString()
  } catch {
    return ''
  }
}

export const MmdaFileUploaderHost = defineComponent({
  name: 'MmdaFileUploaderHost',
  props: {
    kind: { type: String as PropType<Kind>, default: 'file' },
    multiple: { type: Boolean, default: false },
    url: String,
    autoUpload: Boolean,
    allowedExtensions: String,
    minFileSize: Number,
    maxFileSize: Number,
    showDropArea: { type: Boolean, default: true },
    disabled: Boolean,
    readOnly: Boolean,
    dropText: String,
    downloadable: { type: Boolean, default: true },
    preview: Boolean,
    showImageEditor: Boolean,
    urls: Array as PropType<string[]>,
    onUpload: Function as PropType<
      (file: File, control: UiFileUploadControl) => Promise<string>
    >,
    onSelected: Function as PropType<(value: File | File[] | undefined) => void>,
    onReady: Function as PropType<(controller: UiFileUploaderController) => void>,
    onRemove: Function as PropType<(item: UiFileUploadItem) => void>,
    editImage: Function as PropType<(src: string) => Promise<File | void>>,
    class: [String, Array, Object],
  },
  setup(props) {
    const input = ref<HTMLInputElement>()
    const items = ref<UiFileUploadItem[]>([])
    const controllerRef = ref<AbortController>()

    const accept = () =>
      fileUploaderAcceptOf(
        props.allowedExtensions ??
          (props.kind === 'image' ? IMAGE_UPLOADER_EXTENSIONS : undefined),
      )

    const revoke = (item: UiFileUploadItem) => {
      if (item.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl)
    }

    const seedFromUrl = () => {
      if (props.multiple) {
        const urls = (props.urls ?? []).filter(Boolean)
        if (!urls.length) return
        items.value = urls.map((url) => ({
          key: url,
          url,
          status: 'success' as const,
          progress: 100,
        }))
        return
      }
      if (!props.url) return
      items.value = [
        {
          key: props.url,
          url: props.url,
          status: 'success',
          progress: 100,
        },
      ]
    }
    seedFromUrl()

    const auto = () =>
      fileUploaderAutoUploadOf(
        { autoUpload: props.autoUpload } as UiFileUploaderProps,
        props.multiple,
      )

    const choose = () => {
      if (props.disabled || props.readOnly) return
      input.value?.click()
    }

    const runUpload = async (item: UiFileUploadItem) => {
      if (!item.file || !props.onUpload) return
      const abort = new AbortController()
      controllerRef.value = abort
      item.status = 'uploading'
      item.progress = 0
      item.error = undefined
      try {
        const url = await props.onUpload(item.file, {
          signal: abort.signal,
          onProgress: (value) => {
            item.progress = Math.max(0, Math.min(100, Math.round(value)))
          },
        })
        item.url = url
        item.status = 'success'
        item.progress = 100
        if (item.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl)
          item.previewUrl = undefined
        }
      } catch (error) {
        if (abort.signal.aborted) {
          item.status = 'pending'
          item.progress = 0
          return
        }
        item.status = 'error'
        item.error = error instanceof Error ? error.message : String(error)
      }
    }

    const addFiles = (list: File[]) => {
      if (props.disabled || props.readOnly) return
      let files = list
      if (!props.multiple) {
        const one = fileUploaderTakeOne(list)
        files = one ? [one] : []
        for (const old of items.value) revoke(old)
        items.value = []
      }
      const next: UiFileUploadItem[] = files.map((file) => ({
        key: fileKeyOf(file),
        file,
        status: 'pending' as const,
        progress: 0,
        previewUrl:
          props.kind === 'image' ? URL.createObjectURL(file) : undefined,
      }))
      items.value = props.multiple ? [...items.value, ...next] : next
      if (props.multiple) {
        ;(props.onSelected as ((files: File[]) => void) | undefined)?.(
          items.value.map((item) => item.file).filter(Boolean) as File[],
        )
      } else {
        ;(props.onSelected as ((file?: File) => void) | undefined)?.(
          next[0]?.file,
        )
      }
      if (auto()) {
        void nextTick(() => {
          for (const item of next) void runUpload(item)
        })
      }
    }

    const onInput = (event: Event) => {
      const el = event.target as HTMLInputElement
      addFiles(Array.from(el.files ?? []))
      el.value = ''
    }

    const onDrop = (event: DragEvent) => {
      event.preventDefault()
      addFiles(Array.from(event.dataTransfer?.files ?? []))
    }

    const cancel = () => controllerRef.value?.abort()

    const clear = () => {
      if (items.value.some((item) => item.status === 'uploading')) cancel()
      for (const item of items.value) revoke(item)
      items.value = []
    }

    const controller: UiFileUploaderController = {
      choose,
      upload: () => {
        for (const item of items.value) {
          if (item.status === 'pending' || item.status === 'error')
            void runUpload(item)
        }
      },
      cancel,
      clear,
      getFiles: () =>
        items.value.map((item) => item.file).filter(Boolean) as File[],
    }
    props.onReady?.(controller)

    onBeforeUnmount(() => {
      for (const item of items.value) revoke(item)
    })

    const thumb = (item?: UiFileUploadItem) => {
      const src = item?.url || item?.previewUrl
      if (!src) {
        return h('div', {
          class: ['mmda-file-uploader__thumb', 'is-empty'],
          'aria-hidden': 'true',
        })
      }
      return h('img', {
        class: 'mmda-file-uploader__thumb',
        src,
        alt: item ? displayName(item) : '',
        onClick: () => window.open(src, '_blank', 'noopener,noreferrer'),
      })
    }

    const applyEditedFile = (item: UiFileUploadItem, file: File) => {
      revoke(item)
      item.file = file
      item.url = undefined
      item.status = 'pending'
      item.progress = 0
      item.error = undefined
      item.previewUrl = URL.createObjectURL(file)
      item.key = fileKeyOf(file)
      if (auto()) void runUpload(item)
    }

    const startEdit = async (item: UiFileUploadItem) => {
      const src = item.url || item.previewUrl
      if (!src || !props.editImage) return
      const file = await props.editImage(src)
      if (file) applyEditedFile(item, file)
    }

    const displayName = (item: UiFileUploadItem) =>
      item.url
        ? getFileInfo(item.url).fileName
        : (item.file?.name ?? '')

    const progress = (item: UiFileUploadItem) =>
      item.status === 'uploading'
        ? h('div', { class: 'mmda-file-uploader__progress' }, [
            h('div', {
              class: 'mmda-file-uploader__progress-bar',
              style: { width: `${item.progress}%` },
            }),
            h('span', `${item.progress}%`),
          ])
        : null

    const errorLine = (item: UiFileUploadItem) =>
      item.status === 'error'
        ? h('div', { class: 'mmda-file-uploader__error' }, item.error)
        : null

    const iconButton = (
      title: string,
      icon: string,
      onClick: () => void,
      extraClass?: string,
    ) =>
      h(
        'button',
        {
          type: 'button',
          class: ['mmda-file-uploader__icon-btn', extraClass],
          title,
          disabled: props.disabled,
          onClick: (event: Event) => {
            event.preventDefault()
            event.stopPropagation()
            onClick()
          },
        },
        h('i', { class: icon, 'aria-hidden': 'true' }),
      )

    const hiddenInput = () =>
      h('input', {
        ref: input,
        type: 'file',
        class: 'mmda-file-uploader__input',
        accept: accept(),
        multiple: props.multiple,
        disabled: props.disabled || props.readOnly,
        onChange: onInput,
      })

    const singleFileBox = () => {
      const item = items.value[0]
      if (props.readOnly && item?.url) {
        if (props.kind === 'image') {
          return h('img', {
            class: 'mmda-file-uploader__thumb',
            src: item.url,
            alt: getFileInfo(item.url).fileName,
            onClick: () =>
              window.open(item.url, '_blank', 'noopener,noreferrer'),
          })
        }
        return renderFileLink({
          url: item.url,
          downloadable: props.downloadable,
          preview: props.preview,
        })
      }
      const name =
        item == null
          ? ''
          : item.status === 'success' && item.url
            ? getFileInfo(item.url).fileName
            : (item.file?.name ?? '')
      const rightIcon =
        item?.status === 'uploading'
          ? iconButton('取消', 'fas fa-times', cancel)
          : item?.status === 'error'
            ? iconButton('重试', 'fas fa-upload', () => void runUpload(item))
            : iconButton(
                item ? '重选' : '选择文件',
                'fas fa-paperclip',
                choose,
              )
      const editIcon =
        props.kind === 'image' &&
        props.showImageEditor &&
        item &&
        (item.previewUrl || item.url) &&
        item.status !== 'uploading'
          ? iconButton('编辑', 'fas fa-crop', () => {
              void startEdit(item)
            })
          : null
      const valueNode =
        item?.status === 'success' && item.url
          ? renderFileLink({
              url: item.url,
              downloadable: props.downloadable,
              preview: props.preview,
            })
          : h('span', { class: 'mmda-file-uploader__value' }, name)
      const box = h(
        'div',
        {
          class: 'mmda-file-uploader__box',
          onClick: choose,
          onDragover: (event: DragEvent) => event.preventDefault(),
          onDrop,
        },
        [
          props.kind === 'image' ? thumb(item) : null,
          valueNode,
          editIcon,
          rightIcon,
        ],
      )
      return h('div', { class: 'mmda-file-uploader__single' }, [
        hiddenInput(),
        box,
        item ? progress(item) : null,
        item ? errorLine(item) : null,
      ])
    }

    const multiList = () =>
      h(
        'ul',
        { class: 'mmda-file-uploader__list' },
        items.value.map((item) =>
          h('li', { key: item.key, class: `is-${item.status}` }, [
            props.kind === 'image'
              ? thumb(item)
              : h('i', {
                  class: getFileInfo(item.url || item.file?.name).fileIcon,
                  'aria-hidden': 'true',
                }),
            h('div', { class: 'mmda-file-uploader__meta' }, [
              item.status === 'success' && item.url
                ? renderFileLink({
                    url: item.url,
                    downloadable: props.downloadable,
                    preview: props.preview,
                  })
                : h('div', { class: 'mmda-file-uploader__name' }, displayName(item)),
              h(
                'small',
                [
                  item.file ? formatSize(item.file.size) : '',
                  item.file ? formatTime(item.file.lastModified) : '',
                ]
                  .filter(Boolean)
                  .join(' · '),
              ),
              progress(item),
              errorLine(item),
            ]),
            h('div', { class: 'mmda-file-uploader__ops' }, [
              item.status === 'uploading'
                ? iconButton('取消', 'fas fa-times', cancel)
                : [
                    item.status !== 'success'
                      ? iconButton('上传', 'fas fa-upload', () =>
                          void runUpload(item),
                        )
                      : props.downloadable && item.url
                        ? iconButton('下载', 'fas fa-download', () => {
                            window.open(
                              item.url,
                              '_blank',
                              'noopener,noreferrer',
                            )
                          })
                        : null,
                    iconButton('删除', 'fas fa-trash', () => {
                      revoke(item)
                      items.value = items.value.filter((row) => row.key !== item.key)
                      props.onRemove?.(item)
                    }),
                    props.kind === 'image' &&
                    props.showImageEditor &&
                    (item.previewUrl || item.url)
                      ? iconButton('编辑', 'fas fa-crop', () => {
                          void startEdit(item)
                        })
                      : null,
                  ],
            ]),
          ]),
        ),
      )

    return () => {
      const className = fileUploaderModifierClasses(
        {
          class: props.class,
          disabled: props.disabled,
          showDropArea: props.showDropArea,
        } as UiFileUploaderProps & UiFilesUploaderProps,
        { multiple: props.multiple, kind: props.kind },
      )
      if (!props.multiple) {
        return h('div', { class: className }, [singleFileBox()])
      }
      const drop =
        filesUploaderShowDropAreaOf({
          showDropArea: props.showDropArea,
        }) && !props.readOnly
          ? h(
              'div',
              {
                class: 'mmda-file-uploader__drop',
                onClick: choose,
                onDragover: (event: DragEvent) => event.preventDefault(),
                onDrop,
              },
              [
                h('i', {
                  class: 'fas fa-cloud-upload-alt',
                  'aria-hidden': 'true',
                }),
                h('span', props.dropText || '拖放文件到这里，或点击选择'),
              ],
            )
          : null
      return h('div', { class: className }, [
        hiddenInput(),
        drop,
        items.value.length ? multiList() : null,
      ])
    }
  },
})

export function createFileUploader(props: UiFileUploaderProps = {}): VNode {
  return h(MmdaFileUploaderHost as any, {
    ...props,
    kind: 'file',
    multiple: false,
    autoUpload: fileUploaderAutoUploadOf(props, false),
  })
}

export function createFilesUploader(props: UiFilesUploaderProps = {}): VNode {
  return h(MmdaFileUploaderHost as any, {
    ...props,
    kind: 'file',
    multiple: true,
    autoUpload: fileUploaderAutoUploadOf(props, true),
    showDropArea: filesUploaderShowDropAreaOf(props),
  })
}

export function createImageUploader(props: UiImageUploaderProps = {}): VNode {
  return h(MmdaFileUploaderHost as any, {
    ...props,
    kind: 'image',
    multiple: false,
    autoUpload: fileUploaderAutoUploadOf(props, false),
    showImageEditor: props.showImageEditor === true,
    allowedExtensions:
      props.allowedExtensions ?? IMAGE_UPLOADER_EXTENSIONS,
  })
}

export function createImagesUploader(props: UiImagesUploaderProps = {}): VNode {
  return h(MmdaFileUploaderHost as any, {
    ...props,
    kind: 'image',
    multiple: true,
    autoUpload: fileUploaderAutoUploadOf(props, true),
    showDropArea: filesUploaderShowDropAreaOf(props),
    showImageEditor: props.showImageEditor === true,
    allowedExtensions:
      props.allowedExtensions ?? IMAGE_UPLOADER_EXTENSIONS,
  })
}
