import Link from 'next/link';
import type { VariantId } from '@/engine/variants';
import { VARIANT_SEO } from '@/content/variants';
import { BRAND } from '@/config/brand';

interface VariantSeoArticleProps {
  variantId: VariantId;
}

export function VariantSeoArticle({ variantId }: VariantSeoArticleProps) {
  const content = VARIANT_SEO[variantId];

  return (
    <article className="seo-article" id="how-to-play">
      <div className="seo-article__inner">
        <p className="seo-article__eyebrow">
          {BRAND.name} · Ad-free · Offline-ready · Win9x desktop
        </p>
        <h2 className="seo-article__title">How to play {content.headline}</h2>
        <p className="seo-article__lead">{content.intro}</p>

        <section className="seo-article__section">
          <h3>Objective</h3>
          <p>{content.objective}</p>
        </section>

        <section className="seo-article__section">
          <h3>Setup</h3>
          <ul>
            {content.setup.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="seo-article__section">
          <h3>Rules</h3>
          <ul>
            {content.rules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="seo-article__section">
          <h3>Strategy tips</h3>
          <ul>
            {content.strategy.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="seo-article__section">
          <h3>Fair deals</h3>
          <p>
            Cards are shuffled with a deterministic seeded RNG. Computer opponents
            (when present) never peek at hidden cards. For classic Solitaire, optional{' '}
            <strong>Winnable deals only</strong> mode uses a real solver so every deal
            is solvable with perfect play — not a marketing guess.
          </p>
        </section>

        <section className="seo-article__section">
          <h3>More games</h3>
          <ul className="seo-article__related">
            {content.related.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/">All {BRAND.name} Solitaire</Link>
            </li>
            <li>
              <Link href="/daily">Daily Challenge</Link>
            </li>
          </ul>
        </section>
      </div>
    </article>
  );
}
