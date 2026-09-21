import { h } from "vue";
import { SfImageGallery } from "../components/SfImageGallery";
import { createFileUploader, createFilesUploader, createImageUploader, createImagesUploader, renderFileLink } from "@mmda/vui"

const fileLink = (props: any = {}) => renderFileLink(props);
const fileUploader = (props: any = {}) => createFileUploader(props);
const filesUploader = (props: any = {}) => createFilesUploader(props);
const imageUploader = (props: any = {}) => createImageUploader(props);
const imagesUploader = (props: any = {}) => createImagesUploader(props);

export const mediaRenderers = {
  image: (props: any) => h("img", props),
  imageGallery: (props: any) =>
    h(SfImageGallery, {
      items: props.items,
      columns: props.columns,
      emptyText: props.emptyText,
      dialogTitle: props.dialogTitle,
      loop: props.loop,
      onItemClick: props.onItemClick,
      onItemDblclick: props.onItemDblclick,
    }),
  fileLink,
  Url: fileLink,
  FileLink: fileLink,
  fileUploader,
  filePicker: fileUploader,
  FilePicker: fileUploader,
  FileUploader: fileUploader,
  filesUploader,
  fileUpload: filesUploader,
  FileUpload: filesUploader,
  FilesUploader: filesUploader,
  imageUploader,
  imagePicker: imageUploader,
  ImagePicker: imageUploader,
  ImageUploader: imageUploader,
  imagesUploader,
  ImagesUploader: imagesUploader,
};
