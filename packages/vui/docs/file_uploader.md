# FileUploader / FilesUploader 设计

单文件 `factory.fileUploader` 绑**字段**（URL 字符串）。多文件 `factory.filesUploader` 绑**子表**（每文件一行）。件数写在方法名里，没有 `multiple`，没有 `factory.uploader`。

对照 [EJ2 Vue Uploader](https://ej2.syncfusion.com/vue/documentation/uploader/vue3-getting-started)，vui **自绘 chrome**，只借用隐藏的选文件控件；拖放落在本控件节点上，**没有** vui `dropArea` CSS 选择器。不要 `ejs-uploader` / Prime `FileUpload` / `NUpload` 当 vui 名。

`UploadFile.uploader` 是上传人，不是控件。

程序员用法：[file_uploader_usage.md](./file_uploader_usage.md)。图片：[image_uploader.md](./image_uploader.md)。展示链：[file_link.md](./file_link.md)。

`fileUpload` / `FileUpload` 别名到 `filesUploader`。

`FilePicker` **不是** Uploader 的永久别名：现在暂时指向 `fileUploader`；以后留给「跟表单一起上传」——只选文件和预览，不单独 `onUpload`。怎么写见 [file_uploader_usage.md](./file_uploader_usage.md)。

## 同一套状态机

选 → 传 → 成 / 败。单文件最多 1 条；多文件是同样的行组成列表。

`onUpload(file, control) => Promise<string>` 返回 **URL**。vui **不**组 FormData。默认走 `context.uploadFile` + `uploadedFileNames`。成功后文件名从 URL 截取（`getFileInfo`）。`fileSize` / `uploader` / `uploadTime` 由本地文件和会话拼，不来自返回值。本地 `File` 不进库。

当前流程：先上传文件，再 `saveOne` JSON。换文件 / 删行只改 JSON，**不**删文件服务器旧 blob。

行状态：`pending` → `uploading` → `success` | `error`。

## 外观

### 单文件 `fileUploader`

长得像 SearchBox：输入组（框 + 右侧附件图标），**不要**放大镜，也**不要** `layout` / `dropArea` 切换。不要复用 `factory.searchBox`（那是 hasOne 挑选）。

- 点框或右侧图标 → 选文件（重选同理）
- **默认支持把文件拖进框里**（同一套 `onDrop`）
- 框内：本地文件名 → 成功后 `fileLink`（URL 截名）
- 进度条在框**下方**；上传中右侧图标变取消；失败名下错误 + 重试

### 多文件 `filesUploader`

缺省 **落放区**（`showDropArea` 缺省 true）。外头可放图标按钮调 `controller.choose()`。

- 落放区**下方**列表：图标、文件名、大小、日期时间、操作（删除 | 上传 / 下载，皆图标按钮）
- `dropText` 是落放区短文案，不算按钮

### 共用

- 按钮一律图标 + `title` / tooltip，不上可见文字。`chooseText` / `reselectText` 只当无障碍说明
- `autoUpload`：单文件缺省 **true**；多文件缺省 **false**
- 成功行：普通文件用 `fileLink`；下载 href = 该 URL
- 只读 / 详情：文件走 `fileLink`，不要 Uploader

## 属性（契约）

| 属性 | 谁 | 说明 |
|---|---|---|
| `url` | 单 | 回填已有 URL → 先成功态 |
| `urls` | 多 | 回填已有 URL 列表 |
| `showDropArea` | 仅多 | 缺省 true |
| `autoUpload` | 都 | 单缺省 true；多缺省 false |
| `allowedExtensions` / size | 都 | EJ2 同形 `.png,.jpg` |
| `chooseText` / `reselectText` | 可选 | tooltip / aria，不上按钮面 |
| `dropText` | 仅多落放区 | |
| `downloadable` / `preview` | 成功行 | 同 `fileLink` |
| `onUpload` | 都 | 一个文件一次；**返回 URL 字符串** |
| `onReady` | 都 | `choose` / `upload` / `cancel` / `clear` / `getFiles` |
| `onRemove` | 多 | 删行时回调（只改 JSON） |

## 分层 / 皮肤

| 层 | 做什么 |
|---|---|
| vui `file_uploader.ts` + `MmdaFileUploaderHost` | 契约、状态机、自绘 chrome |
| 三套皮肤 `factory.fileUploader` 等 | 调 `createFileUploader` / `createFilesUploader` |
| SF `SfFileUploader` / `SfFilesUploader` | 可选包一层；内部仍是 vui host |

钩子 class：`mmda-file-uploader`；单文件 `--input`；多文件另有 `mmda-files-uploader`；`--disabled`。

## 源码

- vui [`file_uploader.ts`](../src/ui/factory/file_uploader.ts)、[`MmdaFileUploaderHost.ts`](../src/components/MmdaFileUploaderHost.ts)
- fld [`file_upload_field.ts`](../src/ui/factory/file_upload_field.ts)
