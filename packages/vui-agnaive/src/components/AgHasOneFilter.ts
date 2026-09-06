import { defineComponent, h, ref, type PropType } from 'vue'
import { NSelect } from 'naive-ui'
import type { IFilterParams } from 'ag-grid-community'
import type { MetaUiField } from '@mmda/core'

export interface AgHasOneFilterParams extends IFilterParams {
  field?: MetaUiField
  searchRelative?: (
    field: MetaUiField,
    searchWord: string,
  ) => Promise<unknown[]>
}

export const AgHasOneFilter = defineComponent({
  name: 'AgHasOneFilter',
  props: {
    params: { type: Object as PropType<AgHasOneFilterParams>, required: true },
  },
  setup(props) {
    const selected = ref<unknown[]>([])
    const options = ref<{ label: string; value: unknown }[]>([])
    let debounce: ReturnType<typeof setTimeout> | undefined

    const field = () =>
      props.params.field ??
      (props.params.colDef?.context as { field?: MetaUiField } | undefined)?.field

    const toOptions = (rows: unknown[]) => {
      const reference = field()?.reference
      if (!reference) {
        return rows.map(row => ({ label: String(row), value: row }))
      }
      return rows.map(row => ({
        label: String(reference.labelOf(row as any)),
        value: reference.valueOf(row as any),
      }))
    }

    const search = (word: string) => {
      const meta = field()
      if (!meta) return
      void Promise.resolve(props.params.searchRelative?.(meta, word)).then(
        rows => {
          options.value = toOptions(rows ?? [])
        },
      )
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
    const onSearch = (word: string) => {
      if (debounce) clearTimeout(debounce)
      debounce = setTimeout(() => search(word), 300)
    }
    const onUpdateValue = (value: unknown[]) => {
      selected.value = value ?? []
      props.params.filterChangedCallback()
    }
    const onFocus = () => {
      if (!options.value.length) search('')
    }

    return {
      isFilterActive,
      doesFilterPass,
      getModel,
      setModel,
      selected,
      options,
      onSearch,
      onUpdateValue,
      onFocus,
      placeholder: () => field()?.displayLabel ?? '',
    }
  },
  render() {
    return h(
      'div',
      { class: 'mmda-ag-hasone-filter', style: 'padding: 8px; min-width: 12rem' },
      [
        h(NSelect, {
          value: this.selected,
          multiple: true,
          filterable: true,
          remote: true,
          clearable: true,
          options: this.options,
          placeholder: this.placeholder(),
          class: 'ag-custom-component-popup',
          onSearch: this.onSearch,
          onUpdateValue: this.onUpdateValue,
          onFocus: this.onFocus,
        }),
      ],
    )
  },
})
