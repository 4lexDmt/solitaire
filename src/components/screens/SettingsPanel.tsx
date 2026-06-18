'use client';

import { AuthPanel } from '@/components/auth/AuthPanel';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { Toggle } from '@/components/ui/Toggle';
import { ThemePicker } from '@/components/screens/ThemePicker';
import { VariantPicker } from '@/components/screens/VariantPicker';
import {
  downloadJson,
  exportAllData,
  importAllData,
  parseImportFile,
} from '@/persistence/db';
import type { StockPassLimit } from '@/state/settings';
import { useSettingsStore } from '@/state/settings';
import type { ScoreMode } from '@/engine/types';
import { useRef } from 'react';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  gameInProgress?: boolean;
  onConfirmNewDeal?: () => void;
}

export function SettingsPanel({
  open,
  onClose,
  gameInProgress,
  onConfirmNewDeal,
}: SettingsPanelProps) {
  const settings = useSettingsStore();
  const fileRef = useRef<HTMLInputElement>(null);

  function applyWithConfirmation(apply: () => void) {
    if (!gameInProgress) {
      apply();
      return;
    }
    const confirmed = window.confirm(
      'Changing this option starts a fresh deal. Your current game will be replaced. Continue?',
    );
    if (!confirmed) return;
    apply();
    onConfirmNewDeal?.();
  }

  async function handleExport() {
    const data = await exportAllData();
    downloadJson(data, `solitaire-backup-${new Date().toISOString().slice(0, 10)}.json`);
  }

  async function handleImport(file: File) {
    const data = await parseImportFile(file);
    await importAllData(data);
    if (data.settings) settings.hydrate(data.settings);
    window.location.reload();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Settings" side="right">
      <div className="space-y-6">
        <section>
          <h3 className="mb-3 font-ui text-hud font-semibold text-ui-text">Game</h3>
          <VariantPicker
            onChange={(drawCount) =>
              applyWithConfirmation(() => settings.setDrawCount(drawCount))
            }
          />
        </section>

        <section>
          <h3 className="mb-3 font-ui text-hud font-semibold text-ui-text">Scoring</h3>
          <SegmentedControl<ScoreMode>
            label="Scoring mode"
            value={settings.scoreMode}
            onChange={(scoreMode) =>
              applyWithConfirmation(() => settings.setScoreMode(scoreMode))
            }
            options={[
              { value: 'none', label: 'None' },
              { value: 'standard', label: 'Standard' },
              { value: 'vegas', label: 'Vegas' },
            ]}
          />
          {settings.scoreMode === 'vegas' ? (
            <div className="mt-3">
              <Toggle
                label="Vegas cumulative bankroll"
                checked={settings.vegasCumulative}
                onChange={settings.setVegasCumulative}
                description="Carry your Vegas balance across games."
              />
            </div>
          ) : null}
        </section>

        <section>
          <h3 className="mb-3 font-ui text-hud font-semibold text-ui-text">Stock passes</h3>
          <SegmentedControl<StockPassLimit>
            label="Stock pass limit"
            value={settings.stockPassLimit}
            onChange={settings.setStockPassLimit}
            options={[
              { value: 'unlimited', label: 'Unlimited' },
              { value: 1, label: '1' },
              { value: 3, label: '3' },
            ]}
          />
        </section>

        <section className="space-y-1">
          <Toggle label="Show timer" checked={settings.showTimer} onChange={settings.setShowTimer} />
          <Toggle label="Sound" checked={settings.soundEnabled} onChange={settings.setSoundEnabled} />
          <Toggle label="Motion" checked={settings.motionEnabled} onChange={settings.setMotionEnabled} description="Respects system reduced-motion when off." />
          <Toggle label="Haptics" checked={settings.hapticsEnabled} onChange={settings.setHapticsEnabled} />
          <Toggle label="Left-handed layout" checked={settings.leftHanded} onChange={settings.setLeftHanded} />
          <Toggle label="Winnable deals only" checked={settings.winnableOnly} onChange={settings.setWinnableOnly} />
          <Toggle label="Four-color deck" checked={settings.fourColorDeck} onChange={settings.setFourColorDeck} />
        </section>

        <section>
          <h3 className="mb-3 font-ui text-hud font-semibold text-ui-text">Theme</h3>
          <ThemePicker />
        </section>

        <section>
          <h3 className="mb-3 font-ui text-hud font-semibold text-ui-text">Cloud sync</h3>
          <AuthPanel />
        </section>

        <section>
          <h3 className="mb-3 font-ui text-hud font-semibold text-ui-text">Data</h3>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" onClick={handleExport}>
              Export backup
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              Import backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImport(file);
              }}
            />
          </div>
        </section>
      </div>
    </Sheet>
  );
}
