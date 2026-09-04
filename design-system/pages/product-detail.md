# Page override — Product detail (`/products/[slug]`)

Overrides `design-system/MASTER.md` for this route only. Everything not stated here
follows Master.

## Why this page deviates

It is the highest-intent page on the site and the only one with a legal information burden.
Two Master defaults are relaxed for it.

## Deviations

1. **Sticky buy bar below 768px.** Master says CTAs live inline in the flow. Here, once the
   inline Add to Cart scrolls out of view on mobile, a fixed bar pins to the bottom
   (`z-30`, `bg-paper`, top hairline, safe-area inset padding) carrying price + Add to Cart.
   It must not overlap the footer or the cart drawer.

2. **Denser section rhythm below the fold.** `py-24` between the info blocks makes the page
   endless. Use `py-12` between accordion/detail sections; keep `py-24` only around the
   reviews and the closing cross-sell.

## Required layout slots

Desktop: gallery left, buy panel right (sticky within its column). Mobile: gallery, then
buy panel, then details.

Buy panel order — do not reshuffle:

```
Name → rating (count) → price + compare-at + savings → stock state →
quantity stepper → Add to Cart (lg) → Buy Now (secondary) → delivery info
```

Below the fold, in this order:

```
Description · Benefits · Ingredients · Nutritional information · Serving size ·
How to use · Warnings & precautions · Allergens · Storage · Manufacturer &
license details · FAQ · Reviews · Frequently bought together
```

The compliance block (ingredients through license details) is a **layout requirement** —
render the section with an empty/"not provided" state rather than omitting it when the
product record has no data. See Master §9 for the copy constraints.

## Implementation notes

- `StickyBuyBar` watches `#buy-panel` with an IntersectionObserver and slides in only once
  that anchor has left the viewport *upwards*. It is `inert` while hidden so its duplicate
  Add to Cart never appears twice in the tab order. The page carries `pb-28 md:pb-16` so the
  last section clears it.
- The rating in the buy panel links to `#reviews`; that section and `#label` both carry
  `scroll-mt-24` so the heading isn't left under the sticky header.
- `ProductLabelPanel` renders every compliance slot unconditionally, showing "Not provided"
  for empty fields. The fields live on `Product` and are edited under **Label & compliance**
  in the admin product form.
- The gallery image uses `next/image` with `fill`, `sizes` and `preload` (Next 16 deprecated
  `priority`). Seeded `.svg` art is passed through unoptimised automatically.
- `Product` and `BreadcrumbList` JSON-LD are emitted from the page; `aggregateRating` is
  omitted entirely when the product has no approved reviews.

## Still open

- No "frequently bought together" cross-sell — related products are category matches only.
- Single product image; there is no gallery with thumbnails.
