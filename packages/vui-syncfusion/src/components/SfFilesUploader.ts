import {
  defineComponent,
  h,
  nextTick,
  ref,
  type PropType,
} from "vue";
import { ButtonComponent } from "@syncfusion/ej2-vue-buttons";
import { UploaderComponent } from "@syncfusion/ej2-vue-inputs";
import { ProgressBarComponent } from "@syncfusion/ej2-vue-progressbar";

export interface FilesUploadControl {
  signal: AbortSignal;
  onProgress: (progress: number) => void;
}

export type FilesUploadHandler = (
  files: File[],
  control: FilesUploadControl,
) => Promise<unknown>;

type QueueItem = {
  key: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
};

const fileKey = (file: File) =>
  `${file.name}:${file.size}:${file.lastModified}`;

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

export const SfFilesUploader = defineComponent({
  name: "SfFilesUploader",
  props: {
    upload: {
      type: Function as PropType<FilesUploadHandler>,
      required: true,
    },
    multiple: { type: Boolean, default: true },
    autoUpload: { type: Boolean, default: true },
    disabled: Boolean,
    allowedExtensions: String,
    maxFileSize: Number,
    dropText: { type: String, default: "拖放文件到这里，或点击选择文件" },
    chooseText: { type: String, default: "选择文件" },
    uploadText: { type: String, default: "上传" },
    clearText: { type: String, default: "清空" },
  },
  emits: ["success", "error", "cancel", "change"],
  setup(props, { emit, expose }) {
    const uploader = ref<any>();
    const dropArea = ref<HTMLElement>();
    const queue = ref<QueueItem[]>([]);
    const uploading = ref(false);
    const controller = ref<AbortController>();

    const clearCompleted = () => {
      queue.value = queue.value.filter(
        (item) => item.status === "pending" || item.status === "uploading",
      );
      emit(
        "change",
        queue.value.map((item) => item.file),
      );
    };

    const remove = (key: string) => {
      if (uploading.value) return;
      queue.value = queue.value.filter((item) => item.key !== key);
      emit(
        "change",
        queue.value.map((item) => item.file),
      );
    };

    const cancel = () => controller.value?.abort();

    const start = async () => {
      if (uploading.value || props.disabled) return;
      const pending = queue.value.filter((item) => item.status === "pending");
      if (!pending.length) return;

      const abortController = new AbortController();
      controller.value = abortController;
      uploading.value = true;
      for (const item of pending) {
        item.status = "uploading";
        item.progress = 0;
        item.error = undefined;
      }

      try {
        const result = await props.upload(
          pending.map((item) => item.file),
          {
            signal: abortController.signal,
            onProgress: (value) => {
              const progress = Math.max(0, Math.min(100, Math.round(value)));
              for (const item of pending) item.progress = progress;
            },
          },
        );
        for (const item of pending) {
          item.status = "success";
          item.progress = 100;
        }
        emit(
          "success",
          result,
          pending.map((item) => item.file),
        );
      } catch (error) {
        const aborted =
          error instanceof Error && error.name === "AbortError";
        for (const item of pending) {
          item.status = aborted ? "pending" : "error";
          item.error = aborted
            ? undefined
            : error instanceof Error
              ? error.message
              : "上传失败";
        }
        if (aborted) emit("cancel", pending.map((item) => item.file));
        else emit("error", error, pending.map((item) => item.file));
      } finally {
        controller.value = undefined;
        uploading.value = false;
      }
    };

    const select = (args: any) => {
      const selected = (args.filesData ?? [])
        .map((item: any) => item.rawFile)
        .filter((file: unknown): file is File => file instanceof File);
      const known = new Set(queue.value.map((item) => item.key));
      for (const file of selected) {
        const key = fileKey(file);
        if (known.has(key)) continue;
        known.add(key);
        queue.value.push({ key, file, progress: 0, status: "pending" });
      }
      emit(
        "change",
        queue.value.map((item) => item.file),
      );
      void nextTick(() => uploader.value?.clearAll?.());
      if (props.autoUpload && selected.length) void nextTick(start);
    };

    expose({ start, cancel, clearCompleted });

    const statusText = (item: QueueItem) => {
      if (item.status === "success") return "上传成功";
      if (item.status === "error") return item.error ?? "上传失败";
      if (item.status === "uploading") return `${item.progress}%`;
      return "等待上传";
    };

    return () =>
      h("section", { class: "mmda-files-uploader" }, [
        h("div", { ref: dropArea, class: "mmda-files-uploader__drop" }, [
          h(UploaderComponent as any, {
            ref: uploader,
            multiple: props.multiple,
            autoUpload: false,
            showFileList: false,
            enabled: !props.disabled && !uploading.value,
            allowedExtensions: props.allowedExtensions,
            maxFileSize: props.maxFileSize,
            buttons: { browse: props.chooseText },
            selected: select,
            cssClass: "mmda-files-uploader__control",
            created: () => {
              const instance =
                uploader.value?.ej2Instances ?? uploader.value;
              if (instance && dropArea.value) {
                instance.dropArea = dropArea.value;
                instance.dataBind?.();
              }
            },
          }),
          h("div", { class: "mmda-files-uploader__drop-hint" }, [
            h("i", {
              class: "e-icons e-upload-1",
              "aria-hidden": "true",
            }),
            h("span", props.dropText),
          ]),
        ]),
        queue.value.length
          ? h("div", { class: "mmda-files-uploader__queue" }, [
              h(
                "ul",
                queue.value.map((item) =>
                  h("li", { key: item.key }, [
                    h("i", {
                      class: "e-icons e-file",
                      "aria-hidden": "true",
                    }),
                    h("div", { class: "mmda-files-uploader__file" }, [
                      h(
                        "div",
                        { class: "mmda-files-uploader__file-name" },
                        item.file.name,
                      ),
                      h(
                        "small",
                        { class: `is-${item.status}` },
                        `${formatSize(item.file.size)} · ${statusText(item)}`,
                      ),
                      item.status === "uploading" &&
                        h(ProgressBarComponent as any, {
                          value: item.progress,
                          height: "4px",
                          showProgressValue: false,
                        }),
                    ]),
                    item.status !== "uploading" &&
                      h(ButtonComponent as any, {
                        type: "button",
                        iconCss: "e-icons e-close",
                        cssClass: "e-flat e-round",
                        title: "移除",
                        onClick: () => remove(item.key),
                      }),
                  ]),
                ),
              ),
              h("div", { class: "mmda-files-uploader__actions" }, [
                uploading.value
                  ? h(ButtonComponent as any, {
                      type: "button",
                      content: "取消上传",
                      iconCss: "e-icons e-close",
                      cssClass: "e-flat e-danger",
                      onClick: cancel,
                    })
                  : [
                      !props.autoUpload &&
                        h(ButtonComponent as any, {
                          type: "button",
                          content: props.uploadText,
                          iconCss: "e-icons e-upload-1",
                          isPrimary: true,
                          onClick: () => void start(),
                        }),
                      queue.value.some(
                        (item) =>
                          item.status === "success" ||
                          item.status === "error",
                      ) &&
                        h(ButtonComponent as any, {
                          type: "button",
                          content: props.clearText,
                          cssClass: "e-flat",
                          onClick: clearCompleted,
                        }),
                    ],
              ]),
            ])
          : null,
      ]);
  },
});
