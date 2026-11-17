/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TAIPEI_BUILDINGS_I3S_URL?: string
  readonly VITE_TAIPEI_CONTEXT_I3S_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
