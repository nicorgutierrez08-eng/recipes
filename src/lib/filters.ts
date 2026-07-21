import type { FilterState, RecipeData } from './types';

/** Multi-value filter fields, in the order they render in the panel. */
export const MULTI_FIELDS = [
  'cuisine',
  'mealType',
  'protein',
  'dietary',
  'difficulty',
  'spiceLevel',
  'season',
  'occasion',
  'equipment',
] as const;
export type MultiField = (typeof MULTI_FIELDS)[number];

export const TIME_RANGES: Array<{ value: string; label: string; max: number | null }> = [
  { value: '15', label: 'Under 15 min', max: 15 },
  { value: '30', label: 'Under 30 min', max: 30 },
  { value: '45', label: 'Under 45 min', max: 45 },
  { value: '60', label: 'Under 60 min', max: 60 },
  { value: '60+', label: '60 min +', max: null },
];

export const SORTS: Array<{ value: string; label: string }> = [
  { value: 'date', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'time', label: 'Quickest' },
  { value: 'alpha', label: 'A → Z' },
];

export const EMPTY_FILTERS: FilterState = {
  q: '',
  cuisine: [],
  mealType: [],
  protein: [],
  dietary: [],
  difficulty: [],
  spiceLevel: [],
  season: [],
  occasion: [],
  equipment: [],
  time: '',
  sort: 'date',
};

/** Read filter state out of a URLSearchParams (bookmarkable/shareable). */
export function filtersFromParams(params: URLSearchParams): FilterState {
  const list = (k: string) => {
    const v = params.get(k);
    return v ? v.split(',').filter(Boolean) : [];
  };
  return {
    q: params.get('q') ?? '',
    cuisine: list('cuisine'),
    mealType: list('mealType'),
    protein: list('protein'),
    dietary: list('dietary'),
    difficulty: list('difficulty'),
    spiceLevel: list('spiceLevel'),
    season: list('season'),
    occasion: list('occasion'),
    equipment: list('equipment'),
    time: params.get('time') ?? '',
    sort: params.get('sort') ?? 'date',
  };
}

/** Serialize filter state to a compact query string (omits defaults). */
export function filtersToParams(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set('q', f.q.trim());
  for (const field of MULTI_FIELDS) {
    const vals = f[field];
    if (vals.length) p.set(field, vals.join(','));
  }
  if (f.time) p.set('time', f.time);
  if (f.sort && f.sort !== 'date') p.set('sort', f.sort);
  return p;
}

export function countActive(f: FilterState): number {
  let n = 0;
  if (f.q.trim()) n += 1;
  for (const field of MULTI_FIELDS) n += f[field].length;
  if (f.time) n += 1;
  return n;
}

/** Build the set of available option values (facets) present in the library. */
export function buildFacets(recipes: RecipeData[]): Record<MultiField, string[]> {
  const sets: Record<MultiField, Set<string>> = {
    cuisine: new Set(),
    mealType: new Set(),
    protein: new Set(),
    dietary: new Set(),
    difficulty: new Set(),
    spiceLevel: new Set(),
    season: new Set(),
    occasion: new Set(),
    equipment: new Set(),
  };
  for (const r of recipes) {
    if (r.cuisine) sets.cuisine.add(r.cuisine);
    if (r.mealType) sets.mealType.add(r.mealType);
    if (r.protein) sets.protein.add(r.protein);
    if (r.difficulty) sets.difficulty.add(r.difficulty);
    if (r.spiceLevel != null) sets.spiceLevel.add(String(r.spiceLevel));
    for (const d of r.dietary ?? []) sets.dietary.add(d);
    for (const s of r.season ?? []) sets.season.add(s);
    for (const o of r.occasion ?? []) sets.occasion.add(o);
    for (const e of r.equipment ?? []) sets.equipment.add(e);
  }
  const out = {} as Record<MultiField, string[]>;
  for (const field of MULTI_FIELDS) {
    out[field] = [...sets[field]].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }
  return out;
}

/** Does a recipe pass all the non-text facet + time filters? (search handled separately) */
export function matchesFacets(r: RecipeData, f: FilterState): boolean {
  const anyOf = (selected: string[], value?: string) =>
    selected.length === 0 || (value != null && selected.includes(value));
  const anyOfList = (selected: string[], values?: string[]) =>
    selected.length === 0 || (values != null && selected.some((s) => values.includes(s)));

  if (!anyOf(f.cuisine, r.cuisine)) return false;
  if (!anyOf(f.mealType, r.mealType)) return false;
  if (!anyOf(f.protein, r.protein)) return false;
  if (!anyOf(f.difficulty, r.difficulty)) return false;
  if (!anyOf(f.spiceLevel, r.spiceLevel != null ? String(r.spiceLevel) : undefined)) return false;
  if (!anyOfList(f.dietary, r.dietary)) return false;
  if (!anyOfList(f.season, r.season)) return false;
  if (!anyOfList(f.occasion, r.occasion)) return false;
  if (!anyOfList(f.equipment, r.equipment)) return false;

  if (f.time) {
    const range = TIME_RANGES.find((t) => t.value === f.time);
    if (range) {
      if (range.max == null) {
        if (r.totalTime < 60) return false; // 60+
      } else if (r.totalTime >= range.max) {
        return false;
      }
    }
  }
  return true;
}

export function sortRecipes(list: RecipeData[], sort: string): RecipeData[] {
  const copy = [...list];
  switch (sort) {
    case 'rating':
      copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || cmpDate(b, a));
      break;
    case 'time':
      copy.sort((a, b) => a.totalTime - b.totalTime || a.title.localeCompare(b.title));
      break;
    case 'alpha':
      copy.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'date':
    default:
      copy.sort((a, b) => cmpDate(b, a));
      break;
  }
  return copy;
}

function cmpDate(a: RecipeData, b: RecipeData): number {
  const ta = a.dateAdded ? Date.parse(a.dateAdded) : 0;
  const tb = b.dateAdded ? Date.parse(b.dateAdded) : 0;
  return ta - tb;
}
