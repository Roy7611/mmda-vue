import {
  assembleMenuItems,
  activeAncestorKeys,
  hasSystemModules,
  isLocalAppModuleUrl,
  type Module,
  type UiAppMenuItem,
} from "@mmda/core";
import {
  computed,
  defineComponent,
  h,
  inject,
  ref,
  watch,
  type PropType,
  type VNode,
} from "vue";
import { RouterLink, useRoute } from "vue-router";
import { translateMessage } from "../i18n/i18n";
import { UI_APP_KEY, UI_BUILDER_KEY } from "../app/keys";
import type { MmdaApplication } from "../app/app";
import { useCompactViewport } from "../composables/useCompactViewport";

export type AppMenuItem = UiAppMenuItem;

export {
  assembleMenuItems,
  activeAncestorKeys,
  hasSystemModules,
  isLocalAppModuleUrl,
};

function isActiveRoute(path: string, route?: string): boolean {
  return !!route && (path === route || path.startsWith(`${route}/`));
}

/**
 * vui 默认侧栏菜单：宽屏递归树；compact 一级轨 + factory.drawer。
 */
export const VueAppSideMenu = defineComponent({
  name: "VueAppSideMenu",
  inheritAttrs: false,
  props: {
    modules: {
      type: Array as PropType<Module[]>,
      default: (): Module[] => [],
    },
    items: {
      type: Array as PropType<UiAppMenuItem[]>,
      default: undefined,
    },
    compact: { type: Boolean, default: undefined },
    logo: {
      type: Function as PropType<() => unknown>,
      default: undefined,
    },
    footer: {
      type: Function as PropType<() => unknown>,
      default: undefined,
    },
    onSelectL1: {
      type: Function as PropType<(item: UiAppMenuItem) => void>,
      default: undefined,
    },
    onDrawerChange: {
      type: Function as PropType<(open: boolean) => void>,
      default: undefined,
    },
    onSelectLeaf: {
      type: Function as PropType<(item: UiAppMenuItem) => void>,
      default: undefined,
    },
  },
  emits: ["select-l1", "open-drawer", "close-drawer", "select-leaf"],
  setup(props, { emit, attrs }) {
    const app = inject(UI_APP_KEY, null as MmdaApplication | null);
    const builder = inject(UI_BUILDER_KEY, null);
    const route = useRoute();
    const expandedKeys = ref<Record<string, boolean>>({});
    const selectedL1 = ref("");
    const drawerOpen = ref(false);
    const mediaCompact = useCompactViewport();

    const compact = computed(() =>
      typeof props.compact === "boolean" ? props.compact : mediaCompact.value,
    );

    const menuModules = computed(() =>
      props.modules.length ? props.modules : (app?.modules ?? []),
    );
    const menuItems = computed(
      () => props.items ?? assembleMenuItems(menuModules.value),
    );
    const currentModuleCode = computed(
      () => (route.meta?.module as Module | undefined)?.moduleCode,
    );

    watch(
      () => [route.path, menuModules.value] as const,
      () => {
        const keys = activeAncestorKeys(menuModules.value, route.path);
        if (keys.length) {
          expandedKeys.value = {
            ...expandedKeys.value,
            ...Object.fromEntries(keys.map((key) => [key, true])),
          };
        }
        const fromRoute = keys.find((code) => !code.includes("."));
        selectedL1.value =
          fromRoute ??
          menuItems.value.find((item) => !item.moduleCode.includes("."))
            ?.moduleCode ??
          menuItems.value[0]?.moduleCode ??
          "";
      },
      { immediate: true, deep: true },
    );

    watch(compact, (isCompact) => {
      if (!isCompact) setDrawerOpen(false);
    });

    const setDrawerOpen = (open: boolean) => {
      if (drawerOpen.value === open) return;
      drawerOpen.value = open;
      props.onDrawerChange?.(open);
      emit(open ? "open-drawer" : "close-drawer");
    };

    const renderModuleLink = (
      url: string,
      linkProps: Record<string, unknown>,
      children: () => VNode[],
    ): VNode => {
      const local = isLocalAppModuleUrl(
        app?.state.localAppPrefixes ?? app?.name ?? "",
        url,
      );
      if (local) {
        return h(RouterLink, { ...linkProps, to: url }, children);
      }
      return h("a", { ...linkProps, href: url }, children());
    };

    const onLeaf = (item: UiAppMenuItem) => {
      props.onSelectLeaf?.(item);
      emit("select-leaf", item);
      setDrawerOpen(false);
    };

    const renderItem = (item: UiAppMenuItem): VNode => {
      const children = item.items ?? [];
      const active =
        item.moduleCode === currentModuleCode.value ||
        isActiveRoute(route.path, item.route);
      if (item.route && !children.length) {
        const createLink = item.allowCreate
          ? renderModuleLink(
              `${item.route}/Create`,
              {
                class: "mmda-side-menu__create",
                title: translateMessage("action.create"),
                "aria-label": translateMessage("action.createNamed", {
                  label: item.label,
                }),
                onClick: (e: MouseEvent) => {
                  e.stopPropagation();
                  onLeaf(item);
                },
              },
              () => [
                h("i", {
                  class: ["fas", "fa-plus"],
                  "aria-hidden": "true",
                }),
              ],
            )
          : null;
        return h(
          "div",
          {
            class: {
              "mmda-side-menu__row": true,
              "mmda-side-menu__row--active": active,
            },
            key: item.moduleCode,
          },
          [
            renderModuleLink(
              item.route,
              {
                role: "app-module-feature",
                class: {
                  "mmda-side-menu__link": true,
                  "mmda-side-menu__link--active": active,
                },
                id: item.moduleCode,
                onClick: () => onLeaf(item),
              },
              () => [
                item.icon
                  ? h("i", { class: [item.icon, "mmda-side-menu__icon"] })
                  : null,
                h("span", { class: "mmda-side-menu__label" }, item.label),
              ],
            ),
            createLink,
          ],
        );
      }

      const open = Boolean(expandedKeys.value[item.key]);
      return h(
        "div",
        {
          class: {
            "mmda-side-menu__panel": true,
            "mmda-side-menu__panel--open": open,
          },
          key: item.key,
        },
        [
          h(
            "button",
            {
              type: "button",
              role: "app-module",
              class: {
                "mmda-side-menu__group": true,
                "mmda-side-menu__link--active": active,
              },
              id: item.moduleCode,
              "aria-expanded": open,
              onClick: () => {
                expandedKeys.value = {
                  ...expandedKeys.value,
                  [item.key]: !open,
                };
              },
            },
            [
              item.icon
                ? h("i", { class: [item.icon, "mmda-side-menu__icon"] })
                : null,
              h("span", { class: "mmda-side-menu__label" }, item.label),
              h("span", {
                class: [
                  "fas",
                  open ? "fa-chevron-up" : "fa-chevron-down",
                  "mmda-side-menu__chevron",
                ],
                "aria-hidden": true,
              }),
            ],
          ),
          open
            ? h(
                "div",
                { class: "mmda-side-menu__children" },
                children.map(renderItem),
              )
            : null,
        ],
      );
    };

    const renderTree = (items: UiAppMenuItem[], className?: string) =>
      items.length
        ? h(
            "nav",
            { class: ["mmda-side-menu", className] },
            items.map(renderItem),
          )
        : null;

    const selectedL1Item = computed(
      () =>
        menuItems.value.find((item) => item.moduleCode === selectedL1.value) ??
        menuItems.value[0],
    );

    const openL1 = (item: UiAppMenuItem) => {
      selectedL1.value = item.moduleCode;
      props.onSelectL1?.(item);
      emit("select-l1", item);
      if (item.items?.length) {
        setDrawerOpen(true);
      } else if (item.route) {
        onLeaf(item);
      }
    };

    const renderRail = (items: UiAppMenuItem[]) =>
      h(
        "nav",
        {
          class: "mmda-app-side-menu__rail",
          role: "tablist",
          "aria-label": "系统",
        },
        items.map((item) =>
          h(
            "button",
            {
              type: "button",
              role: "tab",
              class: {
                "mmda-app-side-menu__rail-item": true,
                "mmda-app-side-menu__rail-item--active":
                  item.moduleCode === selectedL1Item.value?.moduleCode,
              },
              id: item.moduleCode,
              title: item.label,
              "aria-selected":
                item.moduleCode === selectedL1Item.value?.moduleCode,
              onClick: () => openL1(item),
            },
            [
              item.icon
                ? h("i", {
                    class: [item.icon, "mmda-app-side-menu__rail-icon"],
                    "aria-hidden": true,
                  })
                : h(
                    "span",
                    { class: "mmda-app-side-menu__rail-code" },
                    item.moduleCode,
                  ),
              h("span", { class: "mmda-app-side-menu__rail-label" }, item.label),
            ],
          ),
        ),
      );

    const renderDrawer = () => {
      const selected = selectedL1Item.value;
      const body = () =>
        h("div", { class: "mmda-app-side-menu__drawer-body" }, [
          selected
            ? h(
                "div",
                { class: "mmda-app-side-menu__drawer-title" },
                selected.label,
              )
            : null,
          renderTree(selected?.items ?? []),
          props.footer ? (props.footer() as VNode) : null,
        ]);
      const drawerFn = builder?.factory?.drawer;
      if (typeof drawerFn === "function") {
        return drawerFn(
          {
            isOpen: drawerOpen.value,
            position: "Left",
            showBackdrop: true,
            width: 280,
            class: "mmda-app-side-menu__drawer",
            onChange: (open: boolean) => setDrawerOpen(open),
          },
          { default: body },
        );
      }
      return drawerOpen.value
        ? h("div", { class: "mmda-app-side-menu__drawer-fallback" }, body())
        : null;
    };

    return () => {
      const items = menuItems.value;
      if (compact.value) {
        return h(
          "div",
          {
            class: [
              "mmda-app-side-menu",
              "mmda-app-side-menu--compact",
              attrs.class,
            ],
          },
          [
            props.logo
              ? h("div", { class: "mmda-app-side-menu__brand" }, [
                  props.logo() as VNode,
                ])
              : null,
            renderRail(items),
            renderDrawer(),
          ],
        );
      }
      return items.length
        ? renderTree(items, attrs.class as string | undefined)
        : null;
    };
  },
});

/** @deprecated 使用 VueAppSideMenu */
export const AppSideMenu = VueAppSideMenu;
