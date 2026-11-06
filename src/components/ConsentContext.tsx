import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadConsent, makeConsent, saveConsent, loadAnalytics, loadChatProvider, type ConsentChoice, type ConsentState } from '../lib/consent';

interface Ctx {
  consent: ConsentState | null;
  ready: boolean;
  bannerOpen: boolean;
  dialogOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (c: ConsentChoice) => void;
  openDialog: () => void;
  closeDialog: () => void;
}

const ConsentCtx = createContext<Ctx | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setConsent(loadConsent());
    setReady(true);
  }, []);

  // Optional scripts only after a stored choice allows them.
  useEffect(() => {
    if (!consent) return;
    loadAnalytics(consent);
    loadChatProvider(consent, import.meta.env.VITE_CHAT_PROVIDER);
  }, [consent]);

  const commit = useCallback((c: ConsentChoice) => {
    const next = makeConsent(c);
    saveConsent(next);
    setConsent(next);
    setDialogOpen(false);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      consent,
      ready,
      bannerOpen: ready && !consent && !dialogOpen,
      dialogOpen,
      acceptAll: () => commit({ preferences: true, analytics: true }),
      rejectAll: () => commit({ preferences: false, analytics: false }),
      save: commit,
      openDialog: () => setDialogOpen(true),
      closeDialog: () => setDialogOpen(false),
    }),
    [consent, ready, dialogOpen, commit],
  );

  return <ConsentCtx.Provider value={value}>{children}</ConsentCtx.Provider>;
}

export function useConsent(): Ctx {
  const c = useContext(ConsentCtx);
  if (!c) throw new Error('useConsent outside ConsentProvider');
  return c;
}
