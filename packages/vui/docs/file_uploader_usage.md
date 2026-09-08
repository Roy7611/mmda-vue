# FileUploader：怎么写

从 `@mmda/vui` 导入类型；节点用 `builder.factory.fileUploader` / `filesUploader`。设计见 [file_uploader.md](./file_uploader.md)。

vui 名按件数拆开。不要 `factory.uploader`，不要 `multiple`，不要 `layout: 'dropArea'`（单文件没有落放区切换；拖文件进框即可）。

## 单文件（字段 URL）

```ts
factory.fileUploader({
  url: model.attachUrl,
  onUpload: async (file, control) => {
    // 返回 URL 字符串；也可用缺省 context.uploadFile
    return await context.uploadFile(file)
  },
})
```

字段 `editor: FileUploader` 写回字段 URL。只读详情用 `fileLink`，不要 Uploader。

选文件：点框 / 右侧附件图标，或把文件拖进框。选完默认自动传（`autoUpload` 缺省 true）。

## FilePicker 不是 FileUploader

| 名 | 场景 | 做什么 |
|---|---|---|
| `FileUploader` / `fileUploader` | **现在** | 先 `onUpload` 拿 URL，再跟表单 JSON `saveOne`。落库只记 URL |
| `FilePicker` / `filePicker` | **以后** | 跟表单**一起**提交（multipart / 随 save 带文件）。控件只负责**选择和预览**，不单独调上传接口 |

现在 `FilePicker` 暂时仍指向 `fileUploader`，服务器旧名也能画出 Uploader。新字段请写 `FileUploader`。等跟表单一起上传落地后，`FilePicker` 会拆成只选 + 预览，不要再当 Uploader 用。

## 多文件（子表一行一 URL）

```ts
factory.filesUploader({
  urls: rows.map((row) => row.fileUrl),
  autoUpload: false,
  dropText: '拖放文件到这里，或点击选择',
  onUpload: (file, control) => context.uploadFile(file),
  onRemove: (item) => {
    // 只改 JSON，不删服务器 blob
    removeRow(item.url)
  },
})
```

旧名 `fileUpload` / `FileUpload` 指向 `filesUploader`。不要把 `File[]` 塞进标量字段。

## 控制器

```ts
let ctrl: UiFileUploaderController | undefined
factory.fileUploader({
  onReady: (c) => {
    ctrl = c
  },
})
// ctrl.choose() / upload() / cancel() / clear() / getFiles()
```

## 权限与展示

成功行走 `fileLink`：`downloadable` 接 `allowDownload !== false`。无下载权仍可 `preview`。
