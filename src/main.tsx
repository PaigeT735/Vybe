import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { VybeApp } from './vybe';
import './preview.css';

// Standalone preview entry. In an existing app, import { VybeApp } from './vybe' instead.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="preview-stage">
      <div className="preview-device">
        <VybeApp />
      </div>
      <p className="preview-caption">
        <strong>Vybe</strong> is designed for iPhone. Open it on your phone for the full experience.
      </p>
    </div>
  </StrictMode>,
);
