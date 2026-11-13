import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { chatbot as C, dashboardUrl } from '../content';
import { answer, type Action } from '../lib/chatMatcher';
import { readJSON, writeJSON } from '../lib/storage';
import { useFocusTrap } from '../hooks/a11y';
import { Icon } from './Icons';
import { LogoMark } from './Logo';

interface Msg { id: number; from: 'bot' | 'user'; text: string; action?: Action; fallback?: boolean; q?: string }

const greeting: Msg = { id: 0, from: 'bot', text: C.greeting };

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    const saved = readJSON<Msg[]>(C.storageKey, [], 'session');
    return Array.isArray(saved) && saved.length ? saved : [greeting];
  });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const titleId = useId();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const close = useCallback(() => setOpen(false), []);
  useFocusTrap(panelRef, open, close, inputRef, fabRef);

  // keep the conversation for this browser session only
  useEffect(() => writeJSON(C.storageKey, msgs.slice(-40), 'session'), [msgs]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing, open]);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const ask = (q: string) => {
    const text = q.trim().slice(0, 300);
    if (!text || typing) return;
    setMsgs((m) => [...m, { id: Date.now(), from: 'user', text }]);
    setInput('');
    setTyping(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const a = answer(text);
      setTyping(false);
      setMsgs((m) => [
        ...m,
        a.matched
          ? { id: Date.now() + 1, from: 'bot', text: a.text, action: a.action }
          : { id: Date.now() + 1, from: 'bot', text: C.fallback, fallback: true, q: text },
      ]);
    }, 650);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const toContact = (q?: string) => {
    const params = new URLSearchParams({ subject: 'assistant' });
    if (q) params.set('q', q);
    setOpen(false);
    navigate(`/?${params.toString()}#contact`);
  };

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className={`chat-fab${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={() => setOpen((o) => !o)}
        data-testid="chat-fab"
      >
        <Icon name={open ? 'close' : 'chat'} size={24} />
        <span className="sr-only">{open ? 'Close the assistant' : 'Open the Luvreno assistant'}</span>
      </button>

      <div
        ref={panelRef}
        id="chat-panel"
        className="chat-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        hidden={!open}
        data-testid="chat-panel"
      >
        <div className="chat-head">
          <LogoMark size={34} />
          <div>
            <p id={titleId} className="chat-title">{C.title}</p>
            <p className="chat-label mono">{C.label}</p>
          </div>
          <button type="button" className="icon-btn chat-close" onClick={close} aria-label="Close the assistant">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div ref={logRef} className="chat-log" role="log" aria-live="polite" aria-relevant="additions" data-testid="chat-log">
          {msgs.map((m) => (
            <div key={m.id} className={`chat-msg chat-${m.from}`}>
              <p>{m.text}</p>
              {m.from === 'bot' && m.fallback && (
                <button type="button" className="btn btn-primary chat-action" onClick={() => toContact(m.q)}>{C.contactButton}</button>
              )}
              {m.from === 'bot' && m.action === 'dashboard' && (
                <a className="btn btn-secondary chat-action" href={dashboardUrl} target="_blank" rel="noopener noreferrer">Open Dashboard<span className="sr-only"> (opens in a new tab)</span></a>
              )}
              {m.from === 'bot' && m.action === 'pricing' && (
                <Link className="btn btn-secondary chat-action" to="/#pricing" onClick={close}>See pricing</Link>
              )}
              {m.from === 'bot' && m.action === 'contact' && !m.fallback && (
                <button type="button" className="btn btn-secondary chat-action" onClick={() => toContact()}>Go to the contact form</button>
              )}
            </div>
          ))}
          {typing && (
            <div className="chat-msg chat-bot chat-typing" data-testid="chat-typing">
              <span className="dot" /><span className="dot" /><span className="dot" />
              <span className="sr-only">The assistant is typing</span>
            </div>
          )}
        </div>

        <div className="chat-chips" role="group" aria-label="Suggested questions">
          {C.chips.map((c) => (
            <button key={c} type="button" className="chip chat-chip" onClick={() => ask(c)} disabled={typing}>{c}</button>
          ))}
        </div>

        <form className="chat-form" onSubmit={submit}>
          <label htmlFor="chat-input" className="sr-only">Type your question</label>
          <input ref={inputRef} id="chat-input" type="text" value={input} maxLength={300} placeholder="Type your question" autoComplete="off" onChange={(e) => setInput(e.target.value)} data-testid="chat-input" />
          <button type="submit" className="icon-btn chat-send" aria-label="Send" disabled={!input.trim() || typing}>
            <Icon name="send" size={20} />
          </button>
        </form>
      </div>
    </>
  );
}
