import { describe, expect, it } from 'vitest'
import {
  ModuleActionMode,
  ModuleActionPromptType,
  ModuleOp,
  UiViewMany,
  auth,
  resolveDetailsTopbarActions,
  resolveEditTopbarActions,
  resolveIndexTopbarActions,
  type ModuleAction,
  type UiContext,
} from '../index'

function names(groups: { primary: { name?: string }[]; batch: { name?: string }[]; more: { name?: string }[] }) {
  return {
    primary: groups.primary.map((action) => action.name),
    batch: groups.batch.map((action) => action.name),
    more: groups.more.map((action) => action.name),
  }
}

function context(partial: Record<string, unknown>): UiContext {
  return partial as unknown as UiContext
}

function moduleAction(
  actionName: string,
  extras: Partial<ModuleAction> = {},
): ModuleAction {
  return {
    moduleCode: 'M',
    actionCode: actionName,
    actionModes: ModuleActionMode.LIST,
    actionName,
    ...extras,
  }
}

describe('resolveIndexTopbarActions', () => {
  it('批量选择是取消与确定', () => {
    expect(
      names(
        resolveIndexTopbarActions(
          context({
            view: UiViewMany.SelectMany,
            selectionMode: 'multiple',
          }),
        ),
      ),
    ).toEqual({ primary: ['cancel', 'confirm'], batch: [], more: [] })
  })

  it('对话框内多选不画取消确定，允许创建则画新建', () => {
    const withCreate = auth(ModuleOp.READ | ModuleOp.CREATE)
    expect(
      names(
        resolveIndexTopbarActions(
          context({
            view: UiViewMany.SelectMany,
            selectionMode: 'multiple',
            isInDialog: true,
            module: { authority: withCreate },
          }),
        ),
      ),
    ).toEqual({ primary: ['create'], batch: [], more: [] })
    expect(
      names(
        resolveIndexTopbarActions(
          context({
            view: UiViewMany.SelectMany,
            selectionMode: 'multiple',
            isInDialog: true,
            module: { authority: auth(ModuleOp.READ) },
          }),
        ),
      ),
    ).toEqual({ primary: [], batch: [], more: [] })
  })

  it('列表页按 allowOps 分到 primary / batch / more', () => {
    const authority = auth(
      ModuleOp.READ |
        ModuleOp.CREATE |
        ModuleOp.DELETE |
        ModuleOp.IMPORT |
        ModuleOp.EXPORT |
        ModuleOp.PRINT,
    )
    authority.authorizedActions = [
      moduleAction('ship', {
        promptType: ModuleActionPromptType.MULTIPLE_SELECT,
      }),
      moduleAction('preview'),
      moduleAction('audit', { actionModes: ModuleActionMode.READ }),
    ]
    const groups = resolveIndexTopbarActions(
      context({
        view: UiViewMany.Index,
        module: { authority },
        customActions: [{ name: 'audit' }, { name: 'unknown' }],
      }),
    )
    expect(names(groups)).toEqual({
      primary: ['create'],
      batch: ['deleteAll', 'ship'],
      more: ['import', 'export', 'print', 'preview', 'audit'],
    })
    expect(groups.batch[0]?.colorRole).toBe('danger')
  })

  it('无权限返回空组', () => {
    expect(names(resolveIndexTopbarActions(context({ view: UiViewMany.Index })))).toEqual({
      primary: [],
      batch: [],
      more: [],
    })
  })
})

describe('resolveDetailsTopbarActions', () => {
  it('详情主栏 back / edit / create / delete，文件动作进 more', () => {
    const groups = resolveDetailsTopbarActions(
      context({
        module: {
          authority: auth(
            ModuleOp.READ |
              ModuleOp.EDIT |
              ModuleOp.CREATE |
              ModuleOp.DELETE |
              ModuleOp.PRINT |
              ModuleOp.EXPORT |
              ModuleOp.IMPORT,
          ),
        },
        model: {
          editable: true,
          deletable: true,
          actions: [{ name: 'deprecate', label: '弃用' }],
        },
      }),
    )
    expect(names(groups)).toEqual({
      primary: ['back', 'edit', 'create', 'delete', 'deprecate'],
      batch: [],
      more: ['print', 'export', 'import'],
    })
  })

  it('不可编删时不画 edit / delete', () => {
    expect(
      names(
        resolveDetailsTopbarActions(
          context({
            module: {
              authority: auth(ModuleOp.READ | ModuleOp.EDIT | ModuleOp.DELETE),
            },
            model: { editable: false, deletable: false },
          }),
        ),
      ),
    ).toEqual({ primary: ['back'], batch: [], more: [] })
  })
})

describe('resolveEditTopbarActions', () => {
  it('编辑栏 back / import / save', () => {
    expect(
      names(
        resolveEditTopbarActions(
          context({
            module: { authority: auth(ModuleOp.READ | ModuleOp.IMPORT) },
          }),
        ),
      ),
    ).toEqual({ primary: ['back', 'import', 'save'], batch: [], more: [] })
  })
})
