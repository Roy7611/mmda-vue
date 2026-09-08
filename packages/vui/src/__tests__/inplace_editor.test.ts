import { describe, expect, it, vi } from 'vitest'
import {
  inplaceEditorActiveOf,
  inplaceEditorDisabledOf,
  inplaceEditorModifierClasses,
  isInplaceFieldEditorKey,
} from '../ui/factory/inplace_editor'
import {
  inplaceFieldContentRenderer,
  inplaceFieldDisplayRenderer,
  renderInplaceFieldEditor,
} from '../ui/factory/inplace_field'

describe('inplaceEditor helpers', () => {
  it('disabled is explicit; active is optional', () => {
    expect(inplaceEditorDisabledOf({})).toBe(false)
    expect(inplaceEditorDisabledOf({ disabled: true })).toBe(true)
    expect(inplaceEditorActiveOf({})).toBeUndefined()
    expect(inplaceEditorActiveOf({ active: true })).toBe(true)
    expect(inplaceEditorActiveOf({ active: false })).toBe(false)
  })

  it('hooks open and disabled classes', () => {
    const classes = inplaceEditorModifierClasses(
      { disabled: true },
      { open: true },
    ).join(' ')
    expect(classes).toContain('mmda-inplace-editor')
    expect(classes).toContain('mmda-inplace-editor--open')
    expect(classes).toContain('mmda-inplace-editor--disabled')
  })

  it('recognizes fld keys without matching inplaceEdit', () => {
    expect(isInplaceFieldEditorKey('inplaceFieldEditor')).toBe(true)
    expect(isInplaceFieldEditorKey('InplaceFieldEditor')).toBe(true)
    expect(isInplaceFieldEditorKey('inplaceEdit')).toBe(false)
    expect(isInplaceFieldEditorKey('inplaceEditor')).toBe(false)
  })
})

describe('inplaceFieldEditor helpers', () => {
  const fld = {
    fallbackDisplay: () => 'display',
    fallbackInput: () => 'input',
    textSpan: () => 'span',
    textInput: () => 'edit',
  } as any

  it('display uses renderer unless it is this control', () => {
    expect(
      inplaceFieldDisplayRenderer(
        { renderer: 'textSpan' } as any,
        fld,
      ),
    ).toBe(fld.textSpan)
    expect(
      inplaceFieldDisplayRenderer(
        { renderer: 'InplaceFieldEditor' } as any,
        fld,
      ),
    ).toBe(fld.fallbackDisplay)
  })

  it('content uses editor unless it is this control', () => {
    expect(
      inplaceFieldContentRenderer(
        { editor: 'textInput' } as any,
        fld,
      ),
    ).toBe(fld.textInput)
    expect(
      inplaceFieldContentRenderer(
        { editor: 'InplaceFieldEditor' } as any,
        fld,
      ),
    ).toBe(fld.fallbackInput)
  })

  it('uses chrome when enabled; display when disabled', () => {
    const chrome = vi.fn(() => 'chrome')
    const display = vi.fn(() => 'shown')
    const content = vi.fn(() => 'edit')
    const factory = {
      fallbackDisplay: display,
      fallbackInput: content,
    } as any
    const enabled = {
      isFieldReadonly: () => false,
      uiBuilder: { factory: { inplaceEditor: chrome } },
    }
    expect(
      renderInplaceFieldEditor({} as any, enabled as any, {}, factory),
    ).toBe('chrome')
    expect(chrome).toHaveBeenCalledTimes(1)
    expect(
      renderInplaceFieldEditor(
        {} as any,
        enabled as any,
        { disabled: true },
        factory,
      ),
    ).toBe('shown')
  })
})
