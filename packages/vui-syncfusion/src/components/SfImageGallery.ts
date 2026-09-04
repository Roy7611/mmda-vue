import { computed, defineComponent, h, ref, type PropType } from "vue";
import { CarouselComponent } from "@syncfusion/ej2-vue-navigations";
import { DialogComponent } from "@syncfusion/ej2-vue-popups";

export interface SfImageGalleryItem {
  src: string;
  thumbnail?: string;
  alt?: string;
  title?: string;
  description?: string;
  data?: unknown;
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]!,
  );

export const SfImageGallery = defineComponent({
  name: "SfImageGallery",
  props: {
    items: {
      type: Array as PropType<SfImageGalleryItem[]>,
      default: () => [],
    },
    emptyText: { type: String, default: "暂无图片" },
    columns: { type: Number, default: 4 },
    dialogTitle: { type: String, default: "图片预览" },
    loop: { type: Boolean, default: true },
  },
  emits: ["itemClick", "itemDblclick", "update:visible"],
  setup(props, { emit }) {
    const visible = ref(false);
    const selectedIndex = ref(0);

    const images = computed(() =>
      props.items.filter((item) => Boolean(item?.src)),
    );

    const open = (index: number) => {
      selectedIndex.value = index;
      visible.value = true;
      emit("itemClick", images.value[index], index);
      emit("update:visible", true);
    };

    const close = () => {
      visible.value = false;
      emit("update:visible", false);
    };

    const carouselItems = computed(() =>
      images.value.map((item) => {
        const src = escapeHtml(item.src);
        const alt = escapeHtml(item.alt ?? item.title ?? "");
        const caption = escapeHtml(item.description ?? item.title ?? "");
        return {
          template: `
            <figure class="mmda-image-gallery__slide">
              <img class="mmda-image-gallery__full-image" src="${src}" alt="${alt}" />
              ${caption ? `<figcaption>${caption}</figcaption>` : ""}
            </figure>`,
        };
      }),
    );

    return () => {
      if (!images.value.length) {
        return h(
          "div",
          { class: "mmda-image-gallery mmda-image-gallery--empty" },
          props.emptyText,
        );
      }

      return h("div", { class: "mmda-image-gallery" }, [
        h(
          "div",
          {
            class: "mmda-image-gallery__grid",
            style: {
              "--mmda-image-gallery-columns": String(
                Math.max(1, props.columns),
              ),
            },
          },
          images.value.map((item, index) =>
            h(
              "button",
              {
                type: "button",
                class: "mmda-image-gallery__thumbnail",
                title: item.title ?? item.alt ?? "",
                onClick: () => open(index),
                onDblclick: () => emit("itemDblclick", item, index),
              },
              [
                h("img", {
                  src: item.thumbnail ?? item.src,
                  alt: item.alt ?? item.title ?? "",
                  loading: "lazy",
                }),
                (item.title || item.description) &&
                  h(
                    "span",
                    { class: "mmda-image-gallery__caption" },
                    item.title ?? item.description,
                  ),
              ],
            ),
          ),
        ),
        visible.value &&
          h(
            DialogComponent as any,
            {
              visible: true,
              isModal: true,
              showCloseIcon: true,
              closeOnEscape: true,
              allowDragging: false,
              enableResize: false,
              width: "100vw",
              height: "100vh",
              target: "body",
              header: props.dialogTitle,
              cssClass: "mmda-image-gallery-dialog",
              close,
              overlayClick: close,
            },
            {
              default: () =>
                h(CarouselComponent as any, {
                  key: `photo-carousel-${selectedIndex.value}`,
                  items: carouselItems.value,
                  selectedIndex: selectedIndex.value,
                  loop: props.loop,
                  autoPlay: false,
                  showPlayButton: false,
                  showIndicators: images.value.length > 1,
                  buttonsVisibility: "Visible",
                  enableTouchSwipe: true,
                  allowKeyboardInteraction: true,
                  height: "100%",
                  cssClass: "mmda-image-gallery__carousel",
                  slideChanged: (args: { currentIndex?: number }) => {
                    if (typeof args.currentIndex === "number") {
                      selectedIndex.value = args.currentIndex;
                    }
                  },
                }),
            },
          ),
      ]);
    };
  },
});
