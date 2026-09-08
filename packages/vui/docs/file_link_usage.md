# FileLink：怎么写

从 `@mmda/vui` 导入类型；节点用 `builder.factory.fileLink`。设计见 [file_link.md](./file_link.md)。

vui 名是 **`fileLink`**。不要写厂商控件或自己拼 `<a>` 猜文件名。成功后的文件名从 URL 截取。

```ts
factory.fileLink({ url: '/files/a/report.docx' })

// 无下载权：只显示图标+名，不包链接
factory.fileLink({ url, downloadable: false })

// 可预览：xlsx/docx 进 buildFilePreview；pdf/txt/csv 新标签打开
factory.fileLink({
  url,
  preview: true,
  onPreview: (href) =>
    ui.buildDialog(ui.buildFilePreview(href), { title: '预览' }),
})
```

字段 `editor: FileLink` 或 `Url` 由 fld 译权限后调同一函数。详情 / 只读文件字段也是 `fileLink`，不要 Uploader。

关联实体跳转仍用 `externalLink`，不要混。
