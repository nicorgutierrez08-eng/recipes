/** One ingredient line. `amount` scales when the servings scaler changes. */
export interface Ingredient {
  amount?: number;
  unit?: string;
  us?: string; // common US measure, e.g. "1 cup"
  item: string;
  note?: string;
  estimated?: boolean;
}

export interface Nutrition {
  serving?: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
  status?: string;
}

/**
 * The recipe shape handed to the client-side React island. Imported from Nico's
 * master document, so nearly everything is optional.
 */
export interface RecipeData {
  slug: string;
  id: string;
  title: string;
  description?: string;

  servings?: number;
  servingSize?: string;
  totalTimeMin?: number;
  totalTimeText?: string;

  cuisine?: string;
  meal?: string;
  mealTags: string[];
  protein?: string;
  proteinTags: string[];
  difficulty?: string;
  difficultyText?: string;
  cost?: string;
  dietary?: string;
  dietaryTags: string[];
  tags: string[];
  allergens?: string;
  equipment?: string;
  cookingMethod?: string;
  flavor?: string;
  texture?: string;
  mealPrep?: string;
  freezer?: string;
  storage?: string;

  source?: string;
  verification?: string;
  provenance?: string;

  nutrition?: Nutrition;
  keywords: string[];
  ingredients: Ingredient[];
  image?: string;
}

/** Which key each URL query param maps to, for filter state (de)serialization. */
export interface FilterState {
  keywords: string[];
  meal: string[];
  protein: string[];
  tags: string[];
  difficulty: string[];
  cost: string[];
  verification: string[];
  time: string;
  sort: string;
}
