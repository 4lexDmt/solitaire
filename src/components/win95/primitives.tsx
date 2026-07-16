'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export function Win95Button({
  children,
  onClick,
  disabled,
  className = '',
  title,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      className={`win95-btn ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

export function Win95Dialog({
  title,
  onClose,
  children,
  size = 'md',
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div
      className={`win95-dialog${size === 'sm' ? ' win95-dialog--sm' : ''}${size === 'lg' ? ' win95-dialog--lg' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="win95-dialog__title">
        <span>{title}</span>
        {onClose ? (
          <button type="button" className="win95-dialog__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        ) : null}
      </div>
      <div className="win95-dialog__body">{children}</div>
    </div>
  );
}

type MenuItem =
  | { type: 'sep' }
  | {
      type: 'item';
      label: string;
      accel?: string;
      mark?: string;
      disabled?: boolean;
      onClick: () => void;
    };

function DropdownMenu({
  items,
  onClose,
}: {
  items: MenuItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="win95-menu" ref={ref} role="menu">
      {items.map((item, i) =>
        item.type === 'sep' ? (
          <div key={`sep-${i}`} className="win95-menu__sep" />
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className="win95-menu__item"
            disabled={item.disabled}
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            <span className="win95-menu__mark">{item.mark ?? ''}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.accel ? <span className="win95-menu__accel">{item.accel}</span> : null}
          </button>
        ),
      )}
    </div>
  );
}

export function Win95MenuBar({
  menus,
}: {
  menus: { id: string; label: ReactNode; items: MenuItem[] }[];
}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="win95-menubar" role="menubar">
      {menus.map((menu) => (
        <div key={menu.id} style={{ position: 'relative' }}>
          <button
            type="button"
            className="win95-menubar__item"
            aria-expanded={open === menu.id}
            aria-haspopup="true"
            onClick={() => setOpen((v) => (v === menu.id ? null : menu.id))}
          >
            {menu.label}
          </button>
          {open === menu.id ? (
            <DropdownMenu items={menu.items} onClose={() => setOpen(null)} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function formatClock(now = new Date()): string {
  let h = now.getHours();
  const m = now.getMinutes();
  const ap = h < 12 ? 'AM' : 'PM';
  h = h % 12 || 12;
  return `${h}:${m < 10 ? '0' : ''}${m} ${ap}`;
}

export function formatTimer(elapsedMs: number): string {
  const total = Math.floor(elapsedMs / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
