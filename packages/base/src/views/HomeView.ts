import { MMDA_BASE_KEY } from '../keys'
import { UI_APP_KEY, UI_BUILDER_KEY, type MmdaApplication, type UiBuilder } from '@mmda/vui'
import { defineComponent, h, inject } from 'vue'
import { useRouter } from 'vue-router'
import type { Module } from '@mmda/core'

function leafCount(modules: Module[]): number {
  let n = 0
  for (const m of modules) {
    if (m.moduleType === 'FEATURE') n++
    if (m.subModules?.length) n += leafCount(m.subModules)
  }
  return n
}

function greeting(): string {
  const hh = new Date().getHours()
  if (hh < 6) return '凌晨好'
  if (hh < 12) return '上午好'
  if (hh < 14) return '中午好'
  if (hh < 18) return '下午好'
  return '晚上好'
}

let styleInjected = false
function injectResponsiveCSS() {
  if (!styleInjected && typeof document !== 'undefined') {
    styleInjected = true
    const style = document.createElement('style')
    style.textContent = `
      .home-stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
      .home-card-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
      .home-top-pad { padding: 24px 24px 0 24px; }
      .home-scroll { padding: 0 24px 24px 24px; }
      @media (max-width: 1400px) { .home-card-grid { grid-template-columns: repeat(4, 1fr); } }
      @media (max-width: 1100px) { .home-card-grid { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 768px) { .home-card-grid { grid-template-columns: repeat(2, 1fr); } .home-stat-grid { grid-template-columns: 1fr; } .home-top-pad { padding: 16px 16px 0 16px; } .home-scroll { padding: 0 16px 16px 16px; } }
      @media (max-width: 480px) { .home-card-grid { grid-template-columns: 1fr; } }
    `
    document.head.appendChild(style)
  }
}

export const HomeView = defineComponent({
  name: 'HomeView',
  setup: () => {
    const b = inject<UiBuilder>(UI_BUILDER_KEY)!
    const { factory } = b
    const app = (inject(MMDA_BASE_KEY) ?? inject(UI_APP_KEY)) as MmdaApplication
    const { modules, user, context } = app
    const router = useRouter()
    void app.getTodoCount()
    injectResponsiveCSS()

    return () => {
      if (!user?.username && !modules?.length)
        return h('div', { class: 'p-6' }, '加载中…')
      const total = leafCount(modules)
      if (user?.username && total === 0)
        return h('div', { class: 'p-6' }, '暂无可用模块')

      const groups = modules.filter(
        (m: Module) => m.moduleType === 'MODULE' && m.subModules?.length,
      )

      const cardStyle = {
        background: 'var(--p-surface-card, var(--p-content-background))',
        border: '1px solid var(--p-content-border-color, var(--p-surface-border))',
        borderRadius: 'var(--p-border-radius-lg, 8px)',
      }
      const mutedText = { color: 'var(--p-text-muted-color, #6b7280)' }
      const normalText = { color: 'var(--p-text-color, #1f2937)' }

      return h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          },
        },
        [
          h('div', { class: 'home-top-pad', style: { flexShrink: 0 } }, [
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                },
              },
              [
                h('div', {}, [
                  h(
                    'h1',
                    {
                      style: {
                        fontSize: '20px',
                        fontWeight: 700,
                        margin: '0 0 4px 0',
                        color: 'var(--p-text-color)',
                      },
                    },
                    '基础数据工作台',
                  ),
                  h('p', { style: { fontSize: '14px', ...mutedText, margin: 0 } }, [
                    `${greeting()}，`,
                    h(
                      'strong',
                      { style: { color: 'var(--p-text-color)', fontWeight: 600 } },
                      user?.username || '未知用户',
                    ),
                  ]),
                ]),
              ],
            ),
            h('div', { class: 'home-stat-grid' }, [
              h(
                'div',
                {
                  style: {
                    ...cardStyle,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                },
                [
                  h('div', {}, [
                    h('div', { style: { fontSize: '12px', ...mutedText } }, '模块总数'),
                    h(
                      'div',
                      {
                        style: {
                          fontSize: '28px',
                          fontWeight: 700,
                          color: 'var(--p-primary-color, #3b82f6)',
                          marginTop: '4px',
                        },
                      },
                      String(total),
                    ),
                  ]),
                ],
              ),
              h(
                'div',
                {
                  style: {
                    ...cardStyle,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  },
                  onClick: () => {
                    const findNotify = (list: Module[]): Module | undefined => {
                      for (const m of list) {
                        if (
                          m.shortLabel === 'Notifications' ||
                          m.moduleLabel?.includes('通知')
                        )
                          return m
                        if (m.subModules?.length) {
                          const found = findNotify(m.subModules)
                          if (found) return found
                        }
                      }
                      return undefined
                    }
                    const notifyModule = findNotify(modules)
                    if (notifyModule?.moduleUrl) router.push(notifyModule.moduleUrl)
                  },
                },
                [
                  h('div', {}, [
                    h('div', { style: { fontSize: '12px', ...mutedText } }, '待办事项'),
                    h(
                      'div',
                      {
                        style: {
                          fontSize: '28px',
                          fontWeight: 700,
                          color: 'var(--p-yellow-500, #f59e0b)',
                          marginTop: '4px',
                        },
                      },
                      String(context.todoCount ?? 0),
                    ),
                  ]),
                ],
              ),
            ]),
          ]),
          h(
            'h2',
            {
              style: {
                fontSize: '14px',
                fontWeight: 600,
                margin: '0 0 12px 24px',
                color: 'var(--p-text-color)',
              },
            },
            '模块导航',
          ),
          h(
            'div',
            {
              class: 'home-scroll',
              style: { flex: 1, overflowY: 'auto', overflowX: 'hidden' },
            },
            groups
              .map((g: Module) => {
                const features = (g.subModules || []).filter(
                  (s: Module) => s.moduleType === 'FEATURE' && s.allowOp !== 0,
                )
                if (!features.length) return null
                return h('div', { style: { marginBottom: '20px' } }, [
                  h(
                    'div',
                    {
                      style: {
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.8px',
                        color: 'var(--p-text-muted-color)',
                        marginBottom: '8px',
                      },
                    },
                    g.moduleLabel,
                  ),
                  h(
                    'div',
                    { class: 'home-card-grid' },
                    features.map((sm: Module) =>
                      h(
                        'div',
                        {
                          style: {
                            ...cardStyle,
                            padding: '14px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                          },
                          onClick: () => {
                            if (sm.moduleUrl) router.push(sm.moduleUrl)
                          },
                        },
                        [
                          sm.moduleIcon
                            ? h(
                                'div',
                                {
                                  style: {
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'var(--p-primary-50)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  },
                                },
                                [
                                  factory.icon(sm.moduleIcon, {
                                    style: { color: 'var(--p-primary-color)' },
                                  }),
                                ],
                              )
                            : null,
                          h('div', { style: { minWidth: 0, flex: 1 } }, [
                            h(
                              'div',
                              { style: { fontSize: '13px', fontWeight: 600, ...normalText } },
                              sm.moduleLabel,
                            ),
                            sm.description
                              ? h(
                                  'div',
                                  {
                                    style: {
                                      fontSize: '11px',
                                      ...mutedText,
                                      marginTop: '2px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    },
                                  },
                                  sm.description,
                                )
                              : null,
                          ]),
                        ],
                      ),
                    ),
                  ),
                ])
              })
              .filter(Boolean),
          ),
        ],
      )
    }
  },
})
