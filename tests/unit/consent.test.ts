import { beforeEach, describe, expect, it } from 'vitest';
import { consentConfig } from '../../src/content';
import { allows, loadAnalytics, loadChatProvider, loadConsent, makeConsent, parseConsent, saveConsent, __resetLoaders } from '../../src/lib/consent';

describe('cookie consent', () => {
  beforeEach(() => {
    localStorage.clear();
    __resetLoaders();
  });

  it('stores a versioned object with a timestamp', () => {
    const c = makeConsent({ preferences: true, analytics: false }, new Date('2026-11-01T10:00:00Z'));
    expect(c).toEqual({ version: consentConfig.version, timestamp: '2026-11-01T10:00:00.000Z', necessary: true, preferences: true, analytics: false });
    saveConsent(c);
    expect(loadConsent()).toEqual(c);
  });

  it('asks again when the policy version changes', () => {
    saveConsent(makeConsent({ preferences: true, analytics: true }, new Date(), 'old-version'));
    expect(loadConsent()).toBeNull();
  });

  it('rejects malformed stored values', () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent('yes')).toBeNull();
    expect(parseConsent({ version: consentConfig.version, timestamp: 'nope', preferences: true, analytics: true })).toBeNull();
    expect(parseConsent({ version: consentConfig.version, timestamp: new Date().toISOString(), preferences: 'yes', analytics: true })).toBeNull();
    localStorage.setItem(consentConfig.storageKey, '{not json');
    expect(loadConsent()).toBeNull();
  });

  it('does not load optional scripts without consent', () => {
    expect(allows(null, 'analytics')).toBe(false);
    expect(loadAnalytics(null)).toBe(false);
    const rejected = makeConsent({ preferences: false, analytics: false });
    expect(loadAnalytics(rejected)).toBe(false);
    expect(loadChatProvider(rejected, 'someprovider')).toBe(false);
  });

  it('loads analytics once when allowed', () => {
    const accepted = makeConsent({ preferences: true, analytics: true });
    expect(loadAnalytics(accepted)).toBe(true);
    expect(loadAnalytics(accepted)).toBe(false);
  });

  it('never loads a chat provider when the provider is none', () => {
    const accepted = makeConsent({ preferences: true, analytics: true });
    expect(loadChatProvider(accepted, 'none')).toBe(false);
    expect(loadChatProvider(accepted, undefined)).toBe(false);
  });

  it('necessary is always locked on', () => {
    const necessary = consentConfig.categories.find((c) => c.id === 'necessary');
    expect(necessary?.locked).toBe(true);
    expect(consentConfig.categories.filter((c) => c.locked)).toHaveLength(1);
  });
});
