import type { Metadata } from 'next';
import { VariantPlayPage, variantPageMetadata } from '@/components/seo/VariantPlayPage';

export const metadata: Metadata = variantPageMetadata('yukon');

export default function YukonPage() {
  return <VariantPlayPage variantId="yukon" />;
}
