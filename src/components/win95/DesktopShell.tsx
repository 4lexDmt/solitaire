'use client';

import { canAutoComplete } from '@/lib/autoComplete';
import { useSettingsStore } from '@/state/settings';
import { useStatsStore } from '@/state/stats';
import {
  Win95Button,
  Win95MenuBar,
  formatClock,
  formatTimer,
} from '@/components/win95/primitives';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { VariantId } from '@/engine/variants';
import type { GameState } from '@/engine/types';

const STATUS: Record<string, string> = {
  klondike: 'Build the foundations from Ace to King, one suit each.',
  freecell: 'Free the aces — park cards in the cells and build down.',
  spider: 'Clear a full suit King to Ace to remove it from play.',
};

interface DesktopShellProps {
  game: GameState;
  children: ReactNode;
  paused: boolean;
  onNewGame: () => void;
  onRestart: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onAuto: () => void;
  onResume: () => void;
  onPause: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onOpenDaily: () => void;
  onSelectVariant: (id: VariantId) => void;
  onHome: () => void;
  isDaily?: boolean;
}

export function DesktopShell({
  game,
  children,
  paused,
  onNewGame,
  onRestart,
  onUndo,
  onRedo,
  onHint,
  onAuto,
  onResume,
  onPause,
  onOpenStats,
  onOpenSettings,
  onOpenHelp,
  onOpenAbout,
  onOpenDaily,
  onSelectVariant,
  onHome,
  isDaily,
}: DesktopShellProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [clock, setClock] = useState(formatClock);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const drawCount = useSettingsStore((s) => s.drawCount);
  const spiderSuits = useSettingsStore((s) => s.spiderSuits);
  const showTimer = useSettingsStore((s) => s.showTimer);
  const dailyStreak = useStatsStore((s) => s.dailyCurrentStreak);
  const autoFinish = useCallback(() => {
    window.dispatchEvent(new CustomEvent('aevanor:auto-complete'));
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock()), 20_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStartOpen(false);
      if (e.key === 'F2') {
        e.preventDefault();
        onNewGame();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNewGame]);

  const variantName =
    game.variantId === 'freecell'
      ? 'FreeCell'
      : game.variantId === 'spider'
        ? 'Spider'
        : 'Klondike';

  const winTitle = `Aevanor Solitaire — ${variantName}`;

  const modeStr = useMemo(() => {
    if (isDaily) return 'Daily Challenge';
    if (game.variantId === 'klondike') return `Klondike • Draw ${drawCount}`;
    if (game.variantId === 'spider') return `Spider • ${spiderSuits}-suit`;
    return 'FreeCell';
  }, [drawCount, game.variantId, isDaily, spiderSuits]);

  const statusText = STATUS[game.variantId] ?? STATUS.klondike;
  const canAuto = canAutoComplete(game);
  const locked = game.status === 'won' || game.status === 'lost';

  const closeOverlays = useCallback(() => setStartOpen(false), []);

  const menus = [
    {
      id: 'game',
      label: (
        <>
          <u>G</u>ame
        </>
      ),
      items: [
        { type: 'item' as const, label: 'New Game', accel: 'F2', onClick: onNewGame },
        { type: 'item' as const, label: 'Restart Deal', onClick: onRestart },
        { type: 'sep' as const },
        {
          type: 'item' as const,
          label: 'Klondike',
          mark: game.variantId === 'klondike' ? '●' : '',
          onClick: () => onSelectVariant('klondike'),
        },
        {
          type: 'item' as const,
          label: 'FreeCell',
          mark: game.variantId === 'freecell' ? '●' : '',
          onClick: () => onSelectVariant('freecell'),
        },
        {
          type: 'item' as const,
          label: 'Spider',
          mark: game.variantId === 'spider' ? '●' : '',
          onClick: () => onSelectVariant('spider'),
        },
        { type: 'sep' as const },
        { type: 'item' as const, label: 'Daily Challenge…', onClick: onOpenDaily },
        { type: 'item' as const, label: 'Statistics…', onClick: onOpenStats },
        { type: 'sep' as const },
        { type: 'item' as const, label: 'Exit', onClick: onHome },
      ],
    },
    {
      id: 'edit',
      label: (
        <>
          <u>E</u>dit
        </>
      ),
      items: [
        {
          type: 'item' as const,
          label: 'Undo',
          accel: 'Ctrl+Z',
          disabled: locked || game.history.length === 0,
          onClick: onUndo,
        },
        {
          type: 'item' as const,
          label: 'Redo',
          disabled: locked || game.future.length === 0,
          onClick: onRedo,
        },
        {
          type: 'item' as const,
          label: 'Hint',
          accel: 'H',
          disabled: locked || game.status !== 'playing',
          onClick: onHint,
        },
        {
          type: 'item' as const,
          label: 'Auto-Complete',
          disabled: !canAuto || locked,
          onClick: onAuto,
        },
        { type: 'sep' as const },
        {
          type: 'item' as const,
          label: paused ? 'Resume' : 'Pause',
          onClick: paused ? onResume : onPause,
        },
      ],
    },
    {
      id: 'opt',
      label: (
        <>
          <u>O</u>ptions
        </>
      ),
      items: [
        {
          type: 'item' as const,
          label: 'Sound',
          mark: soundEnabled ? '✔' : '',
          onClick: () => setSoundEnabled(!soundEnabled),
        },
        { type: 'sep' as const },
        { type: 'item' as const, label: 'Appearance…', onClick: onOpenSettings },
      ],
    },
    {
      id: 'help',
      label: (
        <>
          <u>H</u>elp
        </>
      ),
      items: [
        { type: 'item' as const, label: 'How to Play…', onClick: onOpenHelp },
        { type: 'sep' as const },
        { type: 'item' as const, label: 'About Aevanor Solitaire…', onClick: onOpenAbout },
      ],
    },
  ];

  return (
    <div className="desktop">
      <div className="desktop__icons">
        <button type="button" className="desktop__icon" onDoubleClick={onNewGame} onClick={onNewGame}>
          <div className="desktop__icon-glyph desktop__icon-glyph--solitaire">♠</div>
          Solitaire
        </button>
        <button type="button" className="desktop__icon" onDoubleClick={onOpenStats} onClick={onOpenStats}>
          <div className="desktop__icon-glyph desktop__icon-glyph--stats">📊</div>
          Stats
        </button>
        <button type="button" className="desktop__icon" onDoubleClick={onOpenHelp} onClick={onOpenHelp}>
          <div className="desktop__icon-glyph desktop__icon-glyph--help">?</div>
          Read Me
        </button>
      </div>

      <div className="win95-window">
        <div className="win95-titlebar">
          <span className="win95-titlebar__icon">♠</span>
          <span className="win95-titlebar__label">{winTitle}</span>
          <div className="win95-titlebar__controls">
            <button type="button" className="win95-caption-btn" aria-label="Minimize" onClick={onPause}>
              _
            </button>
            <button type="button" className="win95-caption-btn" aria-label="Maximize" tabIndex={-1}>
              □
            </button>
            <button
              type="button"
              className="win95-caption-btn win95-caption-btn--close"
              aria-label="Close"
              onClick={onHome}
            >
              ✕
            </button>
          </div>
        </div>

        <Win95MenuBar menus={menus} />

        <div className="win95-toolbar">
          <Win95Button onClick={onNewGame} disabled={locked}>
            <span style={{ color: '#0a5f30', fontSize: 14 }}>♣</span> New
          </Win95Button>
          <Win95Button onClick={onRestart} disabled={locked}>
            ↻ Restart
          </Win95Button>
          <Win95Button onClick={onUndo} disabled={locked || game.history.length === 0}>
            ↶ Undo
          </Win95Button>
          <Win95Button onClick={onHint} disabled={locked || game.status !== 'playing'}>
            <span style={{ color: '#c9a000' }}>💡</span> Hint
          </Win95Button>
          <Win95Button
            onClick={() => {
              if (canAuto) autoFinish();
              else onAuto();
            }}
            disabled={locked || game.variantId === 'spider'}
            title={game.variantId === 'spider' ? 'Auto-complete is for Klondike & FreeCell' : undefined}
          >
            ⏭ Auto
          </Win95Button>

          <div className="win95-sep" />

          <div className="win95-tabs" role="group" aria-label="Game variant">
            {(
              [
                ['klondike', 'Klondike'],
                ['freecell', 'FreeCell'],
                ['spider', 'Spider'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className="win95-tab"
                aria-pressed={game.variantId === id}
                onClick={() => onSelectVariant(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {showTimer ? (
              <div className="win95-stat">
                <span className="win95-stat__label">TIME</span>
                <span className="win95-stat__value">{formatTimer(game.elapsedMs)}</span>
              </div>
            ) : null}
            <div className="win95-stat">
              <span className="win95-stat__label">MOVES</span>
              <span className="win95-stat__value">{game.moves}</span>
            </div>
            {game.scoreMode !== 'none' ? (
              <div className="win95-stat">
                <span className="win95-stat__label">SCORE</span>
                <span className="win95-stat__value win95-stat__value--score">{game.score}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="win95-board-well">
          <div className="win95-felt">{children}</div>
          {paused ? (
            <div className="win95-paused">
              <div style={{ textAlign: 'center' }}>
                <div
                  className="win95-pixel"
                  style={{ fontSize: 26, color: '#fff', letterSpacing: 2, marginBottom: 14 }}
                >
                  PAUSED
                </div>
                <Win95Button onClick={onResume}>▶ Resume</Win95Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="win95-statusbar">
          <div className="win95-statusbar__pane win95-statusbar__pane--main">{statusText}</div>
          <div className="win95-statusbar__pane">Daily streak: {dailyStreak} 🔥</div>
          <div className="win95-statusbar__pane">{modeStr}</div>
        </div>
      </div>

      <div className="win95-taskbar">
        <button
          type="button"
          className="win95-start"
          aria-pressed={startOpen}
          onClick={() => setStartOpen((v) => !v)}
        >
          <span className="win95-start__icon">♠</span>
          Start
        </button>
        <div className="win95-sep" />
        <button type="button" className="win95-task">
          <span style={{ color: '#0a5f30' }}>♠</span>
          <span>{winTitle}</span>
        </button>
        <div className="win95-tray">
          <button
            type="button"
            title="Sound"
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{ background: 'transparent', border: 0, cursor: 'default', fontSize: 14 }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <span>{clock}</span>
        </div>
      </div>

      {startOpen ? (
        <>
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 55 }}
            onClick={closeOverlays}
            aria-hidden
          />
          <div className="win95-start-menu" role="menu">
            <div className="win95-start-menu__banner">AEVANOR&nbsp;95</div>
            <div className="win95-start-menu__body">
              {[
                { icon: '🃏', label: 'New Game', onClick: onNewGame },
                { sep: true },
                { icon: '♠', label: 'Klondike', onClick: () => onSelectVariant('klondike') },
                { icon: '♣', label: 'FreeCell', onClick: () => onSelectVariant('freecell') },
                { icon: '🕷', label: 'Spider', onClick: () => onSelectVariant('spider') },
                { icon: '📅', label: 'Daily Challenge', onClick: onOpenDaily },
                { sep: true },
                { icon: '📊', label: 'Statistics', onClick: onOpenStats },
                { icon: '⚙', label: 'Options', onClick: onOpenSettings },
                { icon: '?', label: 'How to Play', onClick: onOpenHelp },
                { icon: 'ℹ', label: 'About', onClick: onOpenAbout },
              ].map((item, i) =>
                'sep' in item && item.sep ? (
                  <div key={`s-${i}`} className="win95-menu__sep" />
                ) : (
                  <button
                    key={'label' in item ? item.label : i}
                    type="button"
                    className="win95-start-menu__item"
                    onClick={() => {
                      closeOverlays();
                      if ('onClick' in item && item.onClick) item.onClick();
                    }}
                  >
                    <span className="win95-start-menu__icon">{'icon' in item ? item.icon : ''}</span>
                    {'label' in item ? item.label : ''}
                  </button>
                ),
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
