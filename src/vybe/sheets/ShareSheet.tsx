import { Copy, Share } from 'lucide-react';
import { Photo } from '../components/Photo';
import { Sheet } from '../components/Sheet';
import { copyText, demoLink } from '../lib/clipboard';
import { eventById, societyById } from '../lib/feed';
import { whenShort } from '../lib/format';
import { useVybe } from '../state/store';

export function ShareSheet({ id }: { id: string }) {
  const { actions } = useVybe();
  const e = eventById(id);
  if (!e) return null;
  const link = demoLink(`e/${e.id}`);
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <Sheet title="Share event">
      <div className="v-sharecard">
        <Photo id={e.image} w={88} h={88} alt="" className="v-sharecard__img" />
        <span>
          <strong>{e.title}</strong>
          <small>
            {societyById(e.societyId)?.name} · {whenShort(e)}
          </small>
        </span>
      </div>
      <div className="v-linkfield">
        <span className="v-linkfield__url">{link.replace('https://', '')}</span>
        <span className="v-chip">Demo link</span>
      </div>
      <div className="v-stackbtns">
        <button
          className="v-btn v-btn--primary v-btn--block"
          onClick={async () => {
            const ok = await copyText(link);
            actions.toast(ok ? 'Link copied (demo link)' : 'Couldn’t copy — select the link above');
            if (ok) actions.close();
          }}
        >
          <Copy size={16} /> Copy link
        </button>
        {canNativeShare && (
          <button
            className="v-btn v-btn--glass v-btn--block"
            onClick={() => navigator.share({ title: e.title, text: `${e.title} — ${e.tagline}`, url: link }).catch(() => undefined)}
          >
            <Share size={16} /> More options
          </button>
        )}
      </div>
    </Sheet>
  );
}
