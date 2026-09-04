import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { blogPosts } from "./blog-seed";

const prisma = new PrismaClient();

const products = [
  {
    slug: "rise",
    name: "Rise",
    tagline: "Clean morning energy, no crash",
    description:
      "A caffeine-free adaptogen blend formulated to lift energy and mental drive without the jitter or afternoon crash. Rhodiola and ginseng work with a slow-release B-complex to keep output steady from the first hour of the day.",
    benefits: ["Sustained energy", "No jitters or crash", "Sharper morning focus", "Caffeine-free"],
    ingredients: ["Rhodiola Rosea 300mg", "Panax Ginseng 200mg", "Vitamin B-Complex", "L-Tyrosine 500mg"],
    priceCents: 149900,
    compareAtCents: 179900,
    category: "Energy",
    badge: "Bestseller",
    image: "/products/rise.svg",
    featured: true,
  },
  {
    slug: "calm",
    name: "Calm",
    tagline: "Fall asleep faster, wake up clear",
    description:
      "Magnesium glycinate and L-theanine dial the nervous system down at night, easing you into deeper sleep without any morning grogginess. Built for people who lie awake replaying the day.",
    benefits: ["Faster sleep onset", "Deeper, uninterrupted rest", "No morning grogginess", "Non-habit-forming"],
    ingredients: ["Magnesium Glycinate 300mg", "L-Theanine 200mg", "Apigenin 50mg", "Glycine 500mg"],
    priceCents: 159900,
    compareAtCents: null,
    category: "Sleep",
    badge: null,
    image: "/products/calm.svg",
    featured: true,
  },
  {
    slug: "clarity",
    name: "Clarity",
    tagline: "Nootropic focus for deep work",
    description:
      "A precision nootropic stack designed for long stretches of concentrated work. Lion's Mane supports long-term cognitive health while Alpha-GPC and citicoline sharpen recall and attention in the moment.",
    benefits: ["Sharper focus", "Better working memory", "Supports long-term brain health", "Smooth, clean lift"],
    ingredients: ["Lion's Mane Extract 500mg", "Alpha-GPC 300mg", "Citicoline 250mg", "Bacopa Monnieri 200mg"],
    priceCents: 179900,
    compareAtCents: 209900,
    category: "Focus",
    badge: "New",
    image: "/products/clarity.svg",
    featured: true,
  },
  {
    slug: "flow",
    name: "Flow",
    tagline: "Joint and recovery support",
    description:
      "High-potency omega-3s paired with curcumin and boswellia to support joint comfort and faster recovery between training sessions. Formulated for people who move every day.",
    benefits: ["Joint comfort", "Faster recovery", "Reduced exercise-induced inflammation", "Heart health support"],
    ingredients: ["Omega-3 EPA/DHA 1000mg", "Curcumin (95% Curcuminoids) 500mg", "Boswellia Serrata 300mg", "Black Pepper Extract"],
    priceCents: 189900,
    compareAtCents: null,
    category: "Recovery",
    badge: null,
    image: "/products/flow.svg",
    featured: false,
  },
  {
    slug: "glow",
    name: "Glow",
    tagline: "Collagen support, from within",
    description:
      "Hydrolyzed marine collagen with vitamin C to support skin elasticity, hair strength, and joint tissue. Unflavored and dissolves clean — built to disappear into your routine.",
    benefits: ["Skin elasticity", "Stronger hair and nails", "Supports collagen synthesis", "Unflavored"],
    ingredients: ["Hydrolyzed Marine Collagen 5g", "Vitamin C 90mg", "Hyaluronic Acid 100mg", "Biotin 2500mcg"],
    priceCents: 219900,
    compareAtCents: 249900,
    category: "Beauty",
    badge: null,
    image: "/products/glow.svg",
    featured: false,
  },
  {
    slug: "core",
    name: "Core",
    tagline: "One foundational multivitamin",
    description:
      "A complete daily foundation built at clinically studied doses, not the fractional amounts most multivitamins hide behind. Everything else in the line is built to stack on top of this.",
    benefits: ["Complete daily coverage", "Clinically studied doses", "Third-party tested", "Simplifies your stack"],
    ingredients: ["Vitamin D3 2000IU", "Vitamin K2 100mcg", "Zinc Picolinate 15mg", "Full B-Complex", "Selenium 100mcg"],
    priceCents: 129900,
    compareAtCents: null,
    category: "Foundations",
    badge: "Bestseller",
    image: "/products/core.svg",
    featured: true,
  },
];

const promos = [
  {
    slug: "clarity-launch",
    title: "Introducing Clarity",
    subtitle: "Our new nootropic stack for deep, sustained focus — out now.",
    image: "/promos/promo-teal.svg",
    badge: "New release",
    ctaLabel: "Shop Clarity",
    ctaHref: "/products/clarity",
    order: 0,
  },
  {
    slug: "free-shipping",
    title: "Free shipping over ₹999",
    subtitle: "Build your stack and get it delivered on us.",
    image: "/promos/promo-green.svg",
    badge: "Storewide",
    ctaLabel: "Shop all products",
    ctaHref: "/products",
    order: 1,
  },
  {
    slug: "core-foundation",
    title: "Start with Core",
    subtitle: "One daily foundation, clinically dosed — build everything else on top.",
    image: "/promos/promo-orange.svg",
    badge: "Bestseller",
    ctaLabel: "Shop Core",
    ctaHref: "/products/core",
    order: 2,
  },
];

// Sample reels. Video + poster are generated by scripts/gen-sample-reels.mjs.
const reels = [
  {
    title: "The 30-second morning stack",
    videoUrl: "/reels/morning-stack.mp4",
    thumbnail: "/reels/morning-stack.jpg",
    instagramUrl: null,
    order: 0,
  },
  {
    title: "How to read a supplement label",
    videoUrl: "/reels/read-the-label.mp4",
    thumbnail: "/reels/read-the-label.jpg",
    instagramUrl: null,
    order: 1,
  },
  {
    title: "Our 3-step wind-down routine",
    videoUrl: "/reels/wind-down.mp4",
    thumbnail: "/reels/wind-down.jpg",
    instagramUrl: null,
    order: 2,
  },
];

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        ...p,
        benefits: JSON.stringify(p.benefits),
        ingredients: JSON.stringify(p.ingredients),
      },
      create: {
        ...p,
        benefits: JSON.stringify(p.benefits),
        ingredients: JSON.stringify(p.ingredients),
      },
    });
  }

  for (const p of promos) {
    await prisma.promo.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  // Stagger publish dates so the blog reads as a real timeline rather than
  // six posts published in the same second.
  const now = Date.now();
  for (const [i, post] of blogPosts.entries()) {
    const publishedAt = new Date(now - i * 6 * 24 * 60 * 60 * 1000);
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { ...post, publishedAt },
      create: { ...post, publishedAt },
    });
  }

  // Reel has no natural unique key, so match on videoUrl to stay idempotent
  // across repeated seeds.
  for (const reel of reels) {
    const existing = await prisma.reel.findFirst({ where: { videoUrl: reel.videoUrl } });
    if (existing) {
      await prisma.reel.update({ where: { id: existing.id }, data: reel });
    } else {
      await prisma.reel.create({ data: reel });
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@originlife.co";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash, name: "Admin" },
  });

  console.log(
    `Seeded ${products.length} products, ${promos.length} promos, ${reels.length} reels, ${blogPosts.length} blog posts, and admin user (${adminEmail}).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
