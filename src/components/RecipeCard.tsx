import type { RecipeData } from '../lib/types';
import { labelize } from '../lib/format';

interface Props {
  recipe: RecipeData;
  href: string;
}

function timeLabel(r: RecipeData): string | null {
  if (r.totalTimeMin != null) {
    const h = Math.floor(r.totalTimeMin / 60);
    const m = r.totalTimeMin % 60;
    if (h === 0) return `${m} min`;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
  }
  if (r.totalTimeText && !/not\s|unavailable|n\/a/i.test(r.totalTimeText)) return r.totalTimeText;
  return null;
}

export default function RecipeCard({ recipe, href }: Props) {
  const r = recipe;
  const time = timeLabel(r);
  const cal = r.nutrition?.calories;
  const cuisine = r.cuisine && r.cuisine.length <= 26 ? r.cuisine : undefined;
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
        <span className="codeword card__codeword">{r.id}</span>
        {r.verification && (
          <span className={`vbadge vbadge--${r.verification}`} title={`Source verification ${r.verification}`}>{r.verification}</span>
        )}
      </div>

      <div className="card__body">
        <h3 className="card__title">{r.title}</h3>

        <div className="card__meta">
          {time && (
            <span className="card__meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              {time}
            </span>
          )}
          {cuisine && <span className="card__meta-item">{labelize(cuisine)}</span>}
          {r.difficulty && (
            <span className={`card__difficulty card__difficulty--${r.difficulty.toLowerCase()}`}>{r.difficulty}</span>
          )}
        </div>

        <div className="card__footer">
          <span className="card__protein">
            {r.proteinTags.length ? r.proteinTags.slice(0, 2).map(labelize).join(' · ') : (r.mealTags[0] ? labelize(r.mealTags[0]) : '')}
          </span>
          {cal && <span className="card__cal">{cal} cal</span>}
        </div>
      </div>
    </a>
  );
}
