import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, render } from 'vue'
import { ApiProblem } from '@mmda/core'
import { ErrorRetry, createErrorRetry } from '../components/ErrorRetry'

const hosts: HTMLElement[] = []

function mount(node: ReturnType<typeof h>) {
  const host = document.createElement('div')
  hosts.push(host)
  document.body.append(host)
  render(node, host)
  return host
}

afterEach(() => {
  for (const host of hosts) {
    render(null, host)
    host.remove()
  }
  hosts.length = 0
})

describe('ErrorRetry', () => {
  it('shows ApiProblem detail and retries', () => {
    const onRetry = vi.fn()
    const host = mount(
      h(ErrorRetry, {
        error: new ApiProblem({
          status: 503,
          title: 'Service Unavailable',
          detail: '基础服务不可用，请确认 mmda-base 等后端服务已启动',
        }),
        onRetry,
      }),
    )

    expect(host.querySelector('.mmda-error-retry--unavailable')).toBeTruthy()
    expect(host.textContent).toContain('无法加载页面')
    expect(host.textContent).toContain(
      '基础服务不可用，请确认 mmda-base 等后端服务已启动',
    )
    expect(host.textContent).toContain('重试')

    const button = host.querySelector('button')
    expect(button).toBeTruthy()
    button?.click()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('createErrorRetry 返回 ErrorRetry 节点', () => {
    const vnode = createErrorRetry({ description: 'boom' })
    expect(vnode.type).toBe(ErrorRetry)
    expect((vnode.props as { description?: string })?.description).toBe('boom')
  })
})
