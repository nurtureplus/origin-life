import type { WellnessIconName } from "@/components/icons";

/**
 * The shop-by-concern taxonomy. Shared by the nav dropdown and the
 * /shop-by-concern landing page so the two can never drift apart.
 * `category` matches Product.category in the database.
 */
export type Concern = {
  category: string;
  label: string;
  href: string;
  icon: WellnessIconName;
  blurb: string;
  description: string;
};

export const CONCERNS: Concern[] = [
  {
    category: "Energy",
    label: "Energy",
    href: "/products?category=Energy",
    icon: "sun",
    blurb: "Sustained lift, no crash",
    description:
      "Caffeine-free adaptogens and a full B-complex for output that holds through the afternoon.",
  },
  {
    category: "Sleep",
    label: "Sleep",
    href: "/products?category=Sleep",
    icon: "moon",
    blurb: "Fall asleep, wake clear",
    description:
      "Magnesium glycinate and L-theanine to wind the nervous system down — without morning grogginess.",
  },
  {
    category: "Focus",
    label: "Focus",
    href: "/products?category=Focus",
    icon: "sparkle",
    blurb: "For long, deep work",
    description:
      "A precision nootropic stack for the stretches that need an hour of uninterrupted attention.",
  },
  {
    category: "Recovery",
    label: "Recovery",
    href: "/products?category=Recovery",
    icon: "molecule",
    blurb: "Joints and bounce-back",
    description:
      "Omega-3s, curcumin and boswellia for joint comfort and faster turnaround between sessions.",
  },
  {
    category: "Beauty",
    label: "Beauty",
    href: "/products?category=Beauty",
    icon: "heart",
    blurb: "Skin, hair and nails",
    description:
      "Hydrolysed marine collagen with the vitamin C your body needs to actually use it.",
  },
  {
    category: "Foundations",
    label: "Foundations",
    href: "/products?category=Foundations",
    icon: "leaf",
    blurb: "Your daily baseline",
    description:
      "One complete multivitamin at clinically studied doses — the base everything else stacks on.",
  },
];
