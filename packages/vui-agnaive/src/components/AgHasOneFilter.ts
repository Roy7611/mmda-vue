import { computed, defineComponent, h, onMounted, ref, type PropType } from 'vue'
import type { IFilterParams } from 'ag-grid-community'
import type { MetaUiField } from '@mmda/core'
import { isRefOptionsComplete } from '../filter_kind'

export interface AgHasOneFilterParams extends IFilterParams {
  field?: MetaUiField
  searchRelative?: (
    field: MetaUiField,
    searchWord: string,
  ) => Promise<unknown[]>
  loadFilterOptions?: (field: MetaUiField) => Promise<unknown[]>
}

type Choice = { label: string; value: unknown }

export const AgHasOneFilter = defineComponent({
  name: 'AgHasOneFilter',
  props: {
    params: { type: Object as PropType<AgHasOneFilterParams>, required: true },
  },
  setup(props) {
    const selected = ref<unknown[]>([])
    const options = ref<Choice[]>([])
    const query = ref('')
    const labels = new Map<string, string>()
    let debounce: ReturnType<typeof setTimeout> | undefined

    const field = () =>
      props.params.field ??
      (props.params.colDef?.context as { field?: MetaUiField } | undefined)?.field

    const toOptions = (rows: unknown[]): Choice[] => {
      const reference = field()?.reference
      if (!reference) {
        return rows.map(row => ({ label: String(row), value: row }))
      }
      return rows.map(row => {
        const value = reference.valueOf(row as any)
        const label = String(reference.labelOf(row as any) ?? '')
        labels.set(String(value), label)
        return { label, value }
      })
    }

    const listed = computed(() => {
      const seen = new Set(options.value.map(item => String(item.value)))
      const extras = selected.value
        .filter(value => !seen.has(String(value)))
        .map(value => ({
          value,
          label: labels.get(String(value)) ?? String(value ?? ''),
        }))
      return [...options.value, ...extras]
    })

    const showHome = () => {
      options.value = toOptions(field()?.reference?.refOptions ?? [])
    }

    const searchRemote = (word: string) => {
      const meta = field()
      if (!meta) return
      void Promise.resolve(props.params.searchRelative?.(meta, word)).then(
        rows => {
          options.value = toOptions(rows ?? [])
        },
      )
    }

    const filterLocal = (word: string) => {
      const mapped = toOptions(field()?.reference?.refOptions ?? [])
      const q = word.trim()
      options.value = q
        ? mapped.filter(
            item =>
              item.label.includes(q) || String(item.value).includes(q),
          )
        : mapped
    }

    const search = (word: string) => {
      const meta = field()
      if (!meta) return
      if (isRefOptionsComplete(meta)) {
        filterLocal(word)
        return
      }
      if (!word.trim()) {
        showHome()
        return
      }
      searchRemote(word)
    }

    const isFilterActive = () => selected.value.length > 0
    const doesFilterPass = (params: { data: Record<string, unknown> }) => {
      if (!selected.value.length) return true
      const name = field()?.fieldName
      if (!name) return true
      return selected.value.map(String).includes(String(params.data?.[name]))
    }
    const getModel = () =>
      selected.value.length ? { filterType: 'set', values: [...selected.value] } : null
    const setModel = (model: { values?: unknown[] } | null) => {
      selected.value = model?.values ? [...model.values] : []
    }
    const onSearchInput = (word: string) => {
      query.value = word
      if (debounce) clearTimeout(debounce)
      debounce = setTimeout(() => search(word), 300)
    }
    const toggle = (value: unknown, checked: boolean) => {
      const key = String(value)
      selected.value = checked
        ? [...selected.value.filter(item => String(item) !== key), value]
        : selected.value.filter(item => String(item) !== key)
      props.params.filterChangedCallback()
    }
    const isChecked = (value: unknown) =>
      selected.value.some(item => String(item) === String(value))

    onMounted(() => {
      const meta = field()
      if (!meta) return
      void Promise.resolve(props.params.loadFilterOptions?.(meta) ?? []).then(
        () => {
          if (isRefOptionsComplete(meta)) {
            filterLocal('')
            return
          }
          showHome()
        },
      )
    })

    return {
      isFilterActive,
      doesFilterPass,
      getModel,
      setModel,
      query,
      listed,
      onSearchInput,
      toggle,
      isChecked,
      placeholder: () => field()?.displayLabel ?? '',
    }
  },
  render() {
    return h(
      'div',
      { class: 'mmda-ag-hasone-filter ag-custom-component-popup' },
      [
        h('input', {
          class: 'mmda-ag-hasone-filter__search',
          type: 'search',
          value: this.query,
          placeholder: this.placeholder(),
          onInput: (event: Event) =>
            this.onSearchInput((event.target as HTMLInputElement).value),
        }),
        h(
          'div',
          { class: 'mmda-ag-hasone-filter__list' },
          this.listed.map(item =>
            h('label', { class: 'mmda-ag-hasone-filter__item', key: String(item.value) }, [
              h('input', {
                type: 'checkbox',
                checked: this.isChecked(item.value),
                onChange: (event: Event) =>
                  this.toggle(
                    item.value,
                    (event.target as HTMLInputElement).checked,
                  ),
              }),
              h('span', item.label),
            ]),
          ),
        ),
      ],
    )
  },
})
