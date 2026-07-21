import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * RECIPE FRONTMATTER SCHEMA
 * -------------------------
 * Recipes live as markdown files in the top-level `/recipes/` folder and are
 * validated against this schema at build time. The library was imported from
 * Nico's master document (122 Instagram-sourced records), so most fields are
 * optional — a record only carries what was recoverable from its source.
 *
 * Required: `id` and `title`. Everything else is optional.
 */

const ingredientSchema = z.object({
  amount: z.number().optional(),
  unit: z.string().optional(),
  us: z.string().optional(), // common US measure, e.g. "1 cup"
  item: z.string().min(1),
  note: z.string().optional(),
  estimated: z.boolean().optional(), // true when the quantity is an editorial estimate
});

const storageSchema = z
  .object({
    fridge: z.string().optional(),
    freezer: z.string().optional(),
    reheat: z.string().optional(),
    bestFresh: z.boolean().optional(),
  })
  .optional();

const editorialNotesSchema = z
  .object({
    fromSource: z.string().optional(),
    inferred: z.string().optional(),
    addedForUsability: z.string().optional(),
    nutritionRecalculated: z.boolean().optional(),
  })
  .optional();

const nutritionSchema = z
  .object({
    serving: z.string().optional(),
    calories: z.string().optional(),
    protein: z.string().optional(),
    carbs: z.string().optional(),
    fat: z.string().optional(),
    fiber: z.string().optional(),
    sugar: z.string().optional(),
    sodium: z.string().optional(),
    status: z.string().optional(),
  })
  .optional();

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './recipes' }),
  schema: z.object({
    // --- Identity ---
    id: z.string().min(1), // stable internal ID, e.g. "R0001"
    codeword: z.string().optional(), // set to the ID; the searchable handle
    title: z.string().min(1),
    description: z.string().optional(),

    // --- Practical ---
    servings: z.number().optional(),
    servingSize: z.string().optional(),
    totalTimeMin: z.number().optional(), // parsed minutes, when known (drives time filter)
    totalTimeText: z.string().optional(), // original wording, e.g. "About 20 min"

    // --- Classification (free text from source) + normalized facet tags ---
    cuisine: z.string().optional(),
    meal: z.string().optional(),
    mealTags: z.array(z.string()).optional(),
    protein: z.string().optional(),
    proteinTags: z.array(z.string()).optional(),
    difficulty: z.string().optional(),
    difficultyText: z.string().optional(),
    cost: z.string().optional(),
    dietary: z.string().optional(),
    dietaryTags: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(), // rich attribute tags (low-calorie, quick, air-fryer, …)
    allergens: z.string().optional(),
    equipment: z.string().optional(),
    cookingMethod: z.string().optional(),
    flavor: z.string().optional(),
    texture: z.string().optional(),
    mealPrep: z.string().optional(),
    freezer: z.string().optional(),
    storage: z.string().optional(),

    // --- Provenance ---
    source: z.string().optional(), // original Instagram reel URL
    verification: z.string().optional(), // A / B / C / D

    // --- Nutrition ---
    nutrition: nutritionSchema,

    // --- Provenance & editorial completion (two-layer model) ---
    provenance: z.string().optional(), // Original | Creator-stated | Editorially completed | Culinary reconstruction | Incomplete
    editorialCompletionStatus: z.string().optional(),
    confidenceLevel: z.string().optional(),
    editorialNotes: editorialNotesSchema,
    nutritionBasis: z.string().optional(),

    // Source layer (exactly what was recovered)
    sourceIngredients: z.array(ingredientSchema).optional(),
    sourceInstructions: z.array(z.string()).optional(),

    // Working layer (completed for usability)
    workingYield: z.number().optional(),
    yieldUnit: z.string().optional(),
    workingPrepTime: z.number().optional(),
    workingCookTime: z.number().optional(),
    workingTotalTime: z.number().optional(),
    workingIngredients: z.array(ingredientSchema).optional(),
    workingInstructions: z.array(z.string()).optional(),
    substitutions: z.array(z.string()).optional(),
    storage: storageSchema,
    workingNutrition: z
      .object({
        calories: z.string().optional(),
        protein: z.string().optional(),
        carbs: z.string().optional(),
        fat: z.string().optional(),
        basis: z.string().optional(),
      })
      .optional(),

    // --- Search + content ---
    keywords: z.array(z.string()).optional(),
    ingredients: z.array(ingredientSchema).optional(), // display list (working ?? source)
    image: z.string().optional(),
  }),
});

export const collections = { recipes };
