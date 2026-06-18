'use client';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useSettingsStore } from '@/state/settings';

interface VariantPickerProps {
  onChange?: (drawCount: 1 | 3) => void;
}

export function VariantPicker({ onChange }: VariantPickerProps) {
  const drawCount = useSettingsStore((s) => s.drawCount);
  const setDrawCount = useSettingsStore((s) => s.setDrawCount);

  return (
    <SegmentedControl<1 | 3>
      label="Draw count"
      value={drawCount}
      onChange={onChange ?? setDrawCount}
      options={[
        { value: 1, label: 'Draw 1' },
        { value: 3, label: 'Draw 3' },
      ]}
    />
  );
}
