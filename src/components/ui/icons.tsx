import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 24, className, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

function FilledIcon({ size = 24, className, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function UndoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9h11a4.5 4.5 0 1 1 0 9h-2" />
      <path d="M4 9l4-3.5M4 9l4 3.5" />
    </Icon>
  );
}

export function RedoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 9H9a4.5 4.5 0 1 0 0 9h2" />
      <path d="M20 9l-4-3.5M20 9l-4 3.5" />
    </Icon>
  );
}

export function HintIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z" />
      <path d="M9.5 19h5M10.5 21.5h3" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.7 5.3l-1.7 1.7M7 17l-1.7 1.7M18.7 18.7L17 17M7 7L5.3 5.3" />
    </Icon>
  );
}

export function StatsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 20h18" />
      <path d="M6 20v-7M12 20V5M18 20v-4" />
    </Icon>
  );
}

export function SoundOnIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9v6h3.5L13 19V5L7.5 9H4z" />
      <path d="M16.5 9.2a4 4 0 0 1 0 5.6" />
      <path d="M19 6.8a7.5 7.5 0 0 1 0 10.4" />
    </Icon>
  );
}

export function SoundOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9v6h3.5L13 19V5L7.5 9H4z" />
      <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" />
    </Icon>
  );
}

export function NewGameIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 4h8v5.5a4 4 0 0 1-8 0V4z" />
      <path d="M8 5.5H5v1.5a3 3 0 0 0 3 3M16 5.5h3v1.5a3 3 0 0 0-3 3" />
      <path d="M12 13.5v3.5M9.5 20h5M10.5 17h3" />
    </Icon>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3c1.2 3 4 4.2 4 7.8a4 4 0 0 1-8 0c0-1.8 1-2.9 2-3.8.1 1.8 2 1.8 2 0 0-1.6 0-2.6 0-4z" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 13l4.5 4.5L19 7" />
    </Icon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8.5 3v4M15.5 3v4" />
    </Icon>
  );
}

export function BackArrowIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11 6l-6 6 6 6" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <FilledIcon {...props}>
      <path d="M7.5 5l11 7-11 7z" />
    </FilledIcon>
  );
}

export function RestartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M3.5 4.5v3.6h3.6" />
    </Icon>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <FilledIcon {...props}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </FilledIcon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}
