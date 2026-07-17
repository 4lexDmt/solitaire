import type { Metadata } from 'next';
import { VariantPlayPage, variantPageMetadata } from '@/components/seo/VariantPlayPage';

export const metadata: Metadata = variantPageMetadata('klondike');

export default function SolitairePage() {
  return <VariantPlayPage variantId="klondike" />;
}
