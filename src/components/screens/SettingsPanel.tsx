'use client';

import { Win95Button, Win95Dialog } from '@/components/win95/primitives';
import type { SpiderSuits } from '@/engine/variant';
import type { VariantId } from '@/engine/variants';
import { useSettingsStore } from '@/state/settings';
import { useEffect, useState } from 'react';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onConfirmNewDeal?: () => void;
}

const BACKS = ['weave', 'argyle', 'waves', 'citadel', 'bloom', 'circuit'] as const;
const FELTS = [
  { id: 'green', label: 'Green', swatch: '#0c6135' },
  { id: 'blue', label: 'Blue', swatch: '#12507f' },
  { id: 'burgundy', label: 'Burgundy', swatch: '#6b1e26' },
] as const;

export type FeltId = (typeof FELTS)[number]['id'];
export type CardBackId = (typeof BACKS)[number];

function readStoredBack(): CardBackId {
  try {
    const v = localStorage.getItem('aevanor.cardBack');
    if (v && (BACKS as readonly string[]).includes(v)) return v as CardBackId;
  } catch {
    /* ignore */
  }
  return 'weave';
}

function readStoredFelt(): FeltId {
  try {
    const v = localStorage.getItem('aevanor.felt');
    if (v && FELTS.some((f) => f.id === v)) return v as FeltId;
  } catch {
    /* ignore */
  }
  return 'green';
}

