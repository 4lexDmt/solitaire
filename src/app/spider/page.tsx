import type { Metadata } from 'next';
import { VariantPlayPage, variantPageMetadata } from '@/components/seo/VariantPlayPage';

export const metadata: Metadata = variantPageMetadata('spider');

export default function SpiderPage() {
  return <VariantPlayPage variantId="spider" />;
}
