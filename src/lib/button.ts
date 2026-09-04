import clsx from "clsx";

/**
 * Shared button styling.
 *
 * The same pill button had drifted into seven different padding combinations
 * across the app (`px-6 py-3`, `px-8 py-3.5`, `px-5 py-2.5`, `px-8 py-4`, …),
 * so the "same" call to action rendered 44px tall on one page and 50px on the
 * next. Sizes live here now so they can't drift again.
 *
 * Header chrome (the cart and account pills) and icon-only buttons are
 * deliberately outside this scale — they're compact by design and consistent
 * with each other.
 */
export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

// Every variant carries a 1px border — transparent on the filled one. Without
// it the outlined button is 2px taller than the filled one, and because they sit
// in a flex row together the filled one stretches to match, so the "same" button
// measured 48px alone and 50px beside a sibling.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full border font-medium transition " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/** sm ≈ 32px · md ≈ 44px · lg ≈ 48px */
const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-sm",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-ink text-paper hover:bg-ink/85",
  secondary: "border-line text-ink hover:border-ink",
};

export function buttonClass(options?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
}): string {
  const { variant = "primary", size = "md", full = false, className } = options ?? {};
  return clsx(BASE, SIZES[size], VARIANTS[variant], full && "w-full", className);
}
