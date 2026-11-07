/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_DASHBOARD_URL?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  /** e2e only: local reCAPTCHA stand-in. Leave unset in production. */
  readonly VITE_RECAPTCHA_SCRIPT_URL?: string;
  readonly VITE_CHAT_PROVIDER?: string;
  readonly VITE_STRIPE_LINK_STARTER?: string;
  readonly VITE_STRIPE_LINK_GROWTH?: string;
}

declare module '*.md' {
  export const meta: import('./lib/blog').PostMeta;
  export const html: string;
  export const headings: { id: string; text: string; level: number }[];
}

declare const __BUILD_DATE__: string;

interface Window {
  grecaptcha?: {
    render: (el: HTMLElement, opts: Record<string, unknown>) => number;
    reset: (id?: number) => void;
    getResponse: (id?: number) => string;
  };
  __lvRecaptchaReady?: () => void;
}
