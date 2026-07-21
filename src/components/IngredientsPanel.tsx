import { useMemo, useState } from 'react';
import type { Ingredient } from '../lib/types';
import { formatAmount, parseAmount, toDecimalString } from '../lib/format';

interface Props {
  ingredients: Ingredient[];
  baseServings: number;
  yieldUnit?: string;
}

/**
 * Ingredients with two-way proportional scaling:
 *  - change the servings with − / +, OR
 *  - edit ANY single ingredient amount and everything else (plus the servings)
 *    rescales to match.
 * A single `factor` (relative to the original recipe) is the source of truth,
 * so every amount stays perfectly in proportion. Amounts are shown as tidy
 * fractions (2/3, 1 1/2) rather than long decimals.
 *
 * Checkbox state is intentionally in-memory only (React state) — it resets on
 * reload and is never written to localStorage, per the brief.
 */
export default function IngredientsPanel({ ingredients, baseServings, yieldUnit }: Props) {
  const unitWord = yieldUnit && yieldUnit !== 'servings' ? yieldUnit.replace(/s$/, '') : 'serving';
  const [factor, setFactor] = useState(1);
  const [checked, setChecked] = useState<Set<number>>(() => new Set());
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');

  const scaledServings = baseServings * factor;

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  // Servings shown rounded to the nearest half so it never reads like "3.33".
  const niceServings = (n: number) => {
    const r = Math.round(n * 2) / 2;
    return Number.isInteger(r) ? String(r) : String(r);
  };

  // − / + step to the next whole serving in that direction.
  const stepServings = (delta: number) => {
    const target =
      delta > 0
        ? Math.floor(scaledServings + 1e-6) + 1
        : Math.ceil(scaledServings - 1e-6) - 1;
    const clamped = Math.min(99, Math.max(1, target));
    setFactor(clamped / baseServings);
    setEditIdx(null);
  };

  // Editing one ingredient sets the factor from that ingredient's original amount.
  const onEditAmount = (i: number, raw: string) => {
    setEditVal(raw);
    const base = ingredients[i].amount;
    const n = parseAmount(raw);
    if (base && base > 0 && Number.isFinite(n) && n > 0) {
      setFactor(n / base);
    }
  };

  const scaled = useMemo(
    () =>
      ingredients.map((ing) => ({
        ...ing,
        display: ing.amount != null ? formatAmount(ing.amount * factor) : null,
      })),
    [ingredients, factor]
  );

  return (
    <div className="ingredients">
      <div className="ingredients__head">
        <h2 className="section-title" id="ingredients">Ingredients</h2>
        <div className="scaler" role="group" aria-label="Adjust servings">
          <button
            type="button"
            className="scaler__btn"
            onClick={() => stepServings(-1)}
            aria-label="Fewer servings"
            disabled={scaledServings <= 1}
          >−</button>
          <span className="scaler__value">
            <strong>{niceServings(scaledServings)}</strong>
            <span className="scaler__unit">{niceServings(scaledServings) === '1' ? unitWord : unitWord + 's'}</span>
          </span>
          <button
            type="button"
            className="scaler__btn"
            onClick={() => stepServings(1)}
            aria-label="More servings"
            disabled={scaledServings >= 99}
          >+</button>
        </div>
      </div>

      <p className="ingredients__hint">Tip: edit any amount below and the rest scale to match.</p>

      {factor !== 1 && (
        <button className="scaler__reset" onClick={() => { setFactor(1); setEditIdx(null); }}>
          Reset to {baseServings} {baseServings === 1 ? 'serving' : 'servings'}
        </button>
      )}

      <ul className="ingredients__list">
        {scaled.map((ing, i) => {
          const id = `ing-${i}`;
          const isChecked = checked.has(i);
          const editable = ing.amount != null && ing.amount > 0;
          return (
            <li key={i} className={`ing-row${isChecked ? ' ing-row--done' : ''}`}>
              <input
                type="checkbox"
                id={id}
                className="ing-row__check"
                checked={isChecked}
                onChange={() => toggle(i)}
              />
              <div className="ing-row__body">
                {editable && (
                  <span className="ing-row__amount">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="ing-row__input"
                      aria-label={`Amount of ${ing.item}`}
                      value={editIdx === i ? editVal : (ing.display ?? '')}
                      onFocus={(e) => {
                        setEditIdx(i);
                        setEditVal(toDecimalString((ing.amount as number) * factor));
                        // select so a fresh number replaces it cleanly
                        requestAnimationFrame(() => e.target.select());
                      }}
                      onChange={(e) => onEditAmount(i, e.target.value)}
                      onBlur={() => setEditIdx(null)}
                    />
                    {ing.unit ? <span className="ing-row__unit">{ing.unit}</span> : null}
                    {factor === 1 && ing.us ? <span className="ing-row__us">({ing.us})</span> : null}
                  </span>
                )}
                <label htmlFor={id} className="ing-row__label">
                  <span className="ing-row__item">
                    {ing.item}
                    {ing.estimated && <span className="ing-row__est" title="Editorial estimate — not from the original reel">est.</span>}
                    {ing.note && <span className="ing-row__note"> · {ing.note}</span>}
                  </span>
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
