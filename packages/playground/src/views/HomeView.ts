import { defineComponent, h, inject } from "vue";
import { useRouter } from "vue-router";
import { UI_BUILDER_KEY, type UiBuilder } from "@mmda/vui";
import { DEMO_PREFIX } from "../catalog";

const cards = [
  {
    title: "商品列表",
    desc: "AG Grid 列表、搜索、分页、详情/编辑表单。",
    to: `${DEMO_PREFIX}/Products`,
  },
  {
    title: "分类树",
    desc: "Naive NTree：搜索、勾选编辑、懒加载箭头。",
    to: `${DEMO_PREFIX}/Categories`,
  },
  {
    title: "分类 + 商品",
    desc: "左树右表（categoryList），点分类过滤商品。",
    to: `${DEMO_PREFIX}/Catalog`,
  },
];

export const HomeView = defineComponent({
  name: "HomeView",
  setup() {
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder;
    const router = useRouter();
    return () =>
      h("div", { class: "mmda-playground-home" }, [
        h("p", { class: "mmda-playground-home__eyebrow" }, "Playground"),
        h("h1", "把玩 vui-agnaive"),
        h(
          "p",
          { class: "mmda-playground-home__lead" },
          "假数据、仿 app 壳。侧栏进列表 / 树 / 左树右表，对照皮肤实现。",
        ),
        h(
          "div",
          { class: "mmda-playground-home__cards" },
          cards.map((card) =>
            h(
              "article",
              {
                class: "mmda-playground-home__card",
                onClick: () => void router.push(card.to),
              },
              [
                h("h2", card.title),
                h("p", card.desc),
                builder.factory.button({
                  label: "打开",
                  colorRole: "primary",
                  size: "small",
                  onClick: () => void router.push(card.to),
                }),
              ],
            ),
          ),
        ),
      ]);
  },
});
