import { Howl, Howler } from 'howler';

export type SoundId =
  | 'pickup'
  | 'drop'
  | 'invalid'
  | 'flip'
  | 'foundation'
  | 'win'
  | 'deal';

let enabled = true;
let unlocked = false;
const sounds = new Map<SoundId, Howl>();

function synthTone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  gain = 0.08,
): string {
  if (typeof window === 'undefined') return '';
  return buildWavDataUri(generateSamples(frequency, durationMs, type, gain, 44100));
}

function generateSamples(
  frequency: number,
  durationMs: number,
  type: OscillatorType,
  gain: number,
  sampleRate: number,
): Float32Array {
  const length = Math.floor((sampleRate * durationMs) / 1000);
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-4 * t / (durationMs / 1000));
    let sample = 0;
    const phase = 2 * Math.PI * frequency * t;
    switch (type) {
      case 'square':
        sample = Math.sign(Math.sin(phase)) * gain * envelope;
        break;
      case 'triangle':
        sample = ((2 / Math.PI) * Math.asin(Math.sin(phase))) * gain * envelope;
        break;
      default:
        sample = Math.sin(phase) * gain * envelope;
    }
    samples[i] = sample;
  }
  return samples;
}

function buildWavDataUri(samples: Float32Array, sampleRate = 44100): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function ensureSound(id: SoundId, src: string, volume = 0.5): Howl {
  let howl = sounds.get(id);
  if (!howl) {
    howl = new Howl({ src: [src], volume, preload: true });
    sounds.set(id, howl);
  }
  return howl;
}

function bootSounds(): void {
  if (sounds.size > 0) return;
  ensureSound('pickup', synthTone(520, 55, 'triangle'), 0.35);
  ensureSound('drop', synthTone(360, 70, 'sine'), 0.4);
  ensureSound('invalid', synthTone(180, 120, 'square', 0.06), 0.35);
  ensureSound('flip', synthTone(440, 90, 'sine'), 0.3);
  ensureSound('foundation', synthTone(660, 110, 'triangle'), 0.45);
  ensureSound('win', synthTone(880, 180, 'sine', 0.07), 0.5);
  ensureSound('deal', synthTone(300, 45, 'triangle', 0.05), 0.25);
}

export function setSoundEnabled(next: boolean): void {
  enabled = next;
  if (!next) Howler.mute(true);
  else Howler.mute(false);
}

export function unlockAudio(): void {
  if (unlocked || typeof window === 'undefined') return;
  bootSounds();
  unlocked = true;
  for (const howl of sounds.values()) {
    try {
      howl.play();
      howl.stop();
    } catch {
      // Ignore autoplay restrictions until a real gesture plays a sound.
    }
  }
}

export function playSound(id: SoundId): void {
  if (!enabled || typeof window === 'undefined') return;
  bootSounds();
  if (!unlocked) return;
  sounds.get(id)?.play();
}

export function playWinFanfare(): void {
  if (!enabled || typeof window === 'undefined') return;
  bootSounds();
  if (!unlocked) return;
  playSound('win');
  window.setTimeout(() => playSound('foundation'), 120);
  window.setTimeout(() => playSound('foundation'), 240);
}
