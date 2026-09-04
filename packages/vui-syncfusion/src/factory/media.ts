import { h } from "vue";
import { SfImageGallery } from "../components/SfImageGallery";
import { SfFilesUploader } from "../components/SfFilesUploader";

export function attachMediaRenderers(factory: any) {
  factory.image = (src: string, props: any) => h("img", { src, ...props });
  factory.imageGallery = (items: any, props: any) =>
    h(SfImageGallery, {
      items,
      ...props,
    });
  factory.filesUploader = (props: any) => h(SfFilesUploader, props);
}
