import { afterEach, describe, expect, it } from 'vitest'
import {
  attachDialogResize,
  detachDialogResize,
  findTopNaiveDialog,
} from '../dialog_resize'

describe('dialog_resize', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('挂东南角拖柄，并可卸掉', () => {
    const el = document.createElement('div')
    el.className = 'n-dialog mmda-dialog'
    document.body.appendChild(el)
    attachDialogResize(el)
    expect(el.querySelector('[data-mmda-dialog-resize="se"]')).toBeTruthy()
    detachDialogResize(el)
    expect(el.querySelector('[data-mmda-dialog-resize]')).toBeNull()
  })

  it('findTopNaiveDialog 取最后一个对话框', () => {
    const a = document.createElement('div')
    a.className = 'n-dialog mmda-dialog'
    const b = document.createElement('div')
    b.className = 'n-dialog mmda-dialog'
    document.body.append(a, b)
    expect(findTopNaiveDialog()).toBe(b)
  })
})
