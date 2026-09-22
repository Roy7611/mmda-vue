/*
 * 文件名 / 图标 / 后缀（纯函数，无框架）。
 *
 * 业务 Logic 也要用（例如文档列表里点文件名的预览），所以住 core；vui 侧只做再导出。
 */

const _fileIcons: Record<string, string> = {
  pdf: 'fas fa-file-pdf red',
  xlsx: 'fas fa-file-excel green',
  xls: 'fas fa-file-excel green',
  csv: 'fas fa-file-csv green',
  docx: 'fas fa-file-word blue',
  doc: 'fas fa-file-word blue',
  ppt: 'fas fa-file-powerpoint oranger',
  pptx: 'fas fa-file-powerpoint oranger',
  image: 'fas fa-file-image blue',
  video: 'fas fa-file-video blue',
  audio: 'fas fa-file-audio blue',
  archive: 'fas fa-file-archive red',
  file: 'fas fa-file',
}

for (const img of ['bmp', 'jpg', 'jpeg', 'png', 'tif', 'webp']) {
  _fileIcons[img] = _fileIcons.image
}
for (const vdo of ['mp4', 'avi']) _fileIcons[vdo] = _fileIcons.video
for (const ado of ['mp3', 'mpeg3']) _fileIcons[ado] = _fileIcons.audio
for (const t of ['zip', 'rar', '7z', 'tar']) _fileIcons[t] = _fileIcons.archive

export const fileIcons = _fileIcons

export interface FileInfo {
  /** 路径最后一段。 */
  fileName: string
  /** 图标类名（如 `fas fa-file-excel green`）。 */
  fileIcon: string
  /** 后缀（不含点）；空路径为 `''`。 */
  fileExt: string
  /** 由第二参带进来的文件对象（可选）。 */
  fileSize?: number
  /** 原样返回的路径。 */
  fileUrl: string
}

/**
 * 按路径解析文件名 / 后缀 / 图标。
 * @param path 文件路径或 URL。
 * @param files 可选的文件对象（页面上传时带 `size`）。
 */
export function getFileInfo(
  path?: string,
  files?: { size?: number },
): FileInfo {
  const pathStr = String(path ?? '')
  if (!pathStr) {
    return { fileName: '', fileIcon: fileIcons.file, fileExt: '', fileUrl: '' }
  }
  const fileSegments = pathStr.split('/')
  const fileName = fileSegments[fileSegments.length - 1]
  const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1)
  return {
    fileName,
    fileIcon: fileIcons[fileExt] ?? fileIcons.file,
    fileExt,
    fileSize: files?.size,
    fileUrl: pathStr,
  }
}
