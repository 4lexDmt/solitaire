'use client';

import { Z } from '@/config/tokens';
import { cn } from '@/lib/cn';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  open: boolean;
  onDismiss: () => void;
  durationMs?: number;
  className?: string;
}

export function Toast({
  message,
  open,
  onDismiss,
  durationMs = 4000,
  className,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [open, onDismiss, durationMs]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-6 left-1/2 z-toast w-[min(92vw,320px)] -translate-x-1/2',
        'rounded-ui border border-accent/30 bg-ui-surface px-4 py-3 text-center shadow-card-resting',
        className,
      )}
      style={{ zIndex: Z.toast }}
    >
      <p className="font-ui text-sm font-medium text-ui-text">{message}</p>
    </div>
  );
}
