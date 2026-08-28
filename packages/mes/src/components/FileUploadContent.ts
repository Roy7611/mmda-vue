// 附件内容
import { MetaModel, encodeUriAndFix, formatFileSize, isFunction, isNullOrUndefined, relativeTime } from '@mmda/core'
import { defineComponent, h, getCurrentInstance, reactive, onMounted, ref } from 'vue'
import { getFileInfo, PropData } from "@mmda/vui";
export const FileUploadContent = (context: any, props: PropData) => {
    const { $ui: ui, $api: apiBox, $toast: toast, $dialog, $t: t, $router } = context
    const showPreView = props.showPreView ?? true
    // 上传控件的文件列表
    const viewFiles = (props.uploadedFiles ?? []).map((f: any) => {
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
    // 可预览文件列表
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
                                ui.factory.textSpan(fileName, {
                                    class: 'word-ellipsis pr-2 max-w-48',
                                    tooltip: fileName.length > 13 ? fileName : null,
                                    tooltipPosition: 'bottom'
                                })
                            ]),
                            h('div', { class: 'flex_item_center' }, [
                                ui.factory.textSpan(fileSize ? formatFileSize(fileSize) : '-', {
                                    class: 'mr-2 text-sm'
                                }),
                                uploadTime ? ui.factory.textSpan(
                                    uploader +
                                    t('time.noticeTo', {
                                        it: relativeTime(uploadTime, context.locale)
                                    }),
                                    {
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
                                ) : ui.factory.textSpan(t('time.just'), { class: 'text-sm' })
                            ])
                        ]),
                        // end
                        h('div', null, [
                            fileUrl ? ui.factory.button({
                                icon: 'pi pi-download',
                                buttonType: 'text',
                                rounded: true,
                                tooltip: '下载',
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
                                tooltip: '预览',
                                tooltipPosition: 'bottom',
                                ariaLabel: 'Preview',
                                onAction: () => {
                                    const service = apiBox.config.service.toUpperCase()
                                    const extLower = fileExt.toLowerCase()
                                    if (['xlsx', 'xls'].includes(extLower)) {
                                        const routeUrl = $router.resolve({
                                            path: `/${service}/ExcelView`,
                                            query: { fileUrl }
                                        })
                                        window.open(routeUrl.href, '_blank')
                                    } else if (['docx', 'doc'].includes(extLower)) {
                                        const routeUrl = $router.resolve({
                                            path: `/${service}/DocView`,
                                            query: { fileUrl }
                                        })
                                        window.open(routeUrl.href, '_blank')
                                    } else if (['pptx', 'ppt'].includes(extLower)) {
                                        const routeUrl = $router.resolve({
                                            path: `/${service}/FileView`,
                                            query: { fileUrl }
                                        })
                                        window.open(routeUrl.href, '_blank')
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
