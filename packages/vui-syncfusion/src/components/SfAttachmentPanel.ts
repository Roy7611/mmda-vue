import {
  computed,
  defineComponent,
  h,
  ref,
  type PropType,
} from "vue";
import { ButtonComponent } from "@syncfusion/ej2-vue-buttons";
import { ProgressBarComponent } from "@syncfusion/ej2-vue-progressbar";
import { encodeUriAndFix } from "@mmda/core";
import { getFileInfo, type UiBuildContext } from "@mmda/vui";

type AttachmentItem = {
  fileName: string;
  fileSize?: string | number;
  uploader?: string;
  uploadTime?: string;
};

const IMAGE_EXTENSIONS = new Set(["bmp", "gif", "jpeg", "jpg", "png", "webp"]);

function formatSize(value?: string | number) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function decodeUploadResult(response: Response): Promise<string[]> {
  return response.text().then((text) => {
    if (!text) return [];
    try {
      const value = JSON.parse(text);
      if (Array.isArray(value)) return value.map(String);
      if (Array.isArray(value?.data)) return value.data.map(String);
      if (typeof value === "string") return [value];
    } catch {
      // Some file services return a plain URL instead of JSON.
    }
    return [text];
  });
}

function isAbort(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function fileUrl(path: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${encodeUriAndFix(path)}${separator}v=${Date.now()}`;
}

export const SfAttachmentPanel = defineComponent({
  name: "SfAttachmentPanel",
  props: {
    context: {
      type: Object as PropType<UiBuildContext<any>>,
      required: true,
    },
  },
  setup(props, { expose }) {
    const input = ref<HTMLInputElement | null>(null);
    const controller = ref<AbortController | null>(null);
    const uploading = ref(false);
    const progress = ref(0);
    const currentNames = ref("");

    const attachments = computed<AttachmentItem[]>(() => {
      const value = (props.context.model as Record<string, unknown>).attachments;
      return Array.isArray(value) ? (value as AttachmentItem[]) : [];
    });
    const setAttachments = (items: AttachmentItem[]) => {
      // Details models are shallowReactive; replace the array so the panel rerenders.
      (props.context.model as Record<string, unknown>).attachments = items;
    };

    const toast = (severity: "success" | "error" | "info", detail: string) =>
      props.context.app?.toast(props.context as any, {
        severity,
        detail,
        life: 3000,
      });

    const choose = () => {
      if (!uploading.value) input.value?.click();
    };
    expose({ choose });

    const cancel = () => controller.value?.abort();

    const registerAttachments = async (
      files: File[],
      urls: string[],
      replacing: Set<string>,
    ) => {
      const params = urls.map((fileName, index) => ({
        entityState: replacing.has(files[index]?.name) ? 1 : 2,
        fileName,
        fileSize: files[index]?.size ?? 0,
      }));
      await props.context.uploadAttachments(params as any, {
        repository: props.context.logic.repository,
        service: props.context.logic.apiClient.config.service,
        queryParams: { checkExists: true },
      });

      const nextItems = [...attachments.value];
      for (let index = 0; index < params.length; index += 1) {
        const next: AttachmentItem = {
          fileName: params[index].fileName,
          fileSize: params[index].fileSize,
          uploader: props.context.app?.user?.username,
          uploadTime: new Date().toISOString(),
        };
        const oldIndex = nextItems.findIndex(
          (item) => getFileInfo(item.fileName).fileName === files[index]?.name,
        );
        if (oldIndex >= 0) nextItems.splice(oldIndex, 1, next);
        else nextItems.unshift(next);
      }
      setAttachments(nextItems);
    };

    const upload = async (files: File[]) => {
      if (!files.length || uploading.value) return;
      const replacing = new Set(
        files
          .filter((file) =>
            attachments.value.some(
              (item) => getFileInfo(item.fileName).fileName === file.name,
            ),
          )
          .map((file) => file.name),
      );
      if (replacing.size) {
        const accepted = await props.context.app?.confirm(props.context as any, {
          message: `文件 ${Array.from(replacing).join("、")} 已存在，是否覆盖？`,
          buttons: ["yes", "no"],
        });
        if (accepted !== "yes") return;
      }

      const fetchApi = (props.context.app?.api as any)?.fetchApi;
      if (!fetchApi?.uploadFiles) {
        await toast("error", "当前网络客户端不支持附件上传");
        return;
      }

      const api = props.context.logic.apiClient;
      const url = api.buildEntityURL({
        service: "files",
        repository: props.context.logic.repository,
        path: String(props.context.model.id),
        action: "multi",
      });
      const abortController = new AbortController();
      controller.value = abortController;
      uploading.value = true;
      props.context.uploading.value = true;
      progress.value = 0;
      currentNames.value = files.map((file) => file.name).join("、");

      try {
        const response = await fetchApi.uploadFiles(
          url,
          files.map((file) => ({
            fieldName: "files",
            data: file,
            fileName: file.name,
          })),
          {
            signal: abortController.signal,
            onUploadProgress: (event: {
              loaded: number;
              total?: number;
              progress?: number;
            }) => {
              const ratio =
                event.progress ??
                (event.total ? event.loaded / event.total : undefined);
              if (ratio != null) progress.value = Math.round(ratio * 100);
            },
          },
        );
        const urls = await decodeUploadResult(response);
        if (urls.length !== files.length) {
          throw new Error("文件服务返回的文件数量不一致");
        }
        await registerAttachments(files, urls, replacing);
        progress.value = 100;
        await toast("success", "附件上传成功");
      } catch (error) {
        if (isAbort(error)) await toast("info", "已取消上传");
        else
          await toast(
            "error",
            error instanceof Error ? error.message : "附件上传失败",
          );
      } finally {
        controller.value = null;
        uploading.value = false;
        props.context.uploading.value = false;
        currentNames.value = "";
        if (input.value) input.value.value = "";
      }
    };

    const download = (item: AttachmentItem) => {
      const link = document.createElement("a");
      link.href = fileUrl(item.fileName);
      link.download = getFileInfo(item.fileName).fileName;
      link.style.display = "none";
      document.body.append(link);
      link.click();
      link.remove();
    };

    const preview = (item: AttachmentItem) => {
      const { fileExt } = getFileInfo(item.fileName);
      const extension = fileExt.toLowerCase();
      if (extension === "pdf" || IMAGE_EXTENSIONS.has(extension)) {
        window.open(fileUrl(item.fileName), "_blank");
      }
    };

    const remove = async (item: AttachmentItem) => {
      const fileName = getFileInfo(item.fileName).fileName;
      const accepted = await props.context.app?.confirm(props.context as any, {
        message: `确定删除文件 ${fileName} 吗？`,
        buttons: ["yes", "no"],
      });
      if (accepted !== "yes") return;
      try {
        await (props.context.uploadAttachments as any)(
          {
            entityState: 4,
            fileName: item.fileName,
            fileSize: item.fileSize,
          },
          {
            repository: props.context.logic.repository,
            service: props.context.logic.apiClient.config.service,
          },
        );
        setAttachments(
          attachments.value.filter((attachment) => attachment !== item),
        );
        await toast("success", "附件删除成功");
      } catch (error) {
        await toast(
          "error",
          error instanceof Error ? error.message : "附件删除失败",
        );
      }
    };

    const iconButton = (
      icon: string,
      title: string,
      onClick: () => void,
      cssClass = "e-flat e-round",
    ) =>
      h(ButtonComponent as any, {
        iconCss: icon,
        cssClass: `${cssClass} mmda-sf-attachment__action`,
        title,
        type: "button",
        "aria-label": title,
        onClick: (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        },
      });

    return () =>
      h("div", { class: "mmda-sf-attachments" }, [
        h("input", {
          ref: input,
          class: "mmda-sf-attachments__input",
          type: "file",
          multiple: true,
          onChange: (event: Event) => {
            const files = Array.from(
              (event.target as HTMLInputElement).files ?? [],
            );
            void upload(files);
          },
        }),
        uploading.value
          ? h("div", { class: "mmda-sf-upload" }, [
              h("div", { class: "mmda-sf-upload__summary" }, [
                h(
                  "span",
                  { class: "mmda-sf-upload__name", title: currentNames.value },
                  currentNames.value,
                ),
                h("span", `${progress.value}%`),
                iconButton(
                  "e-icons e-close",
                  "取消上传",
                  cancel,
                  "e-flat e-round e-danger",
                ),
              ]),
              h(ProgressBarComponent as any, {
                value: progress.value,
                height: "4px",
                showProgressValue: false,
              }),
            ])
          : null,
        attachments.value.length
          ? h(
              "ul",
              { class: "mmda-sf-attachment-list" },
              attachments.value.map((item) => {
                const info = getFileInfo(item.fileName);
                const extension = info.fileExt.toLowerCase();
                const previewable =
                  extension === "pdf" || IMAGE_EXTENSIONS.has(extension);
                return h(
                  "li",
                  {
                    class: "mmda-sf-attachment",
                    key: item.fileName,
                  },
                  [
                    h("i", {
                      class: [info.fileIcon, "mmda-sf-attachment__file-icon"],
                      "aria-hidden": "true",
                    }),
                    h("div", { class: "mmda-sf-attachment__content" }, [
                      h(
                        "div",
                        {
                          class: "mmda-sf-attachment__name",
                          title: info.fileName,
                        },
                        info.fileName,
                      ),
                      h(
                        "div",
                        { class: "mmda-sf-attachment__meta" },
                        [
                          formatSize(item.fileSize),
                          item.uploader,
                        ]
                          .filter(Boolean)
                          .join(" · "),
                      ),
                    ]),
                    h("div", { class: "mmda-sf-attachment__actions" }, [
                      iconButton("fas fa-download", "下载", () => download(item)),
                      previewable
                        ? iconButton("fas fa-eye", "预览", () => preview(item))
                        : null,
                      iconButton(
                        "fas fa-trash-alt",
                        "删除",
                        () => void remove(item),
                        "e-flat e-round e-danger",
                      ),
                    ]),
                  ],
                );
              }),
            )
          : h(
              "p",
              { class: "mmda-sf-attachments__empty" },
              props.context.translate("empty.attachments") || "暂无附件",
            ),
      ]);
  },
});