export function SettingsPanel({ open, onClose, onConfirmNewDeal }: SettingsPanelProps) {
  const settings = useSettingsStore();
  const [cardBack, setCardBack] = useState<CardBackId>('weave');
  const [felt, setFelt] = useState<FeltId>('green');

  useEffect(() => {
    if (!open) return;
    setCardBack(readStoredBack());
    setFelt(readStoredFelt());
  }, [open]);

  if (!open) return null;

  function applyVariant(variantId: VariantId) {
    settings.setVariantId(variantId);
    if (variantId !== 'klondike' && settings.scoreMode === 'vegas') {
      settings.setScoreMode('standard');
    }
    onConfirmNewDeal?.();
  }

  function selectBack(id: CardBackId) {
    setCardBack(id);
    document.documentElement.setAttribute('data-card-back', id);
    try {
      localStorage.setItem('aevanor.cardBack', id);
    } catch {
      /* ignore */
    }
  }

  function selectFelt(id: FeltId) {
    setFelt(id);
    document.documentElement.setAttribute('data-felt', id);
    try {
      localStorage.setItem('aevanor.felt', id);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="win95-scrim" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <Win95Dialog title="Options" onClose={onClose}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <fieldset className="win95-fieldset">
              <legend>Card back</legend>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {BACKS.map((id) => {
                  const selected = cardBack === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      title={id}
                      onClick={() => selectBack(id)}
                      style={{
                        padding: 2,
                        cursor: 'default',
                        border: 0,
                        background: 'transparent',
                        boxShadow: selected
                          ? '0 0 0 2px #04057a'
                          : 'inset -1px -1px #fff, inset 1px 1px grey',
                      }}
                    >
                      <div
                        data-card-back={id}
                        style={{
                          width: 34,
                          height: 46,
                          borderRadius: 4,
                          border: '3px solid #eef0f2',
                          backgroundColor: 'var(--card-back-base)',
                          backgroundImage: 'var(--card-back-image)',
                          backgroundSize: 'var(--card-back-size, auto)',
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>Table felt</legend>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {FELTS.map((f) => {
                  const on = felt === f.id;
                  return (
                    <label
                      key={f.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'default', fontSize: 12 }}
                    >
                      <button
                        type="button"
                        onClick={() => selectFelt(f.id)}
                        style={{
                          width: 13,
                          height: 13,
                          borderRadius: '50%',
                          boxShadow: 'inset -1px -1px #fff, inset 1px 1px grey',
                          background: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          padding: 0,
                          border: 0,
                          cursor: 'default',
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: on ? '#04057a' : 'transparent',
                          }}
                        />
                      </button>
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.4)',
                          background: f.swatch,
                        }}
                      />
                      {f.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <fieldset className="win95-fieldset" style={{ flex: 1, minWidth: 140 }}>
                <legend>Solitaire draw</legend>
                {([1, 3] as const).map((n) => (
                  <label
                    key={n}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'default', fontSize: 12, padding: '2px 0' }}
                  >
                    <RadioDot
                      on={settings.drawCount === n}
                      onClick={() => {
                        settings.setDrawCount(n);
                        if (settings.variantId === 'klondike') onConfirmNewDeal?.();
                      }}
                    />
                    Draw {n === 1 ? 'one' : 'three'} card{n === 1 ? '' : 's'}
                  </label>
                ))}
              </fieldset>

              <fieldset className="win95-fieldset" style={{ flex: 1, minWidth: 140 }}>
                <legend>Spider suits</legend>
                {([1, 2, 4] as SpiderSuits[]).map((n) => (
                  <label
                    key={n}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'default', fontSize: 12, padding: '2px 0' }}
                  >
                    <RadioDot
                      on={settings.spiderSuits === n}
                      onClick={() => {
                        settings.setSpiderSuits(n);
                        if (settings.variantId === 'spider') onConfirmNewDeal?.();
                      }}
                    />
                    {n === 1 ? 'One suit (easy)' : n === 2 ? 'Two suits' : 'Four suits (hard)'}
                  </label>
                ))}
              </fieldset>
            </div>

            <fieldset className="win95-fieldset">
              <legend>General</legend>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                <CheckToggle
                  label="Sound effects"
                  on={settings.soundEnabled}
                  onClick={() => settings.setSoundEnabled(!settings.soundEnabled)}
                />
                <CheckToggle
                  label="Timed game"
                  on={settings.showTimer}
                  onClick={() => settings.setShowTimer(!settings.showTimer)}
                />
                <CheckToggle
                  label="Win animation"
                  on={settings.motionEnabled}
                  onClick={() => settings.setMotionEnabled(!settings.motionEnabled)}
                />
                <CheckToggle
                  label="Four-color deck"
                  on={settings.fourColorDeck}
                  onClick={() => settings.setFourColorDeck(!settings.fourColorDeck)}
                />
                <CheckToggle
                  label="Left-handed"
                  on={settings.leftHanded}
                  onClick={() => settings.setLeftHanded(!settings.leftHanded)}
                />
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>Game</legend>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(
                  [
                    ['klondike', 'Solitaire'],
                    ['freecell', 'FreeCell'],
                    ['spider', 'Spider'],
                  ] as const
                ).map(([id, label]) => (
                  <Win95Button
                    key={id}
                    onClick={() => applyVariant(id)}
                    className={settings.variantId === id ? 'win95-btn--primary' : ''}
                  >
                    {label}
                  </Win95Button>
                ))}
              </div>
            </fieldset>

            <div style={{ textAlign: 'right' }}>
              <Win95Button className="win95-btn--primary" onClick={onClose}>
                Done
              </Win95Button>
            </div>
          </div>
        </Win95Dialog>
      </div>
    </div>
  );
}

function RadioDot({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 13,
        height: 13,
        borderRadius: '50%',
        boxShadow: 'inset -1px -1px #fff, inset 1px 1px grey',
        background: '#fff',
        display: 'grid',
        placeItems: 'center',
        padding: 0,
        border: 0,
        cursor: 'default',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: on ? '#04057a' : 'transparent',
        }}
      />
    </button>
  );
}

function CheckToggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'default', fontSize: 12 }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          width: 14,
          height: 14,
          boxShadow: 'inset -1px -1px #fff, inset 1px 1px grey, inset -2px -2px #dfdfdf, inset 2px 2px #0a0a0a',
          background: '#fff',
          display: 'grid',
          placeItems: 'center',
          fontSize: 11,
          fontWeight: 'bold',
          color: '#0a5f30',
          padding: 0,
          border: 0,
          cursor: 'default',
        }}
      >
        {on ? '✔' : ''}
      </button>
      {label}
    </label>
  );
}
