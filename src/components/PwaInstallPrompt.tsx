'use client';

import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (!deferred || dismissed) return null;

  return (
    <div className="mx-board-pad mb-4 rounded-ui border border-accent/30 bg-ui-surface/95 p-4 shadow-modal backdrop-blur-sm">
      <p className="font-ui text-hud font-semibold text-ui-text">Install Solitaire</p>
      <p className="mt-1 font-ui text-sm text-ui-text-muted">
        Add to your home screen for offline play and a full-screen experience.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          className="min-h-9 px-3 py-1.5 text-sm"
          onClick={() => {
            void deferred.prompt();
            void deferred.userChoice.then(() => setDeferred(null));
          }}
        >
          Install
        </Button>
        <Button
          className="min-h-9 px-3 py-1.5 text-sm"
          variant="ghost"
          onClick={() => setDismissed(true)}
        >
          Not now
        </Button>
      </div>
    </div>
  );
}
