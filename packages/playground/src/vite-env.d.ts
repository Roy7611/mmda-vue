/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AG_GRID_LICENSE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
