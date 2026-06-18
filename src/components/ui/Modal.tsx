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
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
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
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative z-10 w-full max-w-md rounded-ui bg-ui-surface p-6 shadow-modal',
          className,
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
