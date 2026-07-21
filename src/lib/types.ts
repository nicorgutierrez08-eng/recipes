import type {
  MEAL_TYPES,
  DIETARY,
  DIFFICULTY,
  SEASONS,
  OCCASIONS,
  EQUIPMENT,
} from '../content.config';

/** One ingredient line. `amount` scales when the servings scaler changes. */
export interface Ingredient {
  amount?: number;
  unit?: string;
  item: string;
  note?: string;
}

export type MealType = (typeof MEAL_TYPES)[number];
export type Dietary = (typeof DIETARY)[number];
export type Difficulty = (typeof DIFFICULTY)[number];
export type Season = (typeof SEASONS)[number];
export type Occasion = (typeof OCCASIONS)[number];
export type Equipment = (typeof EQUIPMENT)[number];

/**
 * The recipe shape as it is handed to the client-side React island.
 * Dates are serialized to ISO strings (Date objects don't survive JSON),
 * and `totalTime`/`slug` are computed at build time so the client does no work.
 */
export interface RecipeData {
  slug: string;
  title: string;
  codeword: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  totalTime: number; // prepTime + cookTime, computed at build
  ingredients: Ingredient[];

  cuisine?: string;
  mealType?: MealType;
  protein?: string;
  dietary?: Dietary[];
  difficulty?: Difficulty;
  spiceLevel?: number;
  season?: Season[];
  occasion?: Occasion[];
  equipment?: Equipment[];
  source?: string;
  rating?: number;
  dateAdded?: string; // ISO string
  tags?: string[];
  image?: string;
}

/** Which key each URL query param maps to, for filter state (de)serialization. */
export interface FilterState {
  keywords: string[]; // search keyword tokens (AND-combined)
  cuisine: string[];
  mealType: string[];
  protein: string[];
  dietary: string[];
  difficulty: string[];
  spiceLevel: string[];
  season: string[];
  occasion: string[];
  equipment: string[];
  time: string; // one of '', '15', '30', '45', '60', '60+'
  sort: string; // 'date' | 'rating' | 'time' | 'alpha'
}
