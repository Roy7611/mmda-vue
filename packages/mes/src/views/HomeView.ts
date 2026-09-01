import { MES_KEY } from '../keys'
import { UI_APP_KEY, UI_BUILDER_KEY, type MmdaApplication, type UiBuilder } from '@mmda/vui'
import { defineComponent, h, inject } from 'vue'
import { useRouter } from 'vue-router'
import type { Module } from '@mmda/core'
import { useI18n } from 'vue-i18n'

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
  if (hh < 6) return 'home.dawn'
  if (hh < 12) return 'home.morning'
  if (hh < 14) return 'home.noon'
  if (hh < 18) return 'home.afternoon'
  return 'home.evening'
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
    const { t } = useI18n()
    const b = inject<UiBuilder>(UI_BUILDER_KEY)!
    const { factory } = b
    const app = (inject(MES_KEY) ?? inject(UI_APP_KEY)) as MmdaApplication
    const { modules, user, context } = app
    const router = useRouter()
    void app.getTodoCount()
    injectResponsiveCSS()

    return () => {
      if (!user?.username && !modules?.length)
        return h('div', { class: 'p-6' }, t('state.loading'))
      const total = leafCount(modules)
      if (user?.username && total === 0)
        return h('div', { class: 'p-6' }, t('home.noModules'))

      const groups = modules.flatMap((m: Module) => {
        if (m.moduleType === 'SYSTEM') {
          return (m.subModules ?? []).filter(
            (c) => c.moduleType === 'MODULE' && c.subModules?.length,
          )
        }
        return m.moduleType === 'MODULE' && m.subModules?.length ? [m] : []
      })

      const cardStyle = {
        background: 'var(--mmda-surface-card, var(--mmda-content-background))',
        border: '1px solid var(--mmda-content-border-color, var(--mmda-surface-border))',
        borderRadius: 'var(--mmda-border-radius-lg, 8px)',
      }
      const mutedText = { color: 'var(--mmda-text-muted-color, #6b7280)' }
      const normalText = { color: 'var(--mmda-text-color, #1f2937)' }

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
                        color: 'var(--mmda-text-color)',
                      },
                    },
                    t('view.scheduleWorkspace'),
                  ),
                  h('p', { style: { fontSize: '14px', ...mutedText, margin: 0 } }, [
                    `${t(greeting())}，`,
                    h(
                      'strong',
                      { style: { color: 'var(--mmda-text-color)', fontWeight: 600 } },
                      user?.username || t('home.unknownUser'),
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
                    h('div', { style: { fontSize: '12px', ...mutedText } }, t('home.moduleCount')),
                    h(
                      'div',
                      {
                        style: {
                          fontSize: '28px',
                          fontWeight: 700,
                          color: 'var(--mmda-primary-color, #3b82f6)',
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
                          m.moduleLabel?.includes(t('action.notice'))
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
                    h('div', { style: { fontSize: '12px', ...mutedText } }, t('home.todos')),
                    h(
                      'div',
                      {
                        style: {
                          fontSize: '28px',
                          fontWeight: 700,
                          color: 'var(--mmda-yellow-500, #f59e0b)',
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
                color: 'var(--mmda-text-color)',
              },
            },
            t('home.moduleNav'),
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
                  (s: Module) => s.moduleType === 'FEATURE' && s.allowOps !== 0,
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
                        color: 'var(--mmda-text-muted-color)',
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
                                    background: 'var(--mmda-primary-50)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  },
                                },
                                [
                                  factory.icon(sm.moduleIcon, {
                                    style: { color: 'var(--mmda-primary-color)' },
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
