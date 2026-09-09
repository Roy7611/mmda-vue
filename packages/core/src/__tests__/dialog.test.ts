import { describe, expect, it } from 'vitest'
import {
  dialogButtonColorRole,
  dialogFooterKind,
  dialogHeaderKind,
  isDialogPrimaryButton,
  resolveDialogButtons,
  shouldCloseDialog,
  type UiDialogButton,
} from '../ui/builder/dialog'

describe('dialog buttons', () => {
  it('缺省 okCancel', () => {
    expect(resolveDialogButtons()).toEqual(['cancel', 'ok'])
    expect(resolveDialogButtons('okCancel')).toEqual(['cancel', 'ok'])
  })

  it('解析各预设', () => {
    expect(resolveDialogButtons('ok')).toEqual(['ok'])
    expect(resolveDialogButtons('yesNo')).toEqual(['no', 'yes'])
    expect(resolveDialogButtons('yesNoCancel')).toEqual(['yes', 'no', 'cancel'])
    expect(resolveDialogButtons('retryCancel')).toEqual(['retry', 'cancel'])
    expect(resolveDialogButtons('abortRetryIgnore')).toEqual([
      'abort',
      'retry',
      'ignore',
    ])
  })

  it('主按钮与 colorRole', () => {
    expect(isDialogPrimaryButton('ok')).toBe(true)
    expect(isDialogPrimaryButton('yes')).toBe(true)
    expect(isDialogPrimaryButton('retry')).toBe(true)
    expect(isDialogPrimaryButton('cancel')).toBe(false)
    expect(dialogButtonColorRole('ok')).toBe('primary')
    expect(dialogButtonColorRole('abort')).toBe('danger')
    expect(dialogButtonColorRole('cancel')).toBeUndefined()
  })

  it('shouldCloseDialog 主按钮走 onAccept，其余走 onReject', async () => {
    const seen: string[] = []
    const props = {
      onAccept: async (button: UiDialogButton) => {
        seen.push(`a:${button}`)
        return button !== 'retry'
      },
      onReject: async (button: UiDialogButton) => {
        seen.push(`r:${button}`)
        return button !== 'no'
      },
    }
    await expect(shouldCloseDialog(props, 'ok')).resolves.toBe(true)
    await expect(shouldCloseDialog(props, 'retry')).resolves.toBe(false)
    await expect(shouldCloseDialog(props, 'cancel')).resolves.toBe(true)
    await expect(shouldCloseDialog(props, 'no')).resolves.toBe(false)
    expect(seen).toEqual(['a:ok', 'a:retry', 'r:cancel', 'r:no'])
  })

  it('header / footer kind：插槽优先', () => {
    expect(dialogHeaderKind({})).toBe('title')
    expect(dialogHeaderKind({ header: () => 'x' })).toBe('slot')
    expect(dialogFooterKind({})).toBe('buttons')
    expect(dialogFooterKind({ showFooter: false })).toBe('none')
    expect(dialogFooterKind({ footer: () => 'x', showFooter: false })).toBe(
      'slot',
    )
  })
})


describe('dialog buttons', () => {
  it('缺省 okCancel', () => {
    expect(resolveDialogButtons()).toEqual(['cancel', 'ok'])
    expect(resolveDialogButtons('okCancel')).toEqual(['cancel', 'ok'])
  })

  it('解析各预设', () => {
    expect(resolveDialogButtons('ok')).toEqual(['ok'])
    expect(resolveDialogButtons('yesNo')).toEqual(['no', 'yes'])
    expect(resolveDialogButtons('yesNoCancel')).toEqual(['yes', 'no', 'cancel'])
    expect(resolveDialogButtons('retryCancel')).toEqual(['retry', 'cancel'])
    expect(resolveDialogButtons('abortRetryIgnore')).toEqual([
      'abort',
      'retry',
      'ignore',
    ])
  })

  it('主按钮与 colorRole', () => {
    expect(isDialogPrimaryButton('ok')).toBe(true)
    expect(isDialogPrimaryButton('yes')).toBe(true)
    expect(isDialogPrimaryButton('retry')).toBe(true)
    expect(isDialogPrimaryButton('cancel')).toBe(false)
    expect(dialogButtonColorRole('ok')).toBe('primary')
    expect(dialogButtonColorRole('abort')).toBe('danger')
    expect(dialogButtonColorRole('cancel')).toBeUndefined()
  })
})
