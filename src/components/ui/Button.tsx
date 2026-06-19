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
    'bg-accent text-accent-text shadow-[0_1px_2px_rgba(0,0,0,0.18)] hover:brightness-105 active:scale-[0.97]',
  secondary:
    'bg-ui-surface-2 text-ui-text shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:bg-ui-surface active:scale-[0.97]',
  ghost:
    'bg-transparent text-ui-text border border-[color-mix(in_srgb,var(--ui-text)_14%,transparent)] hover:bg-ui-surface/50 active:scale-[0.97] [data-theme=midnight]:border-[rgba(255,255,255,0.16)]',
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
        'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[11px] px-[18px] py-3 font-ui text-[14px] font-semibold transition duration-press ease-standard hover:-translate-y-px',
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
