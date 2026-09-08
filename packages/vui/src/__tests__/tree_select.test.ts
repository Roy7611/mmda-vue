import { describe, expect, it, vi } from 'vitest'
import { MetaOptionsShape, MetaUiFieldRef } from '@mmda/core'
import {
  isTreeSelectReference,
  treeSelectNodesOf,
  treeSelectParentFieldOf,
  treeSelectPropsFromField,
} from '../ui/factory/tree_select'

describe('treeSelect helpers', () => {
  it('assembles flat parent rows into nested children', () => {
    const roots = treeSelectNodesOf({
      data: [
        { id: 'a', label: 'A', parentId: null },
        { id: 'a1', label: 'A1', parentId: 'a' },
      ],
      fields: {
        id: 'id',
        label: 'label',
        parentId: 'parentId',
        children: 'children',
      },
      treeShape: 'TREE',
      shapeKey: 'parentId',
    })
    expect(roots).toHaveLength(1)
    expect(roots[0].id).toBe('a')
    expect((roots[0] as { children?: { id: string }[] }).children?.[0]?.id).toBe(
      'a1',
    )
  })

  it('reads parent field from TREE refFlds[2] / groupBy', () => {
    const parsed = MetaUiFieldRef.parse(
      'REF MaterialCat(categoryID,categoryName,parentCatID)',
    )
    expect(parsed?.refOptionsShape).toBe(MetaOptionsShape.TREE)
    expect(isTreeSelectReference(parsed!)).toBe(true)
    expect(treeSelectParentFieldOf(parsed!)).toBe('parentCatID')

    const field = {
      fieldName: 'cat',
      reference: {
        ...parsed,
        isRef: true,
        hasOne: false,
        refOptions: [
          { categoryID: 'a', categoryName: 'A', parentCatID: null },
          { categoryID: 'a1', categoryName: 'A1', parentCatID: 'a' },
        ],
        valueOf: (row: { categoryID?: string }) => row.categoryID,
      },
    } as any
    const props = treeSelectPropsFromField(field, {
      getFieldValue: () => 'a',
      setFieldValue: vi.fn(),
      isFieldReadonly: () => false,
    })
    expect(props.fields?.parentId).toBe('parentCatID')
    expect(props.shapeKey).toBe('parentCatID')
    expect(props.treeShape).toBe('TREE')
    expect(props.loadMode).toBe('full')
    expect(props.data).toHaveLength(1)
  })

  it('maps TREE hasOne to lazy getRoots / getChildren when Logic has them', async () => {
    const field = {
      fieldName: 'cat',
      placeholder: '选分类',
      reference: {
        hasOne: true,
        refOptionsShape: MetaOptionsShape.TREE,
        refRepository: 'MaterialCats',
        refFlds: ['id', 'label', 'parentId'],
        groupBy: 'parentId',
        valueOf: (row: { id?: string }) => row.id,
        labelOf: (row: { label?: string }) => row.label,
      },
    } as any
    const getRoots = vi.fn(async () => [
      { id: 'r', label: '根', childrenCount: 1 },
    ])
    const getChildren = vi.fn(async () => [{ id: 'c', label: '子' }])
    const setFieldValue = vi.fn()
    const props = treeSelectPropsFromField(field, {
      getFieldValue: () => ({ id: 'r', label: '根' }),
      setFieldValue,
      isFieldReadonly: () => false,
      logic: { getRoots, getChildren },
    })
    expect(props.value).toBe('r')
    expect(props.loadMode).toBe('lazy')
    expect(props.fields?.parentId).toBe('parentId')
    const roots = await props.loadRoots?.()
    expect(getRoots).toHaveBeenCalled()
    expect(roots?.[0]).toMatchObject({ id: 'r' })
    const parent = { id: 'r', label: '根', childrenCount: 1 }
    await props.onExpand?.(parent)
    expect(getChildren).toHaveBeenCalledWith('r')
    expect((parent as { children?: unknown[] }).children).toHaveLength(1)
    props.onChange?.('c')
    expect(setFieldValue).toHaveBeenCalled()
  })

  it('does not invent getRoots when ref is not TREE', () => {
    const field = {
      fieldName: 'wh',
      reference: {
        hasOne: true,
        refOptionsShape: MetaOptionsShape.FLAT,
        refFlds: ['id', 'label'],
      },
    } as any
    const props = treeSelectPropsFromField(field, {
      getFieldValue: () => null,
      setFieldValue: vi.fn(),
      isFieldReadonly: () => false,
      logic: {},
    })
    expect(props.loadMode).toBe('full')
    expect(props.loadRoots).toBeUndefined()
    expect(props.onExpand).toBeUndefined()
  })
})
