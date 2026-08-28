import { createRouter, createWebHistory, type Router } from 'vue-router'
import type { MmdaApplication } from '@mmda/vui'
import { APP_NAME } from './keys'
import { HomeView } from './views/HomeView'
import { SigninView } from './views/SigninView'
import {
  Custompages,
  NoAuthorityView,
  OfficeOnlineView,
} from './views/PlaceholderViews'
import { EntityView } from './views/EntityView'

const PLACEHOLDERS = new Set(['DailyRecords', 'MaterialCats', 'PartnerCats'])

export function createBaseRouter(app: MmdaApplication): Router {
  const prefix = `/${APP_NAME}`
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', redirect: `${prefix}/` },
      { path: prefix, redirect: `${prefix}/` },
      { path: `${prefix}/`, name: 'Home', component: HomeView },
      {
        path: `${prefix}/Signin`,
        name: 'Signin',
        component: SigninView,
        meta: { allowAnonymous: true },
      },
      {
        path: `${prefix}/NoAuthority`,
        name: 'NoAuthority',
        component: NoAuthorityView,
      },
      {
        path: `${prefix}/OfficeOnline`,
        name: 'OfficeOnline',
        component: OfficeOnlineView,
        meta: { allowAnonymous: true },
      },
      {
        path: `${prefix}/:repository(DailyRecords|MaterialCats|PartnerCats)`,
        component: Custompages,
      },
      { path: `${prefix}/:repository/Create`, component: EntityView },
      { path: `${prefix}/:repository/Edit/:id`, component: EntityView },
      { path: `${prefix}/:repository/:id`, component: EntityView },
      { path: `${prefix}/:repository`, component: EntityView },
    ],
  })

  router.beforeEach((to) => {
    if (to.meta.allowAnonymous) return true
    if (!app.canAccess) {
      return {
        path: `${prefix}/Signin`,
        query: { redirect: to.fullPath },
      }
    }
    const repository = to.params.repository
    if (typeof repository === 'string' && !PLACEHOLDERS.has(repository)) {
      const module =
        app.findModule(to.path) ??
        app.findModule(`${prefix}/${repository}`) ??
        app.findModule(repository)
      if (module?.authority && !module.authority.allowRead) {
        return { path: `${prefix}/NoAuthority` }
      }
    }
    return true
  })

  return router
}
