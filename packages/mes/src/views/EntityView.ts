import { createEntityView } from "@mmda/vui";
import { createRepositoryLogic } from "../logic/registry";

export const EntityView = createEntityView({
  createLogic: createRepositoryLogic,
});
