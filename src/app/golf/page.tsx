import type { Metadata } from 'next';
import { VariantPlayPage, variantPageMetadata } from '@/components/seo/VariantPlayPage';

export const metadata: Metadata = variantPageMetadata('golf');

export default function GolfPage() {
  return <VariantPlayPage variantId="golf" />;
}
