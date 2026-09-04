# OriginLife — Design System (Master)

Global source of truth for UI work in this repo. Page-specific deviations live in
`design-system/pages/<page>.md` and **override** this file; if no page file exists,
this file applies in full.

The tokens below are **descriptive, not aspirational** — they mirror
[`src/app/globals.css`](../src/app/globals.css) and [`src/lib/button.ts`](../src/lib/button.ts).
If you change one, change both.

---

## 1. Brand position

Premium · clean · clinical · natural. Editorial minimalism, not supplement-aisle loud.
The product photography and the ingredient/dose transparency carry the page; the UI stays quiet.

**Style:** Editorial Minimalism with soft ambient glow accents (hero/CTA only).

> The skill's generic recommendation for "nutraceutical e-commerce" was *Liquid Glass* with a
> cyan palette (`#0891B2` / `#22D3EE`) and Rubik/Nunito Sans. **Rejected on purpose.** This brand
> already has a deliberate, contrast-audited identity (deep forest accent, Century Gothic Pro
> headings) and Liquid Glass is flagged in the skill's own data as poor for performance and
> text contrast — both of which matter more than novelty on a product/checkout path.
> What was adopted from the skill: the *structural* guidance (section order, CTA placement,
> social-proof-before-CTA, sticky mobile buy bar) and the UX/a11y rules in §7.

---

## 2. Color tokens

Defined in `:root` in `globals.css`, exposed to Tailwind v4 through `@theme inline`.
**Use the Tailwind class (`bg-paper`, `text-ink-soft`), never a raw hex or a `var()` wrapper.**

### Surfaces
| Token | Class | Hex | Use |
|---|---|---|---|
| `--paper` | `bg-paper` | `#ffffff` | Default page surface |
| `--paper-soft` | `bg-paper-soft` | `#f8f9fc` | Alternating section bands, cards |
| `--paper-softer` | `bg-paper-softer` | `#eff2f7` | Insets, filled inputs, table headers |
| `--dark` | `bg-dark` | `#121317` | Footer, image wells, inverted blocks |
| `--dark-soft` | `bg-dark-soft` | `#1c1d21` | Raised elements on dark |

### Text
| Token | Class | Hex | Contrast floor | Use |
|---|---|---|---|---|
| `--ink` | `text-ink` | `#121317` | 17.4:1 | Headings, primary body |
| `--ink-soft` | `text-ink-soft` | `#45474d` | 9.2:1 | Secondary body, descriptions |
| `--ink-faint` | `text-ink-faint` | `#6a6e77` | 5.11 / 4.85 / 4.55 on paper/soft/softer | Eyebrows, meta, captions |
| `--ink-muted` | `text-ink-muted` | `#8a9199` | 3.03:1 — **large text only** | Watermark numerals ≥24px. Never body text. |
| `--dark-text` / `--dark-text-soft` | `text-dark-text` | `#f8f9fc` / 62% | — | Text on dark surfaces |

`--ink-faint` and `--ink-muted` were tuned against WCAG AA; the reasoning is commented in
`globals.css`. Do not lighten either one.

### Lines & accent
| Token | Class | Hex | Use |
|---|---|---|---|
| `--line` | `border-line` | `#e1e6ec` | Default border (also the global `*` border-color) |
| `--line-strong` | `border-line-strong` | `#cdd4dc` | Emphasised dividers, focused inputs |
| `--accent` | `bg-accent` | `#3d5b2a` | Deep forest — badges, selection, glow. 8.1:1 with `--accent-ink` |
| `--accent-ink` | `text-accent-ink` | `#ffffff` | Text on accent |

### Brand secondaries — decorative only
`--brand-orange #e29225` · `--brand-teal #6fc4c3` · `--brand-brown #5c441c` · `--brand-gray #6b6b6b`

Use for ambient glows, illustration, and category art. **Never** as a text color on paper
(orange is 2.3:1, teal 1.9:1) and never as the sole carrier of meaning.

