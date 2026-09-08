# FileLink 设计

chrome 文件链接，走 `factory.fileLink`。值是 **URL 字符串**。服务器控件名 `Url` / `FileLink` 别名到本控件。

程序员用法：[file_link_usage.md](./file_link_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

vui 名是 **`fileLink`**。不要 `ejs-` / 厂商名。不要把 `externalLink`（关联实体跳转）当成文件。图片走 `factory.image` / `imageGallery`，不要塞进 FileLink。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/file_link.ts` | URL、`downloadable`、`preview` 分流、`renderFileLink` |
| 三套皮肤 chrome | 调 `renderFileLink` |
| fld `FileLink` / `Url` | `downloadable: authority.allowDownload !== false` |

## 属性

| 属性 | 说明 |
|---|---|
| `url` | 文件 URL |
| `downloadable` | 缺省 true。false：图标 + 文件名，**不**包 `<a>` |
| `preview` | true 时：`xlsx` / `docx`（及 xls / doc）走 `buildFilePreview`；`pdf` / `txt` / `csv` 用浏览器打开 URL。图片不走 FileLink |
| `fileName` / `fileIcon` | 可选覆盖；缺省从 URL 用 `getFileInfo` 截取 |
| `onPreview` | app 预览（xlsx/docx）回调；缺省 `window.open` |

有下载权用裸 `<a href=URL>`，不走 `fetchApi.downloadFile`。无下载权时 `preview: true` 仍可预览。旧 `authority` 没有 `allowDownload` 当能下。权限位是已有 `ModuleOp.DOWNLOAD = 256` / `ModuleAuth.allowDownload`。

钩子 class：`mmda-file-link`；`--blocked`；`--preview`。

## 源码

- vui [`file_link.ts`](../src/ui/factory/file_link.ts)
- 皮肤 chrome：SF / Prime / Naive 的 `factory.fileLink` 均调 `renderFileLink`
