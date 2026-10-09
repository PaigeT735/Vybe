import { Check, ChevronRight, Plus } from 'lucide-react';
import { SocietyAvatar } from '../components/Avatar';
import { MediaImg, Photo } from '../components/Photo';
import { Sheet } from '../components/Sheet';
import { committeeOf, events, memberOf } from '../data/demo';
import { compact, parseLocal, statusOf, whenShort } from '../lib/format';
import { albumFor } from '../domain/memories';
import { hostedBy, societyById } from '../lib/feed';
import { useVybe } from '../state/store';
import { SocietyFeature } from '../home/SocietyFeature';

/** A society as a destination: identity, its featured event with the rest of its programme, past events and memories. */
export function SocietySheet({ id }: { id: string }) {
  const { state, actions, selectors } = useVybe();
  const s = societyById(id);
  if (!s) return null;
  const following = selectors.isFollowed(s.id);
  const role = committeeOf.includes(s.id) ? 'Committee' : memberOf.includes(s.id) ? 'Member' : following ? 'Following' : null;
  const byStart = (a: { start: string }, b: { start: string }) => +parseLocal(a.start) - +parseLocal(b.start);
  const upcoming = events.filter((e) => hostedBy(e, s.id) && statusOf(e) !== 'past').sort(byStart);
  const past = events.filter((e) => hostedBy(e, s.id) && statusOf(e) === 'past').sort((a, b) => byStart(b, a));
  const memories = past.flatMap((e) => albumFor(state.domain, e.id)).slice(0, 6);
  const [lead, ...rest] = upcoming;

  return (
    <Sheet title={s.name} size="full" className="v-socpage">
      <header className="v-socpage__head">
        <SocietyAvatar society={s} size={64} />
        <div className="v-socpage__id">
          <h2>{s.name}</h2>
          <p>
            <span className="v-num">{compact(s.members)}</span> members
            {role && <span className="v-socpage__role">{role}</span>}
          </p>
        </div>
      </header>
      <p className="v-socpage__desc">{s.description}</p>
      <div className="v-socpage__actions">
        <button
          className={`v-btn v-btn--sm ${following ? 'v-btn--glass' : 'v-btn--primary'}`}
          onClick={() => {
            actions.toggleFollow(s.id);
            actions.toast(following ? `Unfollowed ${s.short}` : `Following ${s.short}`);
          }}
        >
          {following ? <><Check size={15} /> Following</> : <><Plus size={15} /> Follow</>}
        </button>
        <button className="v-btn v-btn--sm v-btn--glass" onClick={actions.close}>
          Back to feed
        </button>
      </div>

      <section className="v-socpage__section">
        <h3 className="v-subhead">Next up</h3>
        {lead ? (
          <SocietyFeature lead={lead} related={rest} showHost={false} eager />
        ) : (
          <p className="v-note">No upcoming events yet{following ? '' : ' — follow to hear first'}.</p>
        )}
      </section>

      {past.length > 0 && (
        <section className="v-socpage__section">
          <h3 className="v-subhead">Recent events</h3>
          <ul className="v-socpage__list">
            {past.slice(0, 4).map((e) => {
              const n = albumFor(state.domain, e.id).length;
              return (
                <li key={e.id}>
                  <button className="v-relrow" onClick={() => actions.open({ kind: n ? 'album' : 'event', id: e.id }, true)}>
                    <Photo id={e.image} w={88} h={88} alt="" className="v-relrow__thumb" hue={s.hue} />
                    <span className="v-relrow__text">
                      <strong>{e.title}</strong>
                      <small>
                        {whenShort(e)}
                        {n ? ` · ${n} memories` : ''}
                      </small>
                    </span>
                    <ChevronRight size={16} className="v-muted" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {memories.length > 0 && (
        <section className="v-socpage__section">
          <h3 className="v-subhead">Community memories</h3>
          <div className="v-socpage__mem">
            {memories.map((m, i) => (
              <button
                key={m.id}
                className="v-socpage__memcell"
                aria-label="Open memory"
                onClick={() => actions.open({ kind: 'lightbox', ids: memories.map((x) => x.id), index: i }, true)}
              >
                <MediaImg media={m} w={200} h={200} />
              </button>
            ))}
          </div>
        </section>
      )}
    </Sheet>
  );
}
