'use client';

import { CloseIcon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';
import { useEffect, useId, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'celebration';
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  variant = 'default',
}: ModalProps) {
  const titleId = useId();
  const celebration = variant === 'celebration';

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
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ background: 'var(--ui-scrim)' }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'modal-card relative z-10 w-full max-w-[248px] px-[22px] py-6 text-center',
          celebration && 'pt-[26px]',
          className,
        )}
      >
        {celebration ? (
          <div
            className="mx-auto mb-2 h-1.5 w-1.5 rounded-full bg-accent"
            aria-hidden
          />
        ) : null}
        {!celebration ? (
          <div className="mb-4 flex items-start justify-between gap-3 text-left">
            <h2 id={titleId} className="modal-title">
              {title}
            </h2>
            <IconButton label="Close" tone="ghost" onClick={onClose}>
              <CloseIcon size={20} />
            </IconButton>
          </div>
        ) : (
          <h2
            id={titleId}
            className="modal-title modal-title--win mb-1 text-center"
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
