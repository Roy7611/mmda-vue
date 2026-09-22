/*
 * 模块首页（业务基础模块的页面级视图）。
 *
 * **框架无关**：只吃 core 的 `UiViewDeps`（`app` / `render` / `router`），
 * 不 import vue / vue-i18n / vue-router。宿主负责把返回值放进自己的响应式渲染函数里跑，
 * 所以 `app.state.todoCount` 变了照样重渲，业务侧一行响应式代码都不用写。
 *
 * 页面里的跳转一律用 `factory.link` + `router.resolve`（真实 `<a href>`），
 * 不自己订阅点击、也不 import 路由库。
 */
import type { Module, UiViewDeps } from '@mmda/core'

let styleInjected = false
function injectResponsiveCSS(): void {
  if (styleInjected || typeof document === 'undefined') return
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

function leafCount(modules: Module[]): number {
  let n = 0
  for (const m of modules) {
    if (m.moduleType === 'FEATURE') n++
    if (m.subModules?.length) n += leafCount(m.subModules)
  }
  return n
}

function greetingKey(): string {
  const hh = new Date().getHours()
  if (hh < 6) return 'home.dawn'
  if (hh < 12) return 'home.morning'
  if (hh < 14) return 'home.noon'
  if (hh < 18) return 'home.afternoon'
  return 'home.evening'
}

export function homeView<TNode>(deps: UiViewDeps<TNode>): TNode {
  const { app, render, router } = deps
  const t = (key: string): string => app.translate(key)
  const { modules, user } = app
  const { factory } = app.ui

  // 待办数由壳层 AppUserFooter 拉取；此处只读 app.state.todoCount
  injectResponsiveCSS()

  if (!user?.username && !modules?.length)
    return render('div', { class: 'p-6' }, [t('state.loading')])

  const total = leafCount(modules)
  if (user?.username && total === 0)
    return render('div', { class: 'p-6' }, [t('home.noModules')])

  const groups = modules.flatMap((m: Module) => {
    if (m.moduleType === 'SYSTEM') {
      return (m.subModules ?? []).filter(
        (c) => c.moduleType === 'MODULE' && c.subModules?.length,
      )
    }
    return m.moduleType === 'MODULE' && m.subModules?.length ? [m] : []
  })

  /** 找通知模块：点“待办”卡片时跳它。 */
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
  const notifyUrl = findNotify(modules)?.moduleUrl

  const cardStyle = {
    background: 'var(--mmda-surface-card, var(--mmda-surface-group))',
    border: '1px solid var(--mmda-content-border-color)',
    borderRadius: 'var(--mmda-border-radius-lg, 8px)',
  }
  const mutedText = { color: 'var(--mmda-text-muted-color, #6b7280)' }
  const normalText = { color: 'var(--mmda-text-color, #1f2937)' }

  const statCard = (
    label: string,
    value: string,
    color: string,
    href?: string,
  ): TNode => {
    const style = {
      ...cardStyle,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }
    const body: TNode[] = [
      render('div', {}, [
        render('div', { style: { fontSize: '12px', ...mutedText } }, [label]),
        render(
          'div',
          { style: { fontSize: '28px', fontWeight: 700, color, marginTop: '4px' } },
          [value],
        ),
      ]),
    ]
    // 有目标就用真实链接（可中键新开、可右键复制），没有就退化成静态卡片。
    return href
      ? factory.link({ class: 'home-stat-card', style, href }, { default: () => body })
      : render('div', { class: 'home-stat-card', style }, body)
  }

  const topPad = render(
    'div',
    { class: 'home-top-pad', style: { flexShrink: 0 } },
    [
      render(
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
          render('div', {}, [
            render(
              'h1',
              {
                style: {
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '0 0 4px 0',
                  color: 'var(--mmda-text-color)',
                },
              },
              [t('home.workbench')],
            ),
            render(
              'p',
              { style: { fontSize: '14px', ...mutedText, margin: 0 } },
              [
                `${t(greetingKey())}，`,
                render(
                  'strong',
                  { style: { color: 'var(--mmda-text-color)', fontWeight: 600 } },
                  [user?.username || t('home.unknownUser')],
                ),
              ],
            ),
          ]),
        ],
      ),
      render('div', { class: 'home-stat-grid' }, [
        statCard(
          t('home.moduleCount'),
          String(total),
          'var(--mmda-primary-color, #3b82f6)',
        ),
        statCard(
          t('home.todos'),
          String(app.state.todoCount ?? 0),
          'var(--mmda-warning-color, #f59e0b)',
          notifyUrl ? router.resolve(notifyUrl) : undefined,
        ),
      ]),
    ],
  )

  const sectionTitle = render(
    'h2',
    {
      style: {
        fontSize: '14px',
        fontWeight: 600,
        margin: '0 0 12px 24px',
        color: 'var(--mmda-text-color)',
      },
    },
    [t('home.moduleNav')],
  )

  const featureCard = (sm: Module): TNode => {
    const inner: TNode[] = []
    if (sm.moduleIcon) {
      inner.push(
        render(
          'div',
          {
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--mmda-primary-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            },
          },
          [
            factory.icon({
              iconClass: sm.moduleIcon,
              style: { color: 'var(--mmda-primary-color)' },
            }),
          ],
        ),
      )
    }
    inner.push(
      render('div', { style: { minWidth: 0, flex: 1 } }, [
        render(
          'div',
          { style: { fontSize: '13px', fontWeight: 600, ...normalText } },
          [sm.moduleLabel],
        ),
        sm.description
          ? render(
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
              [sm.description],
            )
          : null,
      ]),
    )
    const style = {
      ...cardStyle,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
    }
    return sm.moduleUrl
      ? factory.link(
          { class: 'home-card', style, href: router.resolve(sm.moduleUrl) },
          { default: () => inner },
        )
      : render('div', { class: 'home-card', style }, inner)
  }

  const scrollArea = render(
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
        return render('div', { style: { marginBottom: '20px' } }, [
          render(
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
            [g.moduleLabel],
          ),
          render(
            'div',
            { class: 'home-card-grid' },
            features.map((sm: Module) => featureCard(sm)),
          ),
        ])
      })
      .filter(Boolean) as TNode[],
  )

  return render(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      },
    },
    [topPad, sectionTitle, scrollArea],
  )
}
