export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** The label / compliance block, as edited in admin and shown on the page. */
export type ProductLabelDTO = {
  servingSize: string | null;
  servingsPerPack: number | null;
  nutritionFacts: string | null;
  directions: string | null;
  warnings: string | null;
  allergens: string | null;
  storage: string | null;
  manufacturer: string | null;
  fssaiLicense: string | null;
  countryOfOrigin: string | null;
  shelfLifeMonths: number | null;
};

export type ProductDTO = ProductLabelDTO & {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  priceCents: number;
  compareAtCents: number | null;
  category: string;
  badge: string | null;
  image: string;
  stock: number;
  featured: boolean;
  active: boolean;
};

export function toProductDTO(
  p: ProductLabelDTO & {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    benefits: string;
    ingredients: string;
    priceCents: number;
    compareAtCents: number | null;
    category: string;
    badge: string | null;
    image: string;
    stock: number;
    featured: boolean;
    active: boolean;
  }
): ProductDTO {
  return {
    ...p,
    benefits: JSON.parse(p.benefits),
    ingredients: JSON.parse(p.ingredients),
  };
}
