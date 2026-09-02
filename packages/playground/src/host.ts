import type { MetaUiPack, MetaUiService, Module } from "@mmda/core";
import type { MmdaApplication, UiLogic, UiLogicInit } from "@mmda/vui";
import {
  playgroundModuleFactory,
  playgroundModules,
  playgroundPacks,
} from "./catalog";
import { CatalogLogic, CategoryLogic, ProductLogic } from "./logics";

export const PLAYGROUND_SERVICE = "demo";

const logicCtors: Record<string, new (init: UiLogicInit) => UiLogic<any>> = {
  Products: ProductLogic,
  Catalog: CatalogLogic,
  Categories: CategoryLogic,
};

export function installPlaygroundMeta(app: MmdaApplication) {
  const meta = app.meta as MetaUiService;
  meta.getModules = async () => playgroundModuleFactory.modules;
  meta.findModule = (nameOrUrl: string) =>
    nameOrUrl.includes("/")
      ? playgroundModuleFactory.findModuleByUrl(nameOrUrl)
      : playgroundModuleFactory.findModuleByName(nameOrUrl);
  meta.getPack = async (params) => {
    const repository = params?.repository ?? "";
    const pack = playgroundPacks[repository];
    if (!pack) {
      throw new Error(`Playground repository missing: ${repository}`);
    }
    return pack as MetaUiPack;
  };
  meta.getSystems = async () => [];
  meta.getTodoCount = async () => 0;
}

export function installGuestSession(
  app: MmdaApplication,
  username = "playground",
) {
  app.context.user = {
    username,
    userId: "demo",
    userType: 0,
    expiryOn: Date.now() + 365 * 24 * 60 * 60 * 1000,
  };
  app.context.authenticated = true;
  app.context.modules = playgroundModules as Module[];
  app.context.localAppPrefixes = [PLAYGROUND_SERVICE];
}

export function registerPlaygroundLogic(app: MmdaApplication, router: unknown) {
  for (const [repository, Ctor] of Object.entries(logicCtors)) {
    const token = `${PLAYGROUND_SERVICE}:${repository}Logic`;
    app.di.provide(token, async () => {
      const module =
        app.findModule(`/DEMO/${repository}`) ?? app.findModule(repository);
      return new Ctor({
        metaUiService: app.meta,
        repository,
        router,
        module,
        apiService: PLAYGROUND_SERVICE,
      }) as UiLogic<any>;
    });
  }
}

export function createPlaygroundLogic(repository: string, init: UiLogicInit) {
  const Ctor = logicCtors[repository];
  return Ctor ? new Ctor(init) : undefined;
}
