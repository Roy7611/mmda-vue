import { h } from "vue";
import { SfImageGallery } from "../components/SfImageGallery";
import { createFileUploader, createFilesUploader, createImageUploader, createImagesUploader, renderFileLink } from "@mmda/vui"

const fileLink = (props: any = {}) => renderFileLink(props);
const fileUploader = (props: any = {}) => createFileUploader(props);
const filesUploader = (props: any = {}) => createFilesUploader(props);
const imageUploader = (props: any = {}) => createImageUploader(props);
const imagesUploader = (props: any = {}) => createImagesUploader(props);

export const mediaRenderers = {
  image: (src: string, props: any) => h("img", { src, ...props }),
  imageGallery: (items: any, props: any) =>
    h(SfImageGallery, {
      items,
      ...props,
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
