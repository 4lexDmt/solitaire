import type { Metadata } from 'next';
import { VariantPlayPage, variantPageMetadata } from '@/components/seo/VariantPlayPage';

export const metadata: Metadata = variantPageMetadata('pyramid');

export default function PyramidPage() {
  return <VariantPlayPage variantId="pyramid" />;
}
