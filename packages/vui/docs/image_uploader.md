# ImageUploader / ImagesUploader 设计

基于 File 那一行，多的是**预览**。只能选图片（`accept` / `allowedExtensions` 锁图片扩展名，不要落到普通文件对话框）。

程序员用法：[image_uploader_usage.md](./image_uploader_usage.md)。文件上传：[file_uploader.md](./file_uploader.md)。图片编辑插件：[image_editor.md](./image_editor.md)。

| 件数 | vui | 服务器 | 绑什么 |
|---|---|---|---|
| 单 | `imageUploader` | `ImageUploader` | 字段 URL |
| 多 | `imagesUploader` | `ImagesUploader` | 子表每图一行 |

`ImagePicker` 现在暂时指向 `imageUploader`；以后留给「跟表单一起上传」——只选图和预览。不要做成只读 `<img>`。只读看图走 `factory.image`；子表详情走 `imageGallery`（只能看、不能选、不能传）。编辑媒体组用 `imagesUploader`。

状态机与 `fileUploader` / `filesUploader` 相同：`onUpload` 返回 URL；vui 不组 FormData。

单图同样是 SearchBox 形输入框 + 缩略位，**没有** `layout: 'dropArea'`；默认支持把图片拖进框。多图才用落放区（`showDropArea`）。

## 阶段显示

| 阶段 | 显示 |
|---|---|
| 选前 | 空缩略位 + 选 / 拖 |
| 选后、未成功 | 本地小图（`URL.createObjectURL`）；点击看大图。进度 / 错误在图**下方** |
| 成功 | 小图 `src` 换成返回的 **URL**；点击仍看大图 |
| 失败 | 小图还在，图下方错误；可重试 |

撤销 object URL：重选 / 删除 / 成功换成服务器 URL 时 `revoke`。

## 上传前编辑（可选）

已 `setImageEditorPlugin` 且 `installed === true` 时，行上出编辑图标，打开 `buildImageEditor`（**不进** factory）。`onSave` 的 blob 换成待传 `File`，预览跟着变，**再** `onUpload`。没挂插件就不显示编辑，不要抛错。Prime / Naive 无引擎时同样隐藏。不要 `factory.imageEditor`。

## 与 imageGallery 的边界

| 控件 | 场景 |
|---|---|
| `imagesUploader` | 编辑 / 子表可传 |
| `imageGallery` | 详情只读相册 |
| `factory.image` | 单字段只读图 |

现有媒体组：编辑走 `imagesUploader`，详情走 `imageGallery`。

## 源码

- vui [`image_uploader.ts`](../src/ui/factory/image_uploader.ts)
- 共用 host [`MmdaFileUploaderHost.ts`](../src/components/MmdaFileUploaderHost.ts)
