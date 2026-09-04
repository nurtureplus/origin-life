import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY, SHIPPING } from "@/lib/company";
import { formatPrice } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the questions we get most often about OriginLife formulas, orders, delivery and returns.",
  alternates: { canonical: "/faq" },
};

type Faq = { q: string; a: string };

const GROUPS: { title: string; items: Faq[] }[] = [
  {
    title: "Products",
    items: [
      {
        q: "What does “clinically dosed” mean?",
        a: "Every active ingredient is included at the amount used in the published research behind it, rather than a token amount added so it can appear on the label. The exact dose of every ingredient is printed on each product page.",
      },
      {
        q: "Why don’t you use proprietary blends?",
        a: "A proprietary blend lists ingredients without their individual doses, so there is no way to tell whether an ingredient is present in a meaningful amount. We publish every gram of every ingredient instead.",
      },
      {
        q: "Are your products tested?",
        a: "Every batch is tested by an independent laboratory for purity and potency before it ships.",
      },
      {
        q: "Can I take more than one formula at a time?",
        a: "The range is designed to stack. Follow the directions on each label, don’t exceed the stated intake for any single product, and speak to a registered medical practitioner if you take prescription medication.",
      },
      {
        q: "Are they vegetarian? Do they contain allergens?",
        a: "Allergen and dietary information is listed on each product page under Supplement facts. If the information you need isn’t there, contact us before ordering.",
      },
      {
        q: "Will this cure or treat my condition?",
        a: "No. These are nutritional supplements, not medicines, and they are not intended to diagnose, treat, cure or prevent any disease. If you are managing a health condition, talk to your doctor.",
      },
    ],
  },
  {
    title: "Orders & delivery",
    items: [
      {
        q: "How long will my order take?",
        a: `Orders are dispatched within ${SHIPPING.dispatchWindow}. Delivery then takes ${SHIPPING.metroDelivery} in metro cities and ${SHIPPING.restOfIndiaDelivery} elsewhere in India.`,
      },
      {
        q: "How much is shipping?",
        a: `Free over ${formatPrice(SHIPPING.freeShippingThresholdPaise)}. Below that, a flat ${formatPrice(SHIPPING.flatRatePaise)} is added and shown at checkout before you pay.`,
      },
      {
        q: "Can I track my order?",
        a: "Yes. Tracking details are emailed when your order is dispatched, and every order’s status is visible in your account.",
      },
      {
        q: "Do you ship outside India?",
        a: "Not currently.",
      },
      {
        q: "Can I cancel or change my order?",
        a: "Yes, any time before it is dispatched — email us with your order number. After dispatch, our returns policy applies.",
      },
    ],
  },
  {
    title: "Returns & payments",
    items: [
      {
        q: "Can I return a supplement?",
        a: `Unopened, sealed products can be returned within ${SHIPPING.returnWindowDays} days of delivery. Anything wrong, damaged or expired on arrival is replaced or refunded regardless of seal.`,
      },
      {
        q: "How long does a refund take?",
        a: `Refunds are initiated within ${SHIPPING.refundWindowDays} business days of the returned item reaching us. Your bank may take a further 5–7 business days to post it.`,
      },
      {
        q: "Which payment methods do you accept?",
        a: "UPI, credit and debit cards, net banking and wallets, through our payment gateway. We never see or store your card or UPI credentials.",
      },
      {
        q: "What are Life Coins?",
        a: "Coins earned on delivered orders that can be redeemed against a future order. They expire 60 days after they are earned and are spent soonest-expiring first. Your balance and expiry dates are in your account.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-page py-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />
      {/* Deliberately no FAQPage structured data: Google now shows FAQ rich
          results only for a short list of authoritative sites, and marking up
          a commercial FAQ page gains nothing while adding a maintenance
          burden that silently rots as the answers change. */}

      <div className="mx-auto max-w-3xl">
        <h1 className="text-display text-4xl font-medium md:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          If your question isn&apos;t here, email{" "}
          <a
            href={`mailto:${COMPANY.supportEmail}`}
            className="text-ink underline underline-offset-4"
          >
            {COMPANY.supportEmail}
          </a>
          .
        </p>

        <div className="mt-14 space-y-14">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="text-xs uppercase tracking-widest text-ink-faint">{group.title}</h2>
              <div className="mt-4 divide-y divide-line border-t border-line">
                {group.items.map((item) => (
                  // <details> gives keyboard support, find-in-page and a
                  // working no-JS fallback for free — a custom accordion here
                  // would be more code and less accessible.
                  <details key={item.q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                      {item.q}
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-ink-faint transition-transform group-open:rotate-45"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.5]">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-line bg-paper-soft p-6">
          <h2 className="font-heading text-lg font-medium tracking-tight">Still stuck?</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Our support team answers within one working day.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
          >
            Contact us →
          </Link>
        </div>
      </div>
    </div>
  );
}
