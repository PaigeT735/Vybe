import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useVybe } from '../state/store';

interface SheetProps {
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  size?: 'auto' | 'tall' | 'full';
  footer?: ReactNode;
  hideHeader?: boolean;
  className?: string;
}

/**
 * Bottom sheet (or full-screen panel) rendered inside the app root. Closes on
 * backdrop tap, Escape, the close button, or dragging the grabber down. When
 * it was opened on top of another sheet, a Back button returns to it.
 */
export function Sheet({ title, subtitle, children, size = 'auto', footer, hideHeader, className = '' }: SheetProps) {
  const { state, actions } = useVybe();
  const [shown, setShown] = useState(false);
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const canGoBack = state.sheetStack.length > 0;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    panel.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  function close() {
    setShown(false);
    window.setTimeout(actions.close, 180);
  }

  const onDown = (e: PointerEvent) => {
    start.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (start.current !== null) setDrag(Math.max(0, e.clientY - start.current));
  };
  const onUp = () => {
    if (drag > 90) close();
    setDrag(0);
    start.current = null;
  };

  return (
    <div className={`v-sheet-layer v-sheet-layer--${size} ${shown ? 'is-in' : ''}`}>
      <button className="v-sheet-backdrop" aria-label="Close" tabIndex={-1} onClick={close} />
      <div
        ref={panel}
        className={`v-sheet v-sheet--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={drag ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined}
      >
        {size !== 'full' && (
          <div className="v-sheet__grab" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <span />
          </div>
        )}
        {(hideHeader || size === 'full') && (
          <div className="v-sheet__float">
            {canGoBack ? (
              <button className="v-iconbtn v-iconbtn--image" onClick={actions.back} aria-label="Back">
                <ChevronLeft size={20} />
              </button>
            ) : (
              <span />
            )}
            <button className="v-iconbtn v-iconbtn--image" onClick={close} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        )}
        {!hideHeader && size !== 'full' && (
          <header className="v-sheet__head">
            {canGoBack && (
              <button className="v-iconbtn v-iconbtn--glass v-iconbtn--sm" onClick={actions.back} aria-label="Back">
                <ChevronLeft size={19} />
              </button>
            )}
            <div className="v-sheet__titles">
              {title && <h2 className="v-sheet__title">{title}</h2>}
              {subtitle && <p className="v-sheet__sub">{subtitle}</p>}
            </div>
            <button className="v-iconbtn v-iconbtn--glass v-iconbtn--sm" onClick={close} aria-label="Close">
              <X size={18} />
            </button>
          </header>
        )}
        <div className="v-sheet__body">{children}</div>
        {footer && <div className="v-sheet__foot">{footer}</div>}
      </div>
    </div>
  );
}
