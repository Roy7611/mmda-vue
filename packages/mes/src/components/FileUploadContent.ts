// 附件内容
import { MetaModel, encodeUriAndFix, formatFileSize, isFunction, isNullOrUndefined, relativeTime, type UiProps } from '@mmda/core'
import { defineComponent, h, getCurrentInstance, reactive, onMounted, ref } from 'vue'
import { getFileInfo } from "@mmda/vui";

/** 附件内容组件的自有 props（core UiProps 之外的部分）。 */
export interface FileUploadContentProps extends UiProps {
    showPreView?: boolean;
    uploadedFiles?: any[];
}
export const FileUploadContent = (context: any, props: FileUploadContentProps) => {
    const ui = context.uiBuilder
    const t = context.t.bind(context)
    const apiClient = context.logic?.apiClient ?? context.app?.api ?? context.$app?.api
    const showPreView = props.showPreView ?? true
    // 上传控件的文件列�?
    const viewFiles = ((props.uploadedFiles as any[]) ?? []).map((f: any) => {
        const { fileName, fileIcon, fileExt } = getFileInfo(f.fileName ?? f.name)
        return {
            fileName,
            fileExt,
            fileIcon,
            fileSize: f.fileSize ?? f.size,
            fileUrl: f.fileName,
            uploadTime: f.uploadTime,
            uploader: f.uploader
        }
    })
    // 坯预览文件列�?
    const previewList: string[] = ["xlsx", "xls", "docx", "doc", "pptx", "ppt", "pdf", "bmp", "jpg", "jpeg", "png", "gif"]
    return ui.factory.dataView(viewFiles, {
        dataKey: 'name',
        list: ({ items }: any) => {
            return items.map((item: any, index: number) => {
                const { fileName, fileIcon, fileSize, fileExt, fileUrl, uploadTime, uploader } = item
                return h(
                    'div', { class: 'flex_item_center flex_content_start p-relative attachment-list' },
                    [
                        // start
                        h('i', { class: `${fileIcon} text-3xl ml-2` }),
                        // content
                        h('div', { class: 'flex_column flex_item_start flex_content_center p-2' }, [
                            h('div', { class: 'flex_item_center' }, [
                                ui.factory.textSpan({ text: fileName,
                                    class: 'word-ellipsis pr-2 max-w-48',
                                    tooltip: fileName.length > 13 ? fileName : null,
                                    tooltipPosition: 'bottom'
                                })
                            ]),
                            h('div', { class: 'flex_item_center' }, [
                                ui.factory.textSpan({ text: fileSize ? formatFileSize(fileSize) : '-',
                                    class: 'mr-2 text-sm'
                                }),
                                uploadTime ? ui.factory.textSpan({
                                    text: uploader +
                                    t('time.noticeTo', {
                                        it: relativeTime(uploadTime, context.locale)
                                    }),
                                        class: 'text-sm',
                                        tooltip:
                                            (
                                                uploader +
                                                t('time.noticeTo', {
                                                    it: relativeTime(uploadTime, context.locale)
                                                })
                                            ).length > 13
                                                ? uploader +
                                                t('time.noticeTo', {
                                                    it: relativeTime(uploadTime, context.locale)
                                                })
                                                : null,
                                        tooltipPosition: 'bottom'
                                    }
                                ) : ui.factory.textSpan({ text: t('time.just'), class: 'text-sm' })
                            ])
                        ]),
                        // end
                        h('div', null, [
                            fileUrl ? ui.factory.button({
                                icon: 'pi pi-download',
                                buttonType: 'text',
                                rounded: true,
                                tooltip: t('action.download'),
                                size: 'small',
                                tooltipPosition: 'bottom',
                                ariaLabel: 'Download',
                                onAction: () => {
                                    const a = document.createElement('a')
                                    a.href = `${encodeUriAndFix(fileUrl)}?a=${+new Date()}`
                                    a.download = fileName
                                    document.body.appendChild(a)
                                    a.click()
                                    document.body.removeChild(a)
                                }
                            }) : null,
                            showPreView && previewList.includes(fileExt) && fileUrl ? ui.factory.button({
                                icon: 'pi pi-eye',
                                severity: 'info',
                                buttonType: 'text',
                                rounded: true,
                                tooltip: t('action.preview'),
                                tooltipPosition: 'bottom',
                                ariaLabel: 'Preview',
                                onAction: () => {
                                    const service = apiClient.config.service.toUpperCase()
                                    const extLower = fileExt.toLowerCase()
                                    if (['xlsx', 'xls'].includes(extLower)) {
                                        window.open(`/${service}/ExcelView?fileUrl=${encodeURIComponent(fileUrl)}`, '_blank')
                                    } else if (['docx', 'doc'].includes(extLower)) {
                                        window.open(`/${service}/DocView?fileUrl=${encodeURIComponent(fileUrl)}`, '_blank')
                                    } else if (['pptx', 'ppt'].includes(extLower)) {
                                        window.open(`/${service}/FileView?fileUrl=${encodeURIComponent(fileUrl)}`, '_blank')
                                    } else if (extLower === 'pdf') {
                                        window.open(encodeUriAndFix(fileUrl), '_blank')
                                    } else if (['bmp', 'jpg', 'jpeg', 'png', 'gif'].includes(extLower)) {
                                        window.open(`${encodeUriAndFix(fileUrl)}?a=${+new Date()}`, '_blank')
                                    }
                                }
                            }) : null
                        ])
                    ]
                )
            })
        }
    })
}
