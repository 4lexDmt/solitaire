import { CardBackPattern } from '@/assets/cards';

/** Card back — theme-driven via CSS custom properties (SPEC §11.2). */
export function CardBack() {
  return (
    <div className="card-view__inner">
      <CardBackPattern />
    </div>
  );
}
