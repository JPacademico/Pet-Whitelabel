/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_USERNAME: string;
  readonly VITE_DEMO_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
