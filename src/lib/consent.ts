import { consentConfig } from '../content';
import { readJSON, writeJSON } from './storage';

export interface ConsentState {
  version: string;
  timestamp: string;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
}

export type ConsentChoice = Pick<ConsentState, 'preferences' | 'analytics'>;

export function makeConsent(choice: ConsentChoice, now: Date = new Date(), version: string = consentConfig.version): ConsentState {
  return { version, timestamp: now.toISOString(), necessary: true, preferences: !!choice.preferences, analytics: !!choice.analytics };
}

/** Returns the stored consent only if it is valid and the policy version matches. */
export function parseConsent(raw: unknown, version: string = consentConfig.version): ConsentState | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<ConsentState>;
  if (r.version !== version) return null;
  if (typeof r.timestamp !== 'string' || Number.isNaN(Date.parse(r.timestamp))) return null;
  if (typeof r.preferences !== 'boolean' || typeof r.analytics !== 'boolean') return null;
  return { version, timestamp: r.timestamp, necessary: true, preferences: r.preferences, analytics: r.analytics };
}

export const loadConsent = (): ConsentState | null => parseConsent(readJSON<unknown>(consentConfig.storageKey, null));
export const saveConsent = (c: ConsentState) => writeJSON(consentConfig.storageKey, c);

export const allows = (c: ConsentState | null, cat: 'preferences' | 'analytics'): boolean => !!c && c[cat] === true;

/* Optional loaders: nothing runs unless the matching category is allowed. */
let analyticsLoaded = false;
let chatLoaded = false;

/** Stub: wire a real analytics script here. Runs only with Analytics consent. */
export function loadAnalytics(c: ConsentState | null): boolean {
  if (!allows(c, 'analytics') || analyticsLoaded) return false;
  analyticsLoaded = true;
  // Intentionally empty: no analytics provider is configured.
  document.documentElement.dataset.analytics = 'allowed';
  return true;
}

/** Stub: loads an optional chat provider only with Preferences consent and a configured provider. */
export function loadChatProvider(c: ConsentState | null, provider: string | undefined): boolean {
  if (!allows(c, 'preferences') || chatLoaded) return false;
  if (!provider || provider === 'none') return false;
  chatLoaded = true;
  // Intentionally empty: inject the provider script here when one is chosen.
  return true;
}

export const __resetLoaders = () => {
  analyticsLoaded = false;
  chatLoaded = false;
};
