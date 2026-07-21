import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import type { FilterState, RecipeData } from '../lib/types';
import {
  EMPTY_FILTERS,
  MULTI_FIELDS,
  TIME_RANGES,
  SORTS,
  buildFacets,
  filtersFromParams,
  filtersToParams,
  matchesFacets,
  sortRecipes,
  countActive,
  type MultiField,
} from '../lib/filters';
import { labelize } from '../lib/format';
import RecipeCard from './RecipeCard';

interface Props {
  recipes: RecipeData[];
  base: string;
}

/** Human labels for each filter group. */
const FIELD_LABEL: Record<MultiField, string> = {
  cuisine: 'Cuisine',
  mealType: 'Meal',
  protein: 'Protein',
  dietary: 'Dietary',
  difficulty: 'Difficulty',
  spiceLevel: 'Spice',
  season: 'Season',
  occasion: 'Occasion',
  equipment: 'Equipment',
};

const SPICE_LABEL: Record<string, string> = {
  '0': 'No heat',
  '1': 'Mild',
  '2': 'Medium',
  '3': 'Hot',
};

function optionLabel(field: MultiField, value: string): string {
  if (field === 'spiceLevel') return SPICE_LABEL[value] ?? value;
  return labelize(value);
}

export default function RecipeLibrary({ recipes, base }: Props) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [panelOpen, setPanelOpen] = useState(false);
  const hydrated = useRef(false);

  // --- Read filter state from the URL on first mount (bookmark/share support) ---
  useEffect(() => {
    const parsed = filtersFromParams(new URLSearchParams(window.location.search));
    setFilters(parsed);
    hydrated.current = true;
  }, []);

  // --- Keep the URL in sync so any view is bookmarkable/shareable ---
  useEffect(() => {
    if (!hydrated.current) return;
    const params = filtersToParams(filters);
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [filters]);

  const facets = useMemo(() => buildFacets(recipes), [recipes]);

  const fuse = useMemo(
    () =>
      new Fuse(recipes, {
        includeScore: false,
        threshold: 0.42, // forgiving of typos
        ignoreLocation: true,
        keys: [
          { name: 'title', weight: 3 },
          { name: 'codeword', weight: 3 },
          { name: 'tags', weight: 2 },
          { name: 'ingredients.item', weight: 1.5 },
          { name: 'cuisine', weight: 1 },
        ],
      }),
    [recipes]
  );

  const results = useMemo(() => {
    const q = filters.q.trim();
    const base = q ? fuse.search(q).map((res) => res.item) : recipes;
    const filtered = base.filter((r) => matchesFacets(r, filters));
    // When searching with the default sort, preserve fuzzy relevance order.
    if (q && filters.sort === 'date') return filtered;
    return sortRecipes(filtered, filters.sort);
  }, [filters, fuse, recipes]);

  const activeCount = countActive(filters);

  // --- Mutators ---
  const toggleValue = (field: MultiField, value: string) => {
    setFilters((f) => {
      const set = new Set(f[field]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...f, [field]: [...set] };
    });
  };
  const setTime = (value: string) =>
    setFilters((f) => ({ ...f, time: f.time === value ? '' : value }));
  const clearAll = () =>
    setFilters((f) => ({ ...EMPTY_FILTERS, sort: f.sort }));

  // --- Build the removable active-chip list ---
  const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
  if (filters.q.trim()) {
    chips.push({
      key: 'q',
      label: `“${filters.q.trim()}”`,
      onRemove: () => setFilters((f) => ({ ...f, q: '' })),
    });
  }
  for (const field of MULTI_FIELDS) {
    for (const value of filters[field]) {
      chips.push({
        key: `${field}:${value}`,
        label: `${FIELD_LABEL[field]}: ${optionLabel(field, value)}`,
        onRemove: () => toggleValue(field, value),
      });
    }
  }
  if (filters.time) {
    const t = TIME_RANGES.find((x) => x.value === filters.time);
    chips.push({
      key: 'time',
      label: t ? t.label : filters.time,
      onRemove: () => setFilters((f) => ({ ...f, time: '' })),
    });
  }

  // Link each card back with the current filter state preserved.
  const cardHref = (slug: string) => {
    const qs = filtersToParams(filters).toString();
    const target = `${base}/${slug}`;
    return qs ? `${target}?from=${encodeURIComponent(qs)}` : target;
  };

  return (
    <div className="library">
      {/* ---------------- Search + controls ---------------- */}
      <div className="library__controls">
        <div className="search">
          <svg className="search__icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            className="search__input"
            placeholder="Search a codeword, dish, or ingredient…"
            aria-label="Search recipes"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
          {filters.q && (
            <button className="search__clear" onClick={() => setFilters((f) => ({ ...f, q: '' }))} aria-label="Clear search">×</button>
          )}
        </div>

        <div className="controls-row">
          <button
            className="filters-toggle"
            aria-expanded={panelOpen}
            aria-controls="filter-panel"
            onClick={() => setPanelOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M3 5h18M6 12h12M10 19h4"/></svg>
            Filters
            {activeCount > 0 && <span className="filters-toggle__badge">{activeCount}</span>}
          </button>

          <label className="sort">
            <span className="sort__label">Sort</span>
            <select
              className="sort__select"
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ---------------- Filter panel ---------------- */}
      <div id="filter-panel" className={`panel${panelOpen ? ' panel--open' : ''}`} hidden={!panelOpen}>
        <div className="panel__grid">
          <fieldset className="group">
            <legend className="group__title">Total time</legend>
            <div className="chips-choice">
              {TIME_RANGES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`choice${filters.time === t.value ? ' choice--on' : ''}`}
                  aria-pressed={filters.time === t.value}
                  onClick={() => setTime(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          {MULTI_FIELDS.map((field) =>
            facets[field].length ? (
              <fieldset className="group" key={field}>
                <legend className="group__title">{FIELD_LABEL[field]}</legend>
                <div className="chips-choice">
                  {facets[field].map((value) => {
                    const on = filters[field].includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        className={`choice${on ? ' choice--on' : ''}`}
                        aria-pressed={on}
                        onClick={() => toggleValue(field, value)}
                      >
                        {optionLabel(field, value)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null
          )}
        </div>
      </div>

      {/* ---------------- Result summary + active chips ---------------- */}
      <div className="library__summary">
        <p className="count" aria-live="polite">
          <strong>{results.length}</strong> {results.length === 1 ? 'recipe' : 'recipes'}
          {activeCount > 0 && <span className="count__of"> of {recipes.length}</span>}
        </p>
        {chips.length > 0 && (
          <div className="active-chips">
            {chips.map((c) => (
              <button key={c.key} className="active-chip" onClick={c.onRemove}>
                <span>{c.label}</span>
                <span className="active-chip__x" aria-hidden="true">×</span>
                <span className="visually-hidden">— remove filter</span>
              </button>
            ))}
            <button className="clear-all" onClick={clearAll}>Clear all</button>
          </div>
        )}
      </div>

      {/* ---------------- Results grid / empty state ---------------- */}
      {results.length > 0 ? (
        <div className="grid">
          {results.map((r) => (
            <RecipeCard key={r.slug} recipe={r} href={cardHref(r.slug)} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18"/><path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9Z"/><path d="M8 15c1 1 2.5 1.5 4 1.5s3-.5 4-1.5"/></svg>
          </div>
          <h2 className="empty__title">Nothing on the menu — yet</h2>
          <p className="empty__body">No recipes match these filters. Try loosening one, or start fresh.</p>
          <button className="btn-primary" onClick={clearAll}>Clear all filters</button>
        </div>
      )}
    </div>
  );
}
