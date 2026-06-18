'use client';

import { Button } from '@/components/ui/Button';

interface AutoCompleteBarProps {
  visible: boolean;
  busy: boolean;
  onFinish: () => void;
}

export function AutoCompleteBar({ visible, busy, onFinish }: AutoCompleteBarProps) {
  if (!visible) return null;

  return (
    <div className="autocomplete-bar">
      <Button className="text-sm px-4 py-2" onClick={onFinish} disabled={busy}>
        {busy ? 'Finishing…' : 'Finish'}
      </Button>
    </div>
  );
}
