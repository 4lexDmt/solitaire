'use client';

import { Win95Button } from '@/components/win95/primitives';

interface AutoCompleteBarProps {
  visible: boolean;
  busy: boolean;
  onFinish: () => void;
}

export function AutoCompleteBar({ visible, busy, onFinish }: AutoCompleteBarProps) {
  if (!visible) return null;

  return (
    <div
      className="autocomplete-bar"
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 12,
        transform: 'translateX(-50%)',
        zIndex: 40,
      }}
    >
      <Win95Button className="win95-btn--primary" onClick={onFinish} disabled={busy}>
        {busy ? 'Finishing…' : '⏭ Finish'}
      </Win95Button>
    </div>
  );
}
