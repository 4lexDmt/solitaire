'use client';

import { CloseIcon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';
import { useEffect, useId, type ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: 'bottom' | 'right';
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  side = 'bottom',
}: SheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-modal"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0"
        style={{ background: 'var(--ui-scrim)' }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'absolute bg-ui-surface shadow-modal',
          side === 'bottom'
            ? 'inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-ui p-6'
            : 'inset-y-0 right-0 w-full max-w-md overflow-y-auto p-6',
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-ui text-title font-semibold text-ui-text">
            {title}
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <CloseIcon size={20} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
