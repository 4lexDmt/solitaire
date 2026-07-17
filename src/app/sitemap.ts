import type { MetadataRoute } from 'next';
import { VARIANT_SEO_LIST } from '@/content/variants';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aevanor.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = new Set<string>(['/', '/daily', '/klondike']);
  for (const v of VARIANT_SEO_LIST) paths.add(v.path);

  return [...paths].map((path) => ({
    url: path === '/' ? SITE : `${SITE}${path}`,
    lastModified: now,
    changeFrequency: path === '/daily' ? ('daily' as const) : ('weekly' as const),
    priority: path === '/' ? 1 : path === '/daily' ? 0.9 : 0.85,
  }));
}
