import { describe, expect, it } from 'vitest'
import {
  ModuleFactory,
  ModuleOp,
  ModuleStatus,
  ModuleVersion,
} from '@mmda/core'
import { assembleMenuItems } from '../components/AppSideMenu'
import { PrimeVueUiBuilder } from '../prime_builder'

const sampleModules = new ModuleFactory([
  {
    moduleCode: 'B.01',
    moduleLabel: '组织架构',
    moduleType: 'MODULE',
    moduleVersion: ModuleVersion.TEAM,
    moduleIcon: 'far fa-sitemap',
    allowOp: 0,
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
        allowOp: ModuleOp.READ | ModuleOp.EDIT,
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
    allowOp: ModuleOp.READ,
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
        allowOp: ModuleOp.READ,
        moduleUrl: '/BASE/Partners',
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
      },
    ],
  },
]).modules

describe('AppSideMenu', () => {
  it('assembleMenuItems keeps parent groups when children are readable', () => {
    const items = assembleMenuItems(sampleModules)
    expect(items.some(i => i.label === '组织架构')).toBe(true)
    expect(items.some(i => i.label === '商业贸易')).toBe(true)
    const org = items.find(i => i.label === '组织架构')
    expect(org?.items?.[0]?.label).toBe('部门')
  })

  it('buildAppMenu passes item template as slot, not PanelMenu prop', () => {
    const builder = new PrimeVueUiBuilder()
    const item = () => null
    const vnode = builder.buildAppMenu(sampleModules.slice(0, 1), { item })
    expect(vnode.props?.item).toBeUndefined()
    expect(vnode.children?.item).toBe(item)
  })
})
