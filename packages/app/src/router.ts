import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from 'vue-router'
import type { MmdaApplication } from '@mmda/vui'
import { appPluginRegistry } from './registry'
import { EntityView } from './views/EntityView'
import { FileView, NoAuthorityView, OfficeOnlineView } from './views/CommonViews'
import { SigninView } from './views/SigninView'
import { SignoutView } from './views/SignoutView'

function pluginRoutes(): RouteRecordRaw[] {
  return appPluginRegistry.all().flatMap(plugin => {
    const prefix = plugin.routePrefix
    const meta = { service: plugin.service, plugin: plugin.name }
    const placeholders = plugin.placeholders ?? []
    const records: RouteRecordRaw[] = [
      { path: prefix, redirect: `${prefix}/` },
      {
        path: `${prefix}/`,
        name: `${plugin.name}-home`,
        component: plugin.home,
        meta,
      },
      {
        path: `${prefix}/Signin`,
        redirect: to => ({ path: '/Signin', query: to.query }),
      },
      {
        path: `${prefix}/Signout`,
        redirect: to => ({ path: '/Signout', query: to.query }),
      },
      {
        path: `${prefix}/NoAuthority`,
        name: `${plugin.name}-no-authority`,
        component: NoAuthorityView,
        meta,
      },
      {
        path: `${prefix}/OfficeOnline`,
        name: `${plugin.name}-office-online`,
        component: OfficeOnlineView,
        meta: { ...meta, allowAnonymous: true },
      },
      {
        path: `${prefix}/FileView`,
        name: `${plugin.name}-file-view`,
        component: FileView,
        meta: { ...meta, allowAnonymous: true },
      },
    ]
    if (placeholders.length && plugin.placeholderView) {
      records.push({
        path: `${prefix}/:repository(${placeholders.join('|')})`,
        component: plugin.placeholderView,
        meta: { ...meta, placeholder: true },
      })
    }
    records.push(
      {
        path: `${prefix}/:repository/Create`,
        component: EntityView,
        meta,
      },
      {
        path: `${prefix}/:repository/Edit/:id`,
        component: EntityView,
        meta,
      },
      {
        path: `${prefix}/:repository/:id`,
        component: EntityView,
        meta,
      },
      { path: `${prefix}/:repository`, component: EntityView, meta },
      ...(plugin.routes ?? []),
    )
    return records
  })
}

function repositoryModule(app: MmdaApplication, to: RouteLocationNormalized) {
  const repository = String(to.params.repository ?? '')
  return (
    app.findModule(to.path) ??
    app.findModule(
      `${appPluginRegistry.resolve(to.path)?.routePrefix}/${repository}`,
    ) ??
    app.findModule(repository)
  )
}

export function createAppRouter(app: MmdaApplication) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', redirect: '/BASE/' },
      {
        path: '/Signin',
        name: 'signin',
        component: SigninView,
        meta: { allowAnonymous: true },
        beforeEnter: to => {
          if (app.canAccess) return String(to.query.redirect ?? '/BASE/')
        },
      },
      {
        path: '/Signout',
        name: 'signout',
        component: SignoutView,
        meta: { allowAnonymous: true },
      },
      ...pluginRoutes(),
    ],
  })

  router.beforeEach(to => {
    if (to.meta.allowAnonymous) return true
    if (!app.canAccess) {
      return {
        path: '/Signin',
        query: { redirect: to.fullPath },
      }
    }
    const repository = String(to.params.repository ?? '')
    if (repository && !to.meta.placeholder) {
      const module = repositoryModule(app, to)
      if (module?.authority && !module.authority.allowRead) {
        const prefix =
          appPluginRegistry.resolve(to.path)?.routePrefix ?? '/BASE'
        return `${prefix}/NoAuthority`
      }
    }
    return true
  })
  return router
}
