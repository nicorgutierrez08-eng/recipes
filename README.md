# 🍳 The Pantry — my personal recipe library

A warm, fast, **static** recipe website. One user (me), no accounts, no backend,
no database. Every recipe is a plain Markdown file with YAML frontmatter, so
**adding a recipe = dropping a new `.md` file into the `recipes/` folder and
rebuilding.** It deploys to GitHub Pages for free.

- **Live site:** https://nicorgutierrez08-eng.github.io/recipes/ *(after you turn on Pages — see below)*
- **Built with:** [Astro](https://astro.build) + a small React island for the instant, client-side filtering.

---

## 🧭 Table of contents

1. [Add a new recipe](#-add-a-new-recipe) ← the one you'll use most
2. [The frontmatter fields, explained](#-the-frontmatter-fields-explained)
3. [Preview locally](#-preview-locally)
4. [Publish your changes](#-publish-your-changes)
5. [Project structure](#-project-structure)

---

## ➕ Add a new recipe

1. Make a new file inside the **`recipes/`** folder. Name it something simple and
   lowercase with dashes, ending in `.md` — for example `recipes/lentil-curry.md`.
2. Copy the template below into it and change the values.
3. Preview or publish. That's it — the site picks the recipe up automatically.

> **Safety net:** the build **checks every recipe**. If you forget a required field
> or type something invalid (say a spice level of `9`), the build stops and tells
> you the **exact file and field** to fix. A broken recipe can never sneak onto
> the live site.

### Copy-paste template

```markdown
---
title: Lentil Curry
codeword: cozy-lentils        # your personal nickname — how you search for it
servings: 4
prepTime: 15                  # minutes
cookTime: 30                  # minutes
ingredients:
  - { amount: 1, unit: cup, item: red lentils, note: rinsed }
  - { amount: 1, unit: tbsp, item: curry powder }
  - { amount: 2, unit: cup, item: vegetable broth }
  - { item: salt, note: to taste }        # amount/unit are optional

# --- everything below is optional; delete any line you don't need ---
cuisine: indian
mealType: dinner              # breakfast | lunch | dinner | snack | dessert | drink
protein: none                 # chicken, beef, tofu, none, etc. (free text)
dietary: [vegan, gluten-free] # vegetarian | vegan | gluten-free | dairy-free
difficulty: easy              # easy | medium | hard
spiceLevel: 2                 # 0 to 3
season: [fall, winter]        # spring | summer | fall | winter
occasion: [weeknight, meal-prep]  # weeknight | meal-prep | date-night | party | holiday
equipment: [stovetop]         # oven | stovetop | blender | grill | instant-pot | no-cook | microwave | air-fryer
source: Grandma's recipe card # free text OR a full https:// link
rating: 5                     # your own rating, 1 to 5
dateAdded: 2026-07-21         # YYYY-MM-DD
tags: [cozy, budget]          # any free-form words you like
image: /images/lentil-curry.jpg   # optional; see "Adding a photo" below
---

Rinse the lentils and set them aside.

Toast the curry powder in a dry pot for 30 seconds until fragrant.

Add the lentils and broth, then simmer for 25 minutes until soft.

Season with salt and serve.
```

**The instructions are just the text below the second `---`.** Write one step per
paragraph (leave a blank line between steps). The site automatically numbers them.
A paragraph starting with `>` becomes a highlighted **note** instead of a step.

### Adding a photo (optional)

1. Put the image file in **`public/images/`** (e.g. `public/images/lentil-curry.jpg`).
2. In the recipe, set `image: /images/lentil-curry.jpg`.

Recipes **without** a photo still look intentional — they get a warm illustrated
card automatically, so don't feel you need a picture for every dish.

---

## 📋 The frontmatter fields, explained

**Required (the build fails without these):**

| Field | What it is |
|---|---|
| `title` | The recipe's real name. |
| `codeword` | Your short personal nickname. **Search matches this**, so make it memorable. |
| `servings` | A whole number. Powers the servings scaler on the recipe page. |
| `prepTime` / `cookTime` | Minutes, as numbers. The site adds them into a **total time**. |
| `ingredients` | A list of `{ amount, unit, item, note }`. Only `item` is required per line; `amount`, `unit`, and `note` are optional. |

**Optional (all of these become filters on the home page):** `cuisine`,
`mealType`, `protein`, `dietary`, `difficulty`, `spiceLevel`, `season`,
`occasion`, `equipment`, `source`, `rating`, `dateAdded`, `tags`, `image`.

The full, authoritative schema lives in [`src/content.config.ts`](src/content.config.ts) —
it's documented and is what the build validates against.

---

## 👀 Preview locally

You only need to do the install **once**.

```bash
npm install        # one-time: downloads what the site needs
npm run dev        # start a live preview
```

Then open the URL it prints (usually **http://localhost:4321/recipes**) in your
browser. Edits to recipes or code refresh instantly. Press `Ctrl + C` in the
terminal to stop.

To preview the exact production build:

```bash
npm run build      # builds into dist/ and validates every recipe
npm run preview    # serves the built site
```

---

## 🚀 Publish your changes

The site auto-deploys whenever the **`main`** branch updates.

```bash
git add .
git commit -m "Add lentil curry"
git push
```

Once you push to `main`, GitHub builds and publishes automatically (watch it in
the repo's **Actions** tab). Your live site updates in a minute or two at:

**https://nicorgutierrez08-eng.github.io/recipes/**

> First time only: enable Pages once (**Settings → Pages → Source: “GitHub
> Actions”**). After that you never touch it again.

---

## 🗂 Project structure

```
recipes/                  ← YOUR RECIPES LIVE HERE (one .md file each)
public/
  images/                 ← recipe photos + site icons
src/
  content.config.ts       ← the recipe schema (validated at build time)
  pages/
    index.astro           ← the library / home page
    [slug].astro          ← the single-recipe page
  components/             ← React islands (filtering, ingredient scaler, stars)
  lib/                    ← types + helpers (filtering, fraction formatting)
  styles/                ← the design system (palette, type, layout)
  layouts/Base.astro      ← shared header/footer shell
.github/workflows/deploy.yml  ← the GitHub Pages deploy
astro.config.mjs          ← site URL + base path (`/recipes`)
```

### A note on the design

Warm cookbook palette (paper + ink, paprika, sage, saffron), **Fraunces** for
display + **Inter** for UI, and a signature "kitchen label" treatment for each
recipe's codeword. Filtering is fully client-side and instant, filter state is
saved in the URL (so you can bookmark or share a filtered view), and the whole
thing is keyboard-accessible with visible focus states and reduced-motion
support.
