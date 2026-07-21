import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * RECIPE FRONTMATTER SCHEMA
 * -------------------------
 * Every recipe is a markdown file in the top-level `/recipes/` folder.
 * Its YAML frontmatter is validated against this schema AT BUILD TIME.
 *
 * If a recipe is malformed (missing a required field, wrong type, or an
 * out-of-range value), `astro build` fails with an error naming the offending
 * file and field — so a broken recipe can never ship silently.
 *
 * See README.md ("Adding a new recipe") for a copy-paste template.
 */

// --- Controlled vocabularies (kept as const so the UI can enumerate them) ---
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'] as const;
export const DIETARY = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'] as const;
export const DIFFICULTY = ['easy', 'medium', 'hard'] as const;
export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;
export const OCCASIONS = ['weeknight', 'meal-prep', 'date-night', 'party', 'holiday'] as const;
export const EQUIPMENT = ['oven', 'stovetop', 'blender', 'grill', 'instant-pot', 'no-cook', 'microwave', 'air-fryer'] as const;

/** A single ingredient line. `amount` is a number so it can be scaled. */
const ingredientSchema = z.object({
  amount: z.number().nonnegative().optional(),
  unit: z.string().optional(),
  item: z.string().min(1, 'ingredient "item" cannot be empty'),
  note: z.string().optional(),
});

const recipes = defineCollection({
  // Load markdown from the project-root /recipes folder.
  // Drop a new *.md file in there and rebuild — that's the whole workflow.
  loader: glob({ pattern: '**/*.md', base: './recipes' }),
  schema: z.object({
    // --- Required ---
    title: z.string().min(1),
    /** Short unique personal nickname — the primary way you search for a recipe. */
    codeword: z.string().min(1),
    servings: z.number().int().positive(),
    prepTime: z.number().int().nonnegative(), // minutes
    cookTime: z.number().int().nonnegative(), // minutes
    ingredients: z.array(ingredientSchema).min(1, 'a recipe needs at least one ingredient'),

    // --- Optional metadata (all filterable) ---
    cuisine: z.string().optional(),
    mealType: z.enum(MEAL_TYPES).optional(),
    protein: z.string().optional(),
    dietary: z.array(z.enum(DIETARY)).optional(),
    difficulty: z.enum(DIFFICULTY).optional(),
    spiceLevel: z.number().int().min(0).max(3).optional(),
    season: z.array(z.enum(SEASONS)).optional(),
    occasion: z.array(z.enum(OCCASIONS)).optional(),
    equipment: z.array(z.enum(EQUIPMENT)).optional(),
    source: z.string().optional(),
    rating: z.number().int().min(1).max(5).optional(),
    dateAdded: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    /** Path relative to /public, e.g. "/images/tacos.jpg". */
    image: z.string().optional(),
  }),
});

export const collections = { recipes };