### Semantic status (to add when order states need it)
Do not invent per-component colors. Extend `globals.css` with `--ok`, `--warn`, `--danger`
tokens and pair each with a text/icon token that clears 4.5:1 on `--paper`.

---

## 3. Typography

| Role | Font | Variable | Loaded by |
|---|---|---|---|
| Headings | Century Gothic Pro (local, 400) | `--font-heading` | `src/app/fonts.ts` |
| Body | Noto Sans Medium (local, 500) | `--font-body` | `src/app/fonts.ts` |

Both use `display: swap` and are self-hosted — **no Google Fonts CDN link**, it would add a
render-blocking third-party round trip and undo the local-font setup.

**Helpers** (`globals.css`): `.text-display` (heading font, `letter-spacing: -0.01em`,
`line-height: 0.98`) for hero/section headlines; `.text-tight` for smaller headings;
`font-heading` for card and sub-headings.

**Scale in use** — keep to it:

| Level | Classes |
|---|---|
| Page/hero | `text-display text-5xl md:text-6xl font-medium` |
| Section | `text-display text-4xl md:text-5xl font-medium` |
| Card / sub | `font-heading text-lg font-medium tracking-tight` |
| Body | `text-sm text-ink-soft` (long-form: `text-base`) |
| Eyebrow | `text-xs uppercase tracking-widest text-ink-faint` |
| Meta / price strike | `text-sm text-ink-faint` |

Body copy: `line-height` 1.5–1.75, measure capped at 65–75 characters (`max-w-2xl` for
prose, `max-w-md` for centered CTA copy). Minimum body size on mobile is 16px — do not
drop long-form copy to `text-xs`.

---

## 4. Layout

- **Container:** `.container-page` — `max-width: 84rem`, `padding-inline: 1.5rem`
  (`2.5rem` ≥768px). One container class. Do not mix in ad-hoc `max-w-6xl` / `max-w-7xl`.
- **Section rhythm:** `py-24` for marketing sections, `py-16` for index/listing pages,
  `py-12` for strips. Alternate `bg-paper` / `bg-paper-soft` — never two soft bands adjacent.
- **Grids:** products `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5`;
  editorial thirds `md:grid-cols-3 gap-10`.
- **Breakpoints to verify at:** 375 · 768 · 1024 · 1440. No horizontal scroll at any of them.
- **Radii:** `rounded-full` for buttons/pills/badges, `rounded-2xl` for cards and media wells.
  Nothing in between.
- **Z-index scale:** 10 sticky/nav · 20 dropdowns & floating icons · 30 drawers (cart, mobile
  nav) · 50 modals/toasts. Declare it; don't reach for `z-[9999]`.
- Fixed/sticky chrome must reserve its own height — no content tucked under the header.

---

## 5. Components

**Buttons — always `buttonClass()` from `src/lib/button.ts`.** Never hand-roll padding; the
sizes were consolidated after drifting into seven variants.

| Size | Height | Use |
|---|---|---|
| `sm` | ≈32px | Dense/inline actions only (not a primary tap target) |
| `md` | ≈44px | Default — meets the 44px touch minimum |
| `lg` | ≈48px | Hero and section CTAs |

Variants: `primary` (`bg-ink text-paper`), `secondary` (outlined). Every variant carries a
1px border so filled and outlined buttons measure the same in a flex row. Focus ring is built
in (`focus-visible:outline-2 outline-offset-2 outline-ink`) — don't strip it.

**Product card** (`src/components/ProductCard.tsx`): square media well on `bg-dark`, image
scales `1.04` on hover, border goes `line → ink`. Body order: category eyebrow → name →
tagline → price row with `QuickAddButton`. Hover must not change layout size — scale the
*image inside* an `overflow-hidden` well, never the card.

**Interactive surfaces:** `cursor-pointer` on everything clickable, `transition` at 150–300ms,
feedback on hover *and* focus. Icons are SVG (`src/components/icons.tsx`) — never emoji.

**Forms:** every input gets a real `<label for>` (placeholder is not a label). Errors render
next to the field that caused them, in text, not color alone. Submit buttons disable and show
a pending state during async work.

---

## 6. Motion

