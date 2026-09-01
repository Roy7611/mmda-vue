import { createEntityView } from '@mmda/vui'
import { appPluginRegistry } from '../registry'

/** One CRUD route component for every registered backend service. */
export const EntityView = createEntityView({
  resolveService: path => appPluginRegistry.service(path),
  resolveLogicToken: (repository, service) =>
    `${service}:${repository}Logic`,
  resolveModule: (app, repository, path) =>
    app.findModule(path) ?? app.findModule(repository),
  resolveCustomView: (repository, service) =>
    appPluginRegistry.get(service)?.resolveCustomView?.(repository),
  // Registered plugin logic is resolved from the host DI before this fallback.
  createLogic: () => undefined,
})
