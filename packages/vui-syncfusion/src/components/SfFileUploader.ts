import { defineComponent, type PropType } from "vue";
import {
  createFileUploader,
  type UiFileUploadControl,
} from "@mmda/vui";

export const SfFileUploader = defineComponent({
  name: "SfFileUploader",
  props: {
    url: String,
    autoUpload: { type: Boolean, default: true },
    allowedExtensions: String,
    disabled: Boolean,
    downloadable: { type: Boolean, default: true },
    preview: Boolean,
    onUpload: Function as PropType<
      (file: File, control: UiFileUploadControl) => Promise<string>
    >,
  },
  setup(props) {
    return () => createFileUploader({ ...props });
  },
});
