/** Original geometric card back — guilloché-inspired pattern (SPEC §11.2). */
export function CardBackPattern() {
  return (
    <svg viewBox="0 0 250 350" aria-hidden className="h-full w-full">
      <rect width="250" height="350" fill="var(--card-back-base)" />
      <rect
        x="14"
        y="14"
        width="222"
        height="322"
        rx="12"
        fill="none"
        stroke="var(--card-back-accent)"
        strokeWidth="3"
        opacity="0.85"
      />
      <rect
        x="24"
        y="24"
        width="202"
        height="302"
        rx="8"
        fill="var(--card-back-accent)"
        opacity="0.12"
      />
      {Array.from({ length: 8 }, (_, i) => {
        const y = 40 + i * 36;
        return (
          <path
            key={i}
            d={`M36 ${y} Q125 ${y + (i % 2 === 0 ? 18 : -18)} 214 ${y}`}
            fill="none"
            stroke="var(--card-back-accent)"
            strokeWidth="2"
            opacity="0.35"
          />
        );
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const x = 50 + i * 30;
        return (
          <circle
            key={`c-${i}`}
            cx={x}
            cy={175}
            r={8 + (i % 3) * 4}
            fill="none"
            stroke="var(--card-back-accent)"
            strokeWidth="1.5"
            opacity="0.28"
          />
        );
      })}
      <path
        d="M125 70 L155 130 L125 190 L95 130 Z"
        fill="var(--card-back-accent)"
        opacity="0.22"
      />
      <path
        d="M125 160 L155 220 L125 280 L95 220 Z"
        fill="var(--card-back-accent)"
        opacity="0.18"
      />
    </svg>
  );
}
