import { defineComponent, type PropType } from "vue";
import {
  createFilesUploader,
  type UiFileUploadControl,
  type UiFileUploadItem,
} from "@mmda/vui";

export interface FilesUploadControl {
  signal: AbortSignal;
  onProgress: (progress: number) => void;
}

export type FilesUploadHandler = (
  files: File[],
  control: FilesUploadControl,
) => Promise<unknown>;

export const SfFilesUploader = defineComponent({
  name: "SfFilesUploader",
  props: {
    onUpload: Function as PropType<
      (file: File, control: UiFileUploadControl) => Promise<string>
    >,
    upload: Function as PropType<FilesUploadHandler>,
    urls: Array as PropType<string[]>,
    autoUpload: { type: Boolean, default: false },
    disabled: Boolean,
    allowedExtensions: String,
    maxFileSize: Number,
    dropText: String,
    showDropArea: { type: Boolean, default: true },
    downloadable: { type: Boolean, default: true },
    preview: Boolean,
    onRemove: Function as PropType<(item: UiFileUploadItem) => void>,
  },
  setup(props) {
    return () =>
      createFilesUploader({
        urls: props.urls,
        autoUpload: props.autoUpload,
        disabled: props.disabled,
        allowedExtensions: props.allowedExtensions,
        maxFileSize: props.maxFileSize,
        dropText: props.dropText,
        showDropArea: props.showDropArea,
        downloadable: props.downloadable,
        preview: props.preview,
        onRemove: props.onRemove,
        onUpload: async (file, control) => {
          if (props.onUpload) return props.onUpload(file, control);
          const result = await props.upload?.([file], control);
          if (typeof result === "string") return result;
          if (Array.isArray(result) && result[0] != null)
            return String(result[0]);
          return "";
        },
      });
  },
});
