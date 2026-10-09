import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, Pin, Search, Send } from 'lucide-react';
import { AvatarStack, PersonAvatar, SocietyAvatar } from '../components/Avatar';
import { chatThreads, mockReplies, type ChatMessage, type ChatThread } from '../data/mock';
import { people } from '../data/demo';
import { ME } from '../data/types';
import { eventById, societyById } from '../lib/feed';
import { whenShort } from '../lib/format';
import { useVybe } from '../state/store';

type Filter = 'all' | 'event' | 'direct';

function ThreadAvatar({ t, size = 46 }: { t: ChatThread; size?: number }) {
  if (t.kind === 'direct') return <PersonAvatar id={t.ref} size={size} />;
  const soc = societyById(t.kind === 'society' ? t.ref : (eventById(t.ref)?.societyId ?? ''));
  return soc ? <SocietyAvatar society={soc} size={size} /> : null;
}

const firstName = (id: string) => (id === ME ? 'You' : (people[id]?.name.split(' ')[0] ?? 'Someone'));

export function ChatsPage({ active }: { active: boolean }) {
  const { actions } = useVybe();
  const [threads, setThreads] = useState<ChatThread[]>(chatThreads);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const open = threads.find((t) => t.id === openId) ?? null;
  const count = open?.messages.length ?? 0;

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [openId, count, typing]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads
      .filter((t) => (filter === 'all' ? true : filter === 'event' ? t.kind !== 'direct' : t.kind === 'direct'))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.messages.some((x) => x.text.toLowerCase().includes(q)));
  }, [threads, filter, query]);

  const unreadTotal = threads.reduce((n, t) => n + t.unread, 0);

  const append = (id: string, msg: ChatMessage) =>
    setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, messages: [...t.messages, msg] } : t)));

  const openThread = (id: string) => {
    setOpenId(id);
    setDraft('');
    setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  };

  const send = () => {
    const text = draft.trim();
    if (!open || !text) return;
    const id = open.id;
    const stamp = `${Date.now()}`;
    append(id, { id: `me-${stamp}`, from: ME, text, time: 'Now' });
    setDraft('');
    // Mock reply so the conversation feels alive in the demo.
    const who = open.members[open.messages.length % open.members.length];
    const reply = mockReplies[(open.messages.length + text.length) % mockReplies.length];
    timers.current.push(window.setTimeout(() => setTyping(id), 500));
    timers.current.push(
      window.setTimeout(() => {
        setTyping(null);
        append(id, { id: `r-${stamp}`, from: who, text: reply, time: 'Now' });
      }, 1700),
    );
  };

  const ev = open?.kind === 'event' ? eventById(open.ref) : undefined;

  return (
    <div className="v-page v-page--chats" hidden={!active}>
      {!open && (
        <div className="v-scroll">
          <div className="v-column v-pagepad">
            <header className="v-pagehead">
              <h1>Chats</h1>
              <span className="v-chip">{unreadTotal > 0 ? `${unreadTotal} unread` : 'All caught up'}</span>
            </header>
            <label className="v-field">
              <Search size={16} aria-hidden="true" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats" aria-label="Search chats" />
            </label>
            <div className="v-segs" role="tablist" aria-label="Chat type">
              {(['all', 'event', 'direct'] as Filter[]).map((f) => (
                <button key={f} role="tab" aria-selected={filter === f} className={`v-seg ${filter === f ? 'is-on' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : f === 'event' ? 'Events & societies' : 'Direct'}
                </button>
              ))}
            </div>
            <ul className="v-chatlist">
              {list.map((t) => {
                const last = t.messages[t.messages.length - 1];
                return (
                  <li key={t.id}>
                    <button className="v-chatrow" onClick={() => openThread(t.id)}>
                      <ThreadAvatar t={t} />
                      <span className="v-chatrow__body">
                        <span className="v-chatrow__top">
                          <strong>{t.title}</strong>
                          {t.pinned && <Pin size={12} aria-label="Pinned" />}
                          <time>{last?.time}</time>
                        </span>
                        <span className="v-chatrow__last">
                          <span>{last ? `${t.kind === 'direct' && last.from !== ME ? '' : `${firstName(last.from)}: `}${last.text}` : 'No messages yet'}</span>
                          {t.unread > 0 && <b className="v-badge">{t.unread}</b>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
              {list.length === 0 && <li className="v-empty">No chats match “{query}”.</li>}
            </ul>
            <p className="v-footnote">Vybe prototype · conversations are demo data</p>
          </div>
        </div>
      )}

      {open && (
        <div className="v-thread">
          <header className="v-thread__head">
            <button className="v-iconbtn" aria-label="Back to chats" onClick={() => setOpenId(null)}>
              <ArrowLeft size={20} />
            </button>
            <ThreadAvatar t={open} size={36} />
            <div className="v-thread__title">
              <strong>{open.title}</strong>
              <span>{open.kind === 'direct' ? (people[open.ref]?.course ?? '') : `${open.members.length + 1} members`}</span>
            </div>
            {open.kind !== 'direct' && <AvatarStack ids={open.members} size={24} />}
          </header>
          <div className="v-thread__scroll">
            <div className="v-column v-thread__msgs">
              {ev && (
                <button className="v-thread__event" onClick={() => actions.open({ kind: 'event', id: ev.id })}>
                  <CalendarDays size={16} aria-hidden="true" />
                  <span>
                    <strong>{whenShort(ev)}</strong> · {ev.venue}
                  </span>
                  <em>View event</em>
                </button>
              )}
              {open.messages.map((msg, i) => {
                const mine = msg.from === ME;
                const prev = open.messages[i - 1];
                const showName = !mine && open.kind !== 'direct' && prev?.from !== msg.from;
                return (
                  <div key={msg.id} className={`v-msg ${mine ? 'is-mine' : ''}`}>
                    {!mine && <span className="v-msg__av">{prev?.from !== msg.from && <PersonAvatar id={msg.from} size={28} />}</span>}
                    <div className="v-msg__col">
                      {showName && <span className="v-msg__name">{firstName(msg.from)}</span>}
                      <p className="v-bubble">{msg.text}</p>
                      <time>{msg.time}</time>
                    </div>
                  </div>
                );
              })}
              {typing === open.id && <p className="v-typing">typing…</p>}
              <div ref={end} />
            </div>
          </div>
          <form
            className="v-composer"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${open.title}`} aria-label="Message" />
            <button className="v-composer__send" type="submit" disabled={!draft.trim()} aria-label="Send">
              <Send size={17} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
