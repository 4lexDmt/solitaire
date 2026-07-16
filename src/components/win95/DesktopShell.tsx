'use client';

import { canAutoComplete } from '@/lib/autoComplete';
import { STATUS_FLASH_EVENT } from '@/lib/statusFlash';
import { variantLabel } from '@/lib/variantLabel';
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
  onDrawCountChange?: (n: 1 | 3) => void;
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
  onDrawCountChange,
  isDaily,
}: DesktopShellProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [maximized, setMaximized] = useState(true);
  const [clock, setClock] = useState(formatClock);
  const [statusFlash, setStatusFlash] = useState<string | null>(null);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const drawCount = useSettingsStore((s) => s.drawCount);
  const spiderSuits = useSettingsStore((s) => s.spiderSuits);
  const showTimer = useSettingsStore((s) => s.showTimer);
  const setShowTimer = useSettingsStore((s) => s.setShowTimer);
  const motionEnabled = useSettingsStore((s) => s.motionEnabled);
  const setMotionEnabled = useSettingsStore((s) => s.setMotionEnabled);
  const setDrawCount = useSettingsStore((s) => s.setDrawCount);
  const dailyStreak = useStatsStore((s) => s.dailyCurrentStreak);

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock()), 20_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let clearId = 0;
    const onFlash = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      if (!msg) return;
      setStatusFlash(msg);
      window.clearTimeout(clearId);
      clearId = window.setTimeout(() => setStatusFlash(null), 2600);
    };
    window.addEventListener(STATUS_FLASH_EVENT, onFlash);
    return () => {
      window.removeEventListener(STATUS_FLASH_EVENT, onFlash);
      window.clearTimeout(clearId);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStartOpen(false);
      if (e.key === 'F2') {
        e.preventDefault();
        onNewGame();
      }
      const k = e.key.toLowerCase();
      if (k === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        onHint();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNewGame, onHint]);

  const variantName = variantLabel(game.variantId);

  const winTitle = `Aevanor Solitaire — ${variantName}`;

  const modeStr = useMemo(() => {
    if (isDaily) return 'Daily Challenge';
    if (game.variantId === 'klondike') return `Solitaire • Draw ${drawCount}`;
    if (game.variantId === 'spider') return `Spider • ${spiderSuits}-suit`;
    return 'FreeCell';
  }, [drawCount, game.variantId, isDaily, spiderSuits]);

  const statusText = statusFlash ?? STATUS[game.variantId] ?? STATUS.klondike;
  const canAuto = canAutoComplete(game);
  const locked = game.status === 'won' || game.status === 'lost';

  const closeOverlays = useCallback(() => setStartOpen(false), []);

  const changeDraw = useCallback(
    (n: 1 | 3) => {
      setDrawCount(n);
      onDrawCountChange?.(n);
    },
    [onDrawCountChange, setDrawCount],
  );

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
          label: 'Solitaire',
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
          disabled: locked || game.status !== 'playing',
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
          label: 'Draw One',
          mark: drawCount === 1 ? '●' : '',
          onClick: () => changeDraw(1),
        },
        {
          type: 'item' as const,
          label: 'Draw Three',
          mark: drawCount === 3 ? '●' : '',
          onClick: () => changeDraw(3),
        },
        { type: 'sep' as const },
        {
          type: 'item' as const,
          label: 'Sound',
          mark: soundEnabled ? '✔' : '',
          onClick: () => setSoundEnabled(!soundEnabled),
        },
        {
          type: 'item' as const,
          label: 'Timed Game',
          mark: showTimer ? '✔' : '',
          onClick: () => setShowTimer(!showTimer),
        },
        {
          type: 'item' as const,
          label: 'Win Animation',
          mark: motionEnabled ? '✔' : '',
          onClick: () => setMotionEnabled(!motionEnabled),
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

      <div className={`win95-window${maximized ? ' win95-window--maximized' : ''}`}>
        <div className="win95-titlebar">
          <span className="win95-titlebar__icon">♠</span>
          <span className="win95-titlebar__label">{winTitle}</span>
          <div className="win95-titlebar__controls">
            <button type="button" className="win95-caption-btn" aria-label="Minimize" onClick={onPause}>
              _
            </button>
            <button
              type="button"
              className="win95-caption-btn"
              aria-label={maximized ? 'Restore' : 'Maximize'}
              onClick={() => setMaximized((v) => !v)}
            >
              {maximized ? '❐' : '□'}
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
            <span style={{ color: '#0a5f30', fontSize: 14 }}>♣</span>
            <span className="win95-btn__text">New</span>
          </Win95Button>
          <Win95Button
            className="win95-btn--secondary-mobile"
            onClick={onRestart}
            disabled={locked}
          >
            ↻<span className="win95-btn__text"> Restart</span>
          </Win95Button>
          <Win95Button onClick={onUndo} disabled={locked || game.history.length === 0}>
            ↶<span className="win95-btn__text"> Undo</span>
          </Win95Button>
          <Win95Button onClick={onHint} disabled={locked || game.status !== 'playing'}>
            <span style={{ color: '#c9a000' }}>💡</span>
            <span className="win95-btn__text"> Hint</span>
          </Win95Button>
          <Win95Button
            onClick={onAuto}
            disabled={locked || game.status !== 'playing'}
            title={
              game.variantId === 'spider'
                ? 'Auto-complete is for Solitaire & FreeCell'
                : canAuto
                  ? 'Finish to foundations'
                  : 'Move available cards to foundations'
            }
          >
            ⏭<span className="win95-btn__text"> Auto</span>
          </Win95Button>

          <div className="win95-sep" />

          <div className="win95-tabs" role="group" aria-label="Game variant">
            {(
              [
                ['klondike', 'Solitaire'],
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

          <div style={{ flex: 1, minWidth: 4 }} />

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 'none' }}>
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
              <div className="win95-stat win95-btn--secondary-mobile">
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
        <button
          type="button"
          className="win95-task"
          onClick={() => {
            if (paused) onResume();
          }}
        >
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
                { icon: '♠', label: 'Solitaire', onClick: () => onSelectVariant('klondike') },
                { icon: '♣', label: 'FreeCell', onClick: () => onSelectVariant('freecell') },
                { icon: '🕷', label: 'Spider', onClick: () => onSelectVariant('spider') },
                { icon: '📅', label: 'Daily Challenge', onClick: onOpenDaily },
                { sep: true },
                { icon: '📊', label: 'Statistics', onClick: onOpenStats },
                { icon: '⚙', label: 'Options', onClick: onOpenSettings },
                { icon: '?', label: 'How to Play', onClick: onOpenHelp },
                { icon: 'ℹ', label: 'About', onClick: onOpenAbout },
                { sep: true },
                { icon: '⏻', label: 'Restart…', onClick: onHome },
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
