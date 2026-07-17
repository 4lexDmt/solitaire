import type { Metadata } from 'next';
import { VariantPlayPage, variantPageMetadata } from '@/components/seo/VariantPlayPage';

export const metadata: Metadata = variantPageMetadata('freecell');

export default function FreeCellPage() {
  return <VariantPlayPage variantId="freecell" />;
}
