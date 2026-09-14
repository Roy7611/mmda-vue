import { defineComponent, h, ref, type PropType } from "vue";
import type { VueUiContext } from "../../contexts/vue_ui_context";
import {
  applyNamedQuery,
  canDeleteNamedQuery,
  deleteNamedQuery,
  LIST_SEARCH_MODE_NAMED,
  listSearchModeAddon,
  listSearchModeOf,
  searchNamedQueries,
} from "./list_named_query";

export const ListSearchField = defineComponent({
  name: "ListSearchField",
  props: {
    context: { type: Object as PropType<VueUiContext<any>>, required: true },
    onFuzzySearch: { type: Function as PropType<() => void>, required: true },
    inputClass: { type: String, default: "mmda-searchbar__input" },
  },
  setup(props) {
    const namedWord = ref("");
    const suggestions = ref<any[]>([]);
    const searching = ref(false);

    const loadSuggest = async (word: string) => {
      searching.value = true;
      try {
        suggestions.value = await searchNamedQueries(props.context, word);
      } finally {
        searching.value = false;
      }
    };

    return () => {
      const context = props.context;
      const named = listSearchModeOf(context) === LIST_SEARCH_MODE_NAMED;
      const placeholder = named
        ? context.t("action.searchNamedQuery")
        : context.t("action.search");
      return h("div", { class: "mmda-searchbar__field" }, [
        listSearchModeAddon(context, () => {
          namedWord.value = "";
          suggestions.value = [];
        }),
        h("input", {
          class: props.inputClass,
          type: "search",
          value: named
            ? namedWord.value
            : String(context.searchParam?.searchWord ?? ""),
          placeholder,
          onInput: (event: Event) => {
            const value = (event.target as HTMLInputElement).value;
            if (named) {
              namedWord.value = value;
              void loadSuggest(value);
              return;
            }
            context.searchParam.searchWord = value;
          },
          onKeydown: (event: KeyboardEvent) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            if (!named) props.onFuzzySearch();
          },
        }),
        named && suggestions.value.length
          ? h(
              "ul",
              { class: "mmda-searchbar__named-suggest" },
              suggestions.value.map((row) =>
                h("li", { class: "mmda-searchbar__named-suggest-item" }, [
                  h(
                    "button",
                    {
                      type: "button",
                      class: "mmda-searchbar__named-suggest-pick",
                      onClick: () => {
                        if (!applyNamedQuery(context, row)) return;
                        namedWord.value = String(row.queryName ?? "");
                        suggestions.value = [];
                        void context.search?.();
                      },
                    },
                    row.queryName ?? row.queryID,
                  ),
                  canDeleteNamedQuery(row)
                    ? h(
                        "button",
                        {
                          type: "button",
                          class: "mmda-searchbar__named-suggest-delete",
                          title: context.t("action.deleteQuery"),
                          onClick: (event: Event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void deleteNamedQuery(context, row).then((ok) => {
                              if (ok)
                                suggestions.value = suggestions.value.filter(
                                  (item) => item.queryID !== row.queryID,
                                );
                            });
                          },
                        },
                        "×",
                      )
                    : null,
                ]),
              ),
            )
          : null,
      ]);
    };
  },
});
