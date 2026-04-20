/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_INSTAGRAM?: string;
  readonly VITE_TAX_AMOUNT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
