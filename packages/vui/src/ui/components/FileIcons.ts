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

export function getFileInfo(path?: string, files?: any) {
  const pathStr = String(path ?? '')
  if (!pathStr) return { fileName: '', fileIcon: 'file', fileExt: '' }
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
