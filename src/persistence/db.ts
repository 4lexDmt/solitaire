import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AchievementId } from '@/state/achievements';
import type { PlayerStats } from '@/state/stats';
import type { UserSettings } from '@/state/settings';
import type { GameState } from '@/engine/types';

const DB_NAME = 'solitaire';
const DB_VERSION = 1;

export interface SavedGame {
  game: GameState;
  savedAt: number;
  isDaily: boolean;
  usedUndo: boolean;
  worryBack: boolean;
}

export interface PersistedData {
  settings: UserSettings;
  stats: PlayerStats;
  achievements: AchievementId[];
  achievementTimestamps: Partial<Record<AchievementId, number>>;
  savedGame: SavedGame | null;
  version: number;
}

interface SolitaireDB extends DBSchema {
  meta: {
    key: 'settings' | 'stats' | 'achievements' | 'savedGame';
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<SolitaireDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<SolitaireDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const db = await getDb();
  await db.put('meta', settings, 'settings');
}

export async function loadSettings(): Promise<UserSettings | null> {
  const db = await getDb();
  return (await db.get('meta', 'settings')) as UserSettings | null;
}

export async function saveStats(stats: PlayerStats): Promise<void> {
  const db = await getDb();
  await db.put('meta', stats, 'stats');
}

export async function loadStats(): Promise<PlayerStats | null> {
  const db = await getDb();
  return (await db.get('meta', 'stats')) as PlayerStats | null;
}

export async function saveAchievements(
  unlocked: AchievementId[],
  unlockedAt: Partial<Record<AchievementId, number>>,
): Promise<void> {
  const db = await getDb();
  await db.put('meta', { unlocked, unlockedAt }, 'achievements');
}

export async function loadAchievements(): Promise<{
  unlocked: AchievementId[];
  unlockedAt: Partial<Record<AchievementId, number>>;
} | null> {
  const db = await getDb();
  return (await db.get('meta', 'achievements')) as {
    unlocked: AchievementId[];
    unlockedAt: Partial<Record<AchievementId, number>>;
  } | null;
}

/** Autosave active game — SPEC §12.6 */
export async function autosaveGame(saved: SavedGame): Promise<void> {
  const db = await getDb();
  await db.put('meta', saved, 'savedGame');
}

export async function loadSavedGame(): Promise<SavedGame | null> {
  const db = await getDb();
  return (await db.get('meta', 'savedGame')) as SavedGame | null;
}

export async function clearSavedGame(): Promise<void> {
  const db = await getDb();
  await db.delete('meta', 'savedGame');
}

export async function exportAllData(): Promise<PersistedData> {
  const [settings, stats, achievements, savedGame] = await Promise.all([
    loadSettings(),
    loadStats(),
    loadAchievements(),
    loadSavedGame(),
  ]);

  return {
    settings: settings ?? ({} as UserSettings),
    stats: stats ?? ({} as PlayerStats),
    achievements: achievements?.unlocked ?? [],
    achievementTimestamps: achievements?.unlockedAt ?? {},
    savedGame,
    version: DB_VERSION,
  };
}

export async function importAllData(data: PersistedData): Promise<void> {
  if (data.settings) await saveSettings(data.settings);
  if (data.stats) await saveStats(data.stats);
  if (data.achievements) {
    await saveAchievements(data.achievements, data.achievementTimestamps ?? {});
  }
  if (data.savedGame) {
    await autosaveGame(data.savedGame);
  } else {
    await clearSavedGame();
  }
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function parseImportFile(file: File): Promise<PersistedData> {
  const text = await file.text();
  const parsed = JSON.parse(text) as PersistedData;
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid backup file');
  }
  return parsed;
}
