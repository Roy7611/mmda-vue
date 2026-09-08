# ImageUploader：怎么写

从 `@mmda/vui` 导入类型；节点用 `builder.factory.imageUploader` / `imagesUploader`。设计见 [image_uploader.md](./image_uploader.md)。

只读看图用 `factory.image` / `imageGallery`，不要把 Picker 做成只读 `<img>`。

## 单图（字段）

```ts
factory.imageUploader({
  url: model.photo,
  onUpload: (file) => context.uploadFile(file),
})
```

点框 / 缩略位 / 附件图标选图，或把图片拖进框。选完默认自动传。

## ImagePicker 不是 ImageUploader

| 名 | 场景 | 做什么 |
|---|---|---|
| `ImageUploader` / `imageUploader` | **现在** | 先上传拿 URL，再保存 JSON。落库只记 URL |
| `ImagePicker` / `imagePicker` | **以后** | 跟表单**一起**提交。控件只负责**选择和预览**（本地小图），不单独 `onUpload` |

现在 `ImagePicker` 暂时仍指向 `imageUploader`。新字段请写 `ImageUploader`。只读看图走 `image` / `imageGallery`。

## 多图（子表）

```ts
factory.imagesUploader({
  urls: mediaRows.map((row) => row.mediaFile),
  autoUpload: true,
  onUpload: async (file, control) => {
    const url = await context.uploadFile(file)
    await context.createSubGroupItems({
      group,
      source: { mediaFile: url, description: file.name },
    })
    return url
  },
  onRemove: (item) => {
    const row = mediaRows.find((r) => r.mediaFile === item.url)
    if (row) context.removeSubGroupItem(group, row)
  },
})
```

详情媒体组只用 `factory.imageGallery`。

## 可选 ImageEditor

应用挂了 SF 插件后，host 会在 `showImageEditor` / `installed` 为真时显示编辑图标：

```ts
ui.setImageEditorPlugin(createSfImageEditorPlugin())
```

没挂插件时不显示编辑，不要抛错。不要 `factory.imageEditor`。
