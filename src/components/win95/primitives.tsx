'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

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

/** Win95-style combobox (sunken field + raised ▼) for picking one option. */
export function Win95Select<T extends string>({
  value,
  options,
  onChange,
  label,
  className = '',
  disabled = false,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`win95-select ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className="win95-select__trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="win95-select__value">{selected?.label ?? ''}</span>
        <span className="win95-select__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <ul id={listId} className="win95-select__menu" role="listbox" aria-label={label}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`win95-select__option${isSelected ? ' win95-select__option--selected' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className="win95-select__mark">{isSelected ? '●' : ''}</span>
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
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
