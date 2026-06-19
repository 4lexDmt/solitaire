'use client';

import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes } from 'react';

type IconButtonTone = 'surface' | 'hud' | 'ghost';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: IconButtonTone;
}

const toneClasses: Record<IconButtonTone, string> = {
  surface:
    'min-h-11 min-w-11 rounded-ui bg-ui-surface/90 text-ui-text shadow-card-resting backdrop-blur-sm hover:bg-ui-surface active:scale-[0.97]',
  hud: 'hud-icon-btn',
  ghost:
    'min-h-11 min-w-11 rounded-ui bg-transparent text-ui-text hover:bg-ui-surface/50 active:scale-[0.97]',
};

export function IconButton({
  label,
  tone = 'surface',
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center transition duration-press ease-standard',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:pointer-events-none disabled:opacity-50',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
