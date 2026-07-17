import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: 'Daily Solitaire Challenge',
  description: `Play today's shared Solitaire deal on ${BRAND.name} — same cards for everyone, streak tracking, shareable results. Calm, ad-free, offline-ready.`,
  alternates: { canonical: '/daily' },
  openGraph: {
    title: `Daily Solitaire Challenge · ${BRAND.name}`,
    description: `Play today's shared Solitaire deal on ${BRAND.name}.`,
    url: '/daily',
    type: 'website',
  },
};

export default function DailyPage() {
  return (
    <div className="seo-page">
      <AppShell autoStartDaily />
    </div>
  );
}
