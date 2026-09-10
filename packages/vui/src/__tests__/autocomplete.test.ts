import { describe, expect, it } from 'vitest'
import { MetaUiFieldRef, autoCompleteBindValue, autoCompleteSuggestionLabels, normalizeAutoCompleteOption, routeAutoCompleteField } from '@mmda/core'

describe('autoComplete helpers', () => {
  it('normalizes string and object options', () => {
    expect(normalizeAutoCompleteOption('CNY')).toEqual({
      value: 'CNY',
      label: 'CNY',
    })
    expect(
      normalizeAutoCompleteOption({ value: 'USD', label: '美元' }),
    ).toEqual({ value: 'USD', label: '美元' })
  })

  it('routes enum to dropDownList and hasOne to searchBox', () => {
    expect(routeAutoCompleteField({ reference: undefined })).toBe(
      'autoComplete',
    )
    const enumRef = MetaUiFieldRef.parse('0;A;甲|1;B;乙')
    expect(routeAutoCompleteField({ reference: enumRef! })).toBe('dropDownList')
    const hasOne = MetaUiFieldRef.parse('HAS_ONE Partner(id,name)')
    expect(routeAutoCompleteField({ reference: hasOne! })).toBe('searchBox')
  })

  it('uses labelOf for REF suggestions and bind value', () => {
    const reference = MetaUiFieldRef.parse('REF CurrencyUnit(unit,symbol)')
    expect(reference?.isRef).toBe(true)
    reference!.refOptions.push({ unit: 'USD', symbol: '美元' })
    const labels = autoCompleteSuggestionLabels({ reference: reference! })
    expect(labels).toEqual(['美元'])
    expect(
      autoCompleteBindValue(
        { unit: 'USD', symbol: '美元' },
        { reference: reference! },
      ),
    ).toBe('美元')
  })
})
