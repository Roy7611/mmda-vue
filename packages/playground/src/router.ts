import { createRouter, createWebHistory } from "vue-router";
import { DEMO_PREFIX } from "./catalog";
import { EntityView } from "./views/EntityView";
import { HomeView } from "./views/HomeView";
import { SigninView } from "./views/SigninView";

export function createPlaygroundRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/", redirect: `${DEMO_PREFIX}/` },
      {
        path: "/Signin",
        name: "signin",
        component: SigninView,
        meta: { allowAnonymous: true },
      },
      { path: DEMO_PREFIX, redirect: `${DEMO_PREFIX}/` },
      {
        path: `${DEMO_PREFIX}/`,
        name: "demo-home",
        component: HomeView,
      },
      {
        path: `${DEMO_PREFIX}/:repository`,
        component: EntityView,
        children: [
          { path: "", component: EntityView.Index },
          { path: "Create", component: EntityView.One },
          { path: "Edit/:id", component: EntityView.One },
          { path: ":id", component: EntityView.One },
        ],
      },
    ],
  });
}
