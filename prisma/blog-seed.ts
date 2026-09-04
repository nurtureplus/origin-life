export const BLOG_CATEGORIES = ["New Supplements", "Health Insights", "Brand"] as const;

export const blogPosts = [
  {
    slug: "introducing-clarity-nootropic-stack",
    title: "Introducing Clarity: our nootropic stack for deep work",
    excerpt:
      "Why we built a focus formula around Lion's Mane, Alpha-GPC and citicoline — and the doses behind each one.",
    category: "New Supplements",
    author: "OriginLife",
    readMinutes: 5,
    featured: true,
    coverImage: "/blog/clarity-launch.svg",
    content: `Clarity is the fourth formula in the OriginLife line, and the one we spent longest getting right. It's built for the kind of work that needs an hour of uninterrupted attention, not a five-minute jolt.

## What's in it, and why

Lion's Mane Extract 500mg supports long-term cognitive health. It isn't a stimulant — you won't feel it in twenty minutes — but it's the ingredient we'd least want to leave out.

Alpha-GPC 300mg is a choline source that crosses into the brain readily. Choline is the raw material for acetylcholine, the neurotransmitter most associated with attention and recall.

Citicoline 250mg does related work through a different pathway, which is why we include both rather than doubling one.

Bacopa Monnieri 200mg has the longest traditional history of the four, and the research is most consistent around memory over sustained use.

## Why no caffeine

Plenty of focus products lean on caffeine because the effect is immediate and obvious. It also wears off, and the crash tends to arrive right when you need a second working session.

Clarity is caffeine-free by design. If you want a lift on top of it, that's a choice you can make with a coffee — rather than one the formula makes for you.

## How we'd stack it

Clarity sits comfortably on top of Core, our daily foundation. If your bottleneck is energy rather than attention, Rise is the better starting point. If you're sleeping badly, start with Calm — no nootropic compensates for a short night.`,
  },
  {
    slug: "magnesium-glycinate-vs-oxide",
    title: "Not all magnesium is the same: glycinate vs oxide",
    excerpt:
      "The form on the label changes how much your body can actually absorb. Here's why we chose glycinate for Calm.",
    category: "Health Insights",
    author: "OriginLife",
    readMinutes: 4,
    featured: true,
    coverImage: "/blog/magnesium.svg",
    content: `Magnesium is one of the most common supplement ingredients on the shelf, and one of the most inconsistently formulated. Two products can both say "magnesium 300mg" and behave very differently.

## The form matters more than the number

Magnesium oxide is cheap and dense, which makes it attractive on a label — you can claim a high milligram count in a small capsule. The tradeoff is absorption. A large share passes through undigested, which is also why it has a reputation for digestive upset.

Magnesium glycinate binds magnesium to glycine, an amino acid. It absorbs more readily and is markedly gentler on the stomach. Glycine has a mild calming character of its own, which is a useful fit for an evening formula.

## What to look for on a label

Check whether the label names the form at all. "Magnesium 400mg" with no form stated is a warning sign. So is a "proprietary blend" that lists magnesium alongside other ingredients without breaking out the doses.

The honest version of a label tells you the compound and the amount: magnesium glycinate, 300mg. That's what we print on Calm, alongside L-Theanine 200mg, Apigenin 50mg and Glycine 500mg.

## The practical takeaway

If magnesium hasn't worked for you before, it's worth checking which form you were taking. The mineral may not have been the problem.`,
  },
  {
    slug: "what-proprietary-blend-hides",
    title: "What a “proprietary blend” actually hides",
    excerpt:
      "The phrase is legal, common, and tells you almost nothing. Here's how to read past it.",
    category: "Health Insights",
    author: "OriginLife",
    readMinutes: 4,
    featured: false,
    coverImage: "/blog/proprietary-blends.svg",
    content: `Turn over most supplement bottles and you'll find a line like: "Proprietary Focus Blend — 1,200mg" followed by a list of ingredients. It looks like disclosure. It isn't.

## What the number does and doesn't tell you

The 1,200mg is the total for every ingredient combined. The individual amounts aren't stated. A blend can lead with an impressive-sounding botanical and contain a few milligrams of it, with cheap filler making up the rest of the weight.

Ingredients are usually listed in descending order by quantity, which is the only signal you get. It tells you the ranking, never the gap. First place could be 1,100mg or 300mg.

## Why brands use them

The standard defence is recipe protection — that publishing doses lets competitors copy the formula. In practice, ingredient lists are already public and dosing research is published. What the blend protects is the margin.

## How to read a label instead

Look for a per-ingredient amount next to every active. Compare those amounts against the doses used in the research you can find for that ingredient. If a formula lists 50mg of something studied at 500mg, the number is decorative.

That standard is why OriginLife has no proprietary blends in any formula. Every active ingredient is printed with its dose, because a dose you can't see is a dose you can't evaluate.`,
  },
  {
    slug: "adaptogens-energy-without-the-crash",
    title: "Adaptogens and the case for energy without caffeine",
    excerpt:
      "Rhodiola and ginseng work differently from a stimulant. What that means for how the day actually feels.",
    category: "Health Insights",
    author: "OriginLife",
    readMinutes: 5,
    featured: false,
    coverImage: "/blog/adaptogens.svg",
    content: `Caffeine borrows energy against later in the day. Adaptogens are a different proposition — slower to notice, and without the same trough afterwards.

## What the word means

"Adaptogen" describes plants studied for helping the body cope with physical and mental load. It's a category, not a guarantee, and the quality of evidence varies a great deal between individual herbs.

Rhodiola Rosea has the more consistent research behind it, particularly around perceived fatigue during demanding stretches. Panax Ginseng has a long traditional record and a reasonable modern literature.

## Why we pair them with B vitamins

Adaptogens don't create energy from nothing. The B-complex vitamins are involved in turning food into usable cellular energy — they're the machinery rather than the fuel. Pairing them is why Rise includes a full B-complex alongside Rhodiola 300mg and Panax Ginseng 200mg, plus L-Tyrosine 500mg.

## Setting expectations honestly

You will not feel an adaptogen the way you feel an espresso, and any brand promising that is overselling. What people more commonly report over consistent use is that the afternoon dip is less pronounced.

If you want an immediate lift, have the coffee. If you want the shape of the day to change, that's a different and slower thing.`,
  },
  {
    slug: "collagen-what-to-expect",
    title: "Collagen: what it can do, and what it can't",
    excerpt:
      "A straight read on marine collagen, vitamin C, and realistic timelines for Glow.",
    category: "New Supplements",
    author: "OriginLife",
    readMinutes: 4,
    featured: false,
    coverImage: "/blog/collagen.svg",
    content: `Collagen is one of the most marketed supplements going, which makes it one of the harder ones to think clearly about.

## What it is

Collagen is the structural protein in skin, hair, nails and connective tissue. Production declines gradually with age — that part isn't controversial.

Hydrolysed collagen has been broken into smaller peptides so it can be absorbed. Glow uses hydrolysed marine collagen at 5g, which is within the range used in most published work.

## Why vitamin C is in the formula

Your body can't synthesise collagen without vitamin C — it's a required cofactor in the process. Taking collagen without adequate vitamin C leaves part of the pathway short. Glow includes 90mg alongside hyaluronic acid 100mg and biotin 2500mcg.

## Realistic timelines

Skin and nail turnover is slow. Studies that report changes generally run eight to twelve weeks, not one. If a product promises visible results in a week, the timeline is a marketing decision rather than a biological one.

Collagen also isn't a substitute for sun protection or sleep, both of which do more for skin than any capsule. It's a contributor, not a replacement.`,
  },
  {
    slug: "why-we-third-party-test",
    title: "Why we send every batch to a lab we don't own",
    excerpt:
      "In-house testing is a brand marking its own homework. Here's what independent verification actually checks.",
    category: "Brand",
    author: "OriginLife",
    readMinutes: 3,
    featured: false,
    coverImage: "/blog/third-party-testing.svg",
    content: `A supplement label is a claim. Third-party testing is the part that turns it into a verified statement.

## What gets checked

Potency — whether the amount in the capsule matches the amount on the label. Formulas can lose potency in manufacturing or over shelf life, and the only way to know is to measure.

Purity — screening for heavy metals and contaminants. This matters most for botanical and marine ingredients, which draw from soil and seawater.

Identity — confirming the ingredient is what the supplier said it was. Botanical adulteration is a real and documented problem in the industry.

## Why independence is the point

Plenty of brands test in-house, and in-house testing is genuinely useful for catching problems early. It just isn't verification, because the party doing the measuring is the party with a commercial interest in the result.

An independent lab has no stake in whether a batch passes. That's precisely what makes the result worth anything.

## What this means in practice

Every OriginLife batch is tested by an independent lab before it's cleared to ship. When a batch doesn't meet spec, it doesn't go out — which occasionally means a formula is briefly unavailable. We'd rather explain a delay than a discrepancy.`,
  },
];
