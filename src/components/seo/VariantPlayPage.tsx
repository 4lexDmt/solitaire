import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { VariantSeoArticle } from '@/components/seo/VariantSeoArticle';
import { VARIANT_SEO } from '@/content/variants';
import type { VariantId } from '@/engine/variants';

export function variantPageMetadata(id: VariantId): Metadata {
  const content = VARIANT_SEO[id];
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: content.path },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: content.path,
      type: 'website',
    },
  };
}

export function VariantPlayPage({ variantId }: { variantId: VariantId }) {
  return (
    <div className="seo-page">
      <AppShell initialVariant={variantId} />
      <VariantSeoArticle variantId={variantId} />
    </div>
  );
}
