import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { AppPluginRegistry } from '../host'

const Empty = defineComponent({ setup: () => () => null })

describe('AppPluginRegistry', () => {
  it('resolves service and namespaced logic token from route prefix', () => {
    const registry = new AppPluginRegistry()
    registry.register({
      name: 'base',
      service: 'base',
      routePrefix: '/BASE',
      home: Empty,
    })
    registry.register({
      name: 'mes',
      service: 'mes',
      routePrefix: '/MES',
      home: Empty,
    })

    expect(registry.service('/BASE/Materials')).toBe('base')
    expect(registry.service('/MES/Processes')).toBe('mes')
    expect(registry.logicToken('/MES/Processes', 'Processes')).toBe(
      'mes:ProcessesLogic',
    )
  })
})
