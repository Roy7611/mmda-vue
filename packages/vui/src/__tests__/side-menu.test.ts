import { describe, expect, it } from 'vitest'
import {
  ModuleFactory,
  ModuleOp,
  ModuleStatus,
  ModuleVersion,
  activeAncestorKeys,
  assembleMenuItems,
  isLocalAppModuleUrl,
} from '@mmda/core'
import { wrapRailLabel } from '../components/AppSideMenu'

const sampleModules = new ModuleFactory([
  {
    moduleCode: 'B.01',
    moduleLabel: '组织架构',
    moduleType: 'MODULE',
    moduleVersion: ModuleVersion.TEAM,
    moduleIcon: 'far fa-sitemap',
    allowOps: 0,
    moduleUrl: '/BASE/org',
    requiredCreateParam: false,
    status: ModuleStatus.RELEASED,
    divider: false,
    subModules: [
      {
        moduleCode: 'B.01.01',
        moduleLabel: '部门',
        moduleType: 'FEATURE',
        moduleVersion: ModuleVersion.TEAM,
        allowOps: ModuleOp.READ | ModuleOp.EDIT,
        moduleUrl: '/BASE/Departments',
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
      },
    ],
  },
  {
    moduleCode: 'B.02',
    moduleLabel: '商业贸易',
    moduleType: 'MODULE',
    moduleVersion: ModuleVersion.TEAM,
    allowOps: ModuleOp.READ,
    moduleUrl: '/BASE/trade',
    requiredCreateParam: false,
    status: ModuleStatus.RELEASED,
    divider: false,
    subModules: [
      {
        moduleCode: 'B.02.01',
        moduleLabel: '合作伙伴',
        moduleType: 'FEATURE',
        moduleVersion: ModuleVersion.TEAM,
        allowOps: ModuleOp.READ,
        moduleUrl: '/BASE/Partners',
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
      },
    ],
  },
]).modules

describe('AppSideMenu helpers', () => {
  it('assembleMenuItems keeps parent groups when children are readable', () => {
    const items = assembleMenuItems(sampleModules)
    expect(items.map(i => i.label)).toEqual(['组织架构', '商业贸易'])
    expect(items[0]?.items?.[0]?.label).toBe('部门')
    expect(items[0]?.items?.[0]?.allowCreate).toBe(false)
  })

  it('assembleMenuItems sets allowCreate on leaf features with CREATE auth', () => {
    const modules = new ModuleFactory([
      {
        moduleCode: 'B.01',
        moduleLabel: '组织架构',
        moduleType: 'MODULE',
        moduleVersion: ModuleVersion.TEAM,
        allowOps: 0,
        moduleUrl: '/BASE/org',
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
        subModules: [
          {
            moduleCode: 'B.01.01',
            moduleLabel: '部门',
            moduleType: 'FEATURE',
            moduleVersion: ModuleVersion.TEAM,
            allowOps: ModuleOp.READ | ModuleOp.CREATE,
            moduleUrl: '/BASE/Departments',
            requiredCreateParam: false,
            status: ModuleStatus.RELEASED,
            divider: false,
          },
        ],
      },
    ]).modules
    const items = assembleMenuItems(modules)
    expect(items[0]?.items?.[0]?.allowCreate).toBe(true)
  })

  it('activeAncestorKeys expands parents for the active feature route', () => {
    expect(activeAncestorKeys(sampleModules, '/BASE/Partners')).toEqual([
      'B.02',
      'B.02.01',
    ])
  })

  it('isLocalAppModuleUrl treats other SPA prefixes as foreign', () => {
    expect(isLocalAppModuleUrl('base', '/BASE/Departments')).toBe(true)
    expect(isLocalAppModuleUrl('base', '/MES/Stations')).toBe(false)
    expect(isLocalAppModuleUrl('mes', '/MES/Stations')).toBe(true)
    expect(isLocalAppModuleUrl('', '/MES/Stations')).toBe(true)
  })
})

describe('wrapRailLabel', () => {
  it('wraps dense Chinese every 4 characters', () => {
    expect(wrapRailLabel('客户关系管理')).toBe('客户关系\n管理')
    expect(wrapRailLabel('基础数据')).toBe('基础数据')
    expect(wrapRailLabel('供应商关系管理')).toBe('供应商关\n系管理')
  })

  it('leaves English and spaced labels for CSS wrap', () => {
    expect(wrapRailLabel('Manufacturing')).toBe('Manufacturing')
    expect(wrapRailLabel('Customer Relations')).toBe('Customer Relations')
    expect(wrapRailLabel('MES')).toBe('MES')
  })
})
