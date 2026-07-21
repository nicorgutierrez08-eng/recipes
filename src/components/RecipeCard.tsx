import type { RecipeData } from '../lib/types';
import { formatDuration, labelize } from '../lib/format';
import RatingStars from './RatingStars';

interface Props {
  recipe: RecipeData;
  href: string;
}

const SPICE_DOTS = (level: number) =>
  '🌶'.repeat(Math.max(0, level));

export default function RecipeCard({ recipe, href }: Props) {
  const r = recipe;
  return (
    <a className="card" href={href}>
      <div className={`card__media${r.image ? '' : ' card__media--empty'}`}>
        {r.image ? (
          <img src={r.image} alt="" loading="lazy" width={800} height={600} />
        ) : (
          <div className="card__placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3v7a3 3 0 0 0 6 0V3" />
              <path d="M9 10v11" />
              <path d="M17 3c-1.5 0-2.5 2-2.5 5.5S15.5 14 17 14s2.5-2 2.5-5.5S18.5 3 17 3Z" />
              <path d="M17 14v7" />
            </svg>
          </div>
        )}
        <span className="codeword card__codeword">{r.codeword}</span>
      </div>

      <div className="card__body">
        <h3 className="card__title">{r.title}</h3>

        <div className="card__meta">
          <span className="card__meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            {formatDuration(r.totalTime)}
          </span>
          {r.cuisine && <span className="card__meta-item">{labelize(r.cuisine)}</span>}
          {r.difficulty && (
            <span className={`card__difficulty card__difficulty--${r.difficulty}`}>{labelize(r.difficulty)}</span>
          )}
        </div>

        <div className="card__footer">
          {r.rating ? (
            <RatingStars value={r.rating} />
          ) : (
            <span className="card__unrated">Unrated</span>
          )}
          {typeof r.spiceLevel === 'number' && r.spiceLevel > 0 && (
            <span className="card__spice" aria-label={`Spice level ${r.spiceLevel} of 3`} title={`Spice ${r.spiceLevel}/3`}>
              {SPICE_DOTS(r.spiceLevel)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
