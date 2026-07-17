import type { Metadata } from 'next';
import { VariantPlayPage, variantPageMetadata } from '@/components/seo/VariantPlayPage';

export const metadata: Metadata = variantPageMetadata('tripeaks');

export default function TriPeaksPage() {
  return <VariantPlayPage variantId="tripeaks" />;
}