Named keyframes live in `globals.css`: `float-slow`, `float-chip`, `fade-up`,
`glow-drift-a/b/c`. Micro-interactions 150–300ms; ambient loops 6–17s.

Animate `transform` and `opacity` only. Never animate `width`, `height`, `top`, or `left`.

`prefers-reduced-motion` is handled in two places and both must stay: `HeroCarousel` checks
it in JS to skip autoplay, and `globals.css` carries the global stop that collapses every CSS
animation and transition. Durations collapse to `0.01ms` rather than `none` so animations
with a meaningful end state (`fade-up` finishing at opacity 1) still land on it.

---

## 7. Accessibility floor (non-negotiable)

- Body text ≥4.5:1, large text (≥24px) ≥3:1. `--ink-muted` is large-text-only.
- Visible focus state on every interactive element; tab order follows visual order.
- Touch targets ≥44×44px with ≥8px between neighbours.
- Icon-only buttons carry `aria-label`; decorative SVG gets `aria-hidden="true"`.
- Every meaningful image has descriptive `alt`; decorative images get `alt=""`.
- Color is never the only signal — pair with text, icon, or shape.
- Drawers/modals (cart, mobile nav) trap focus, close on `Esc`, and restore focus on close.
- `prefers-reduced-motion` respected (see §6).

---

## 8. E-commerce page patterns

Adopted from the skill's landing/product research, adapted to this brand.

**Home** — hero (single dominant CTA) → trust strip → featured products → proof/science →
social proof → closing CTA. Current order matches, with the stats strip serving as the trust
band.

**Product detail** — gallery left / buy panel right on desktop; stacked on mobile with a
**sticky add-to-cart bar** below 768px. Buy panel order: name → rating → price + savings →
stock → quantity → Add to Cart → delivery info. Below the fold: description, benefits,
ingredients, nutritional info, how to use, warnings, storage, FAQ, reviews.
Social proof sits *before* the second CTA.

**Listing** — filters as pills at top (current pattern), category state reflected in the URL
so it's shareable and indexable.

**Cart** — line items with quantity steppers, free-shipping progress bar, coupon field,
totals broken out (subtotal / discount / shipping / tax / total), then one primary CTA.

**Checkout** — one column, minimum fields, order summary always visible, no surprise costs
introduced after the first step. Never gate checkout behind account creation.

---

## 9. Compliance constraints on copy (nutraceutical)

UI copy must not claim to diagnose, cure, prevent, or treat disease. Structure/function
language only. Product pages need slots for: ingredient list, serving size, nutritional
information, suggested use, allergens, storage, warnings, manufacturer, and license/regulatory
details (FSSAI for India). Treat these as *layout requirements*, not optional fields —
build the components with the slots even when the data is not yet populated.

---

## 10. Anti-patterns

- Emoji used as icons.
- Hover effects that resize the element and shift surrounding layout.
- Raw hex values or `var(--token)` wrappers in JSX — use the Tailwind token class.
- Placeholder-as-label inputs.
- New container widths, radii, or button paddings outside the scales above.
- `--ink-muted` or a brand secondary as body-text color.
- Glassmorphism/translucent panels — off-brand here, and they fail contrast on `--paper`.
- Google Fonts CDN imports (fonts are self-hosted).
- Loading states that leave the UI frozen with no skeleton or spinner.

---

## 11. Pre-delivery checklist

- [ ] No emoji icons; all icons SVG from `src/components/icons.tsx`
- [ ] `buttonClass()` used for every button; no ad-hoc padding
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover/focus feedback, 150–300ms, no layout shift
- [ ] Text contrast ≥4.5:1 (large ≥3:1) on every surface used
- [ ] Visible focus rings; drawer/modal focus trap + `Esc`
- [ ] Touch targets ≥44px, ≥8px apart
- [ ] All images have `alt`; below-fold images `loading="lazy"`
- [ ] `prefers-reduced-motion` respected
- [ ] Verified at 375 / 768 / 1024 / 1440 with no horizontal scroll
- [ ] Async actions show pending → success/error
