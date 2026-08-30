/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SKIN?: string
  readonly VITE_SYNCFUSION_LICENSE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
