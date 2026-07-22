import type { FilterState, RecipeData } from './types';

/** Multi-value filter fields, in the order they render in the panel. */
export const MULTI_FIELDS = ['meal', 'protein', 'tags', 'difficulty', 'cost', 'verification'] as const;
export type MultiField = (typeof MULTI_FIELDS)[number];

export const TIME_RANGES: Array<{ value: string; label: string; max: number | null }> = [
  { value: '15', label: 'Under 15 min', max: 15 },
  { value: '30', label: 'Under 30 min', max: 30 },
  { value: '45', label: 'Under 45 min', max: 45 },
  { value: '60', label: 'Under 60 min', max: 60 },
  { value: '60+', label: '60 min +', max: null },
];

export const SORTS: Array<{ value: string; label: string }> = [
  { value: 'id', label: 'Library order' },
  { value: 'alpha', label: 'A → Z' },
  { value: 'time', label: 'Quickest' },
];

export const EMPTY_FILTERS: FilterState = {
  keywords: [],
  meal: [],
  protein: [],
  tags: [],
  difficulty: [],
  cost: [],
  verification: [],
  time: '',
  sort: 'id',
};

const list = (params: URLSearchParams, k: string) => {
  const v = params.get(k);
  return v ? v.split(',').filter(Boolean) : [];
};

export function filtersFromParams(params: URLSearchParams): FilterState {
  return {
    keywords: list(params, 'q'),
    meal: list(params, 'meal'),
    protein: list(params, 'protein'),
    tags: list(params, 'tags'),
    difficulty: list(params, 'difficulty'),
    cost: list(params, 'cost'),
    verification: list(params, 'verification'),
    time: params.get('time') ?? '',
    sort: params.get('sort') ?? 'id',
  };
}

export function filtersToParams(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.keywords.length) p.set('q', f.keywords.join(','));
  for (const field of MULTI_FIELDS) if (f[field].length) p.set(field, f[field].join(','));
  if (f.time) p.set('time', f.time);
  if (f.sort && f.sort !== 'id') p.set('sort', f.sort);
  return p;
}

export function countActive(f: FilterState): number {
  let n = 0;
  for (const field of MULTI_FIELDS) n += f[field].length;
  if (f.time) n += 1;
  return n;
}

/** Which recipe values back each facet field. */
function facetValues(r: RecipeData, field: MultiField): string[] {
  switch (field) {
    case 'meal': return r.mealTags;
    case 'protein': return r.proteinTags;
    case 'tags': return r.tags;
    case 'difficulty': return r.difficulty ? [r.difficulty] : [];
    case 'cost': return r.cost ? [r.cost] : [];
    case 'verification': return r.verification ? [r.verification] : [];
  }
}

export function buildFacets(recipes: RecipeData[]): Record<MultiField, string[]> {
  const sets = {} as Record<MultiField, Set<string>>;
  for (const field of MULTI_FIELDS) sets[field] = new Set();
  for (const r of recipes) {
    for (const field of MULTI_FIELDS) for (const v of facetValues(r, field)) sets[field].add(v);
  }
  const out = {} as Record<MultiField, string[]>;
  for (const field of MULTI_FIELDS) {
    const arr = [...sets[field]];
    if (field === 'difficulty') {
      const order = ['Easy', 'Medium', 'Hard'];
      arr.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    } else if (field === 'cost' || field === 'verification') {
      arr.sort();
    } else {
      arr.sort((a, b) => a.localeCompare(b));
    }
    out[field] = arr;
  }
  return out;
}

export function matchesFacets(r: RecipeData, f: FilterState): boolean {
  for (const field of MULTI_FIELDS) {
    const selected = f[field];
    if (!selected.length) continue;
    const values = facetValues(r, field);
    if (!selected.some((s) => values.includes(s))) return false;
  }
  if (f.time) {
    const range = TIME_RANGES.find((t) => t.value === f.time);
    if (range) {
      if (r.totalTimeMin == null) return false; // unknown time can't satisfy a time filter
      if (range.max == null) {
        if (r.totalTimeMin < 60) return false;
      } else if (r.totalTimeMin >= range.max) {
        return false;
      }
    }
  }
  return true;
}

export function sortRecipes(list: RecipeData[], sort: string): RecipeData[] {
  const copy = [...list];
  switch (sort) {
    case 'alpha':
      copy.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'time':
      copy.sort((a, b) => (a.totalTimeMin ?? 1e9) - (b.totalTimeMin ?? 1e9) || a.id.localeCompare(b.id));
      break;
    case 'id':
    default:
      copy.sort((a, b) => a.id.localeCompare(b.id));
      break;
  }
  return copy;
}

// ---------------------------------------------------------------------------
// Strict keyword search over the recipe's searchable words.
// ---------------------------------------------------------------------------

export function recipeWords(r: RecipeData): string[] {
  const out: string[] = [];
  const add = (s?: string) => {
    if (!s) return;
    for (const w of String(s).toLowerCase().split(/[^a-z0-9]+/)) if (w) out.push(w);
  };
  add(r.id);
  add(r.title);
  add(r.cuisine);
  add(r.meal);
  add(r.protein);
  add(r.cookingMethod);
  add(r.equipment);
  add(r.flavor);
  (r.keywords ?? []).forEach(add);
  (r.mealTags ?? []).forEach(add);
  (r.proteinTags ?? []).forEach(add);
  (r.dietaryTags ?? []).forEach(add);
  (r.tags ?? []).forEach(add);
  (r.ingredients ?? []).forEach((i) => add(i.item));
  return out;
}

/** True when a and b are within one edit (insert/delete/substitute) of each other. */
function within1(a: string, b: string): boolean {
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (la > lb) i++;
    else if (lb > la) j++;
    else { i++; j++; }
  }
  if (i < la || j < lb) edits++;
  return edits <= 1;
}

export function keywordMatches(words: string[], keyword: string): boolean {
  const parts = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  if (!parts.length) return true;
  return parts.every((kw) => {
    if (kw.length < 2) return true;
    for (const w of words) {
      if (w === kw) return true;
      if (kw.length >= 3 && w.startsWith(kw)) return true;
      // Forgive a single typo whenever the longer of the two words is >= 6
      // letters (so "salmn"→salmon, "chiken"→chicken, "brocoli"→broccoli all
      // match), while short words like "pasta"/"paste" stay distinct.
      if (Math.max(w.length, kw.length) >= 6 && within1(w, kw)) return true;
    }
    return false;
  });
}
