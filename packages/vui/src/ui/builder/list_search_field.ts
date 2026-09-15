import { defineComponent, h, type PropType } from "vue";
import type { VueUiContext } from "../../contexts/vue_ui_context";

export const ListSearchField = defineComponent({
  name: "ListSearchField",
  props: {
    context: { type: Object as PropType<VueUiContext<any>>, required: true },
    onFuzzySearch: { type: Function as PropType<() => void>, required: true },
    inputClass: { type: String, default: "mmda-searchbar__input" },
  },
  setup(props, { slots }) {
    return () => {
      const context = props.context;
      return h("div", { class: "mmda-searchbar__field" }, [
        h("input", {
          class: props.inputClass,
          type: "search",
          value: String(context.searchParam?.searchWord ?? ""),
          placeholder: context.t("action.search"),
          onInput: (event: Event) => {
            context.searchParam.searchWord = (
              event.target as HTMLInputElement
            ).value;
          },
          onKeydown: (event: KeyboardEvent) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            props.onFuzzySearch();
          },
        }),
        slots.default?.(),
      ]);
    };
  },
});
