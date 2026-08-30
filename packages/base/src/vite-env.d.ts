/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_API: string
  readonly VITE_OAUTH_CLIENT_ID?: string
  readonly VITE_OAUTH_CLIENT_SECRET?: string
  readonly VITE_SYNCFUSION_LICENSE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
