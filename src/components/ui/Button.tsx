'use client';

import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-text shadow-card-resting hover:brightness-105 active:scale-[0.97]',
  secondary:
    'bg-ui-surface text-ui-text shadow-card-resting hover:bg-ui-surface-2 active:scale-[0.97]',
  ghost:
    'bg-transparent text-ui-text hover:bg-ui-surface/80 active:scale-[0.97]',
};

export function Button({
  variant = 'primary',
  fullWidth,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-ui px-4 py-2 font-ui text-button transition duration-press ease-standard',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
