import { h } from "vue";
import {
  AccordionComponent,
  MenuComponent,
} from "@syncfusion/ej2-vue-navigations";
import { normalizeMenuItem } from "./utils";

export const miscellaneousRenderers = {
  scrollbar: (content: any, props: any) =>
    h("div", { class: "mmda-sf-scrollbar", ...props }, content as any),
  menu: (items: any[], props: any) =>
    h(MenuComponent as any, {
      items: items.map((item) => normalizeMenuItem(item)),
      select: (args: any) => args.item?.command?.(),
      ...props,
    }),
  panelMenu: (items: any[], props: any, slots: any) =>
    h(
      AccordionComponent as any,
      {
        items: items.map((item) => ({
          header: item.label,
          content: item.items,
          iconCss: item.icon,
        })),
        ...props,
      },
      slots,
    ),
};
