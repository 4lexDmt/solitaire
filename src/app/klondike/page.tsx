import type { Metadata } from 'next';
import { VariantPlayPage, variantPageMetadata } from '@/components/seo/VariantPlayPage';

export const metadata: Metadata = {
  ...variantPageMetadata('klondike'),
  alternates: { canonical: '/solitaire' },
};

export default function KlondikeAliasPage() {
  return <VariantPlayPage variantId="klondike" />;
}
