import { createEntityView } from "@mmda/vui";
import { createPlaygroundLogic, PLAYGROUND_SERVICE } from "../host";
import { CategoryTreeView } from "./CategoryTreeView";

export const EntityView = createEntityView({
  resolveService: () => PLAYGROUND_SERVICE,
  resolveLogicToken: (repository, service) => `${service}:${repository}Logic`,
  resolveModule: (app, repository, path) =>
    app.findModule(path) ?? app.findModule(repository),
  resolveCustomView: (repository) =>
    repository === "Categories" ? CategoryTreeView : undefined,
  createLogic: (repository, init) => createPlaygroundLogic(repository, init),
});
