import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that apply when you buy from OriginLife — orders, pricing, payment, delivery, and liability.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro={`These terms govern your use of this site and any order you place with ${COMPANY.name}.`}
    >
      <LegalSection heading="Agreement">
        <p>
          By browsing this site or placing an order you accept these terms. If you do not accept
          them, please do not use the site.
        </p>
      </LegalSection>

      <LegalSection heading="Eligibility">
        <p>
          You must be at least 18 years old and able to enter into a binding contract to place an
          order.
        </p>
      </LegalSection>

      <LegalSection heading="Products and information">
        <p>
          We describe our products as accurately as we can, including their full ingredient list
          and dosages. Product images are representative; packaging may change. Nothing on this
          site is medical advice, and no product is intended to diagnose, treat, cure or prevent
          any disease.
        </p>
      </LegalSection>

      <LegalSection heading="Orders">
        <p>
          Your order is an offer to buy. It is accepted only when we confirm dispatch. We may
          decline or cancel an order — for example if an item is out of stock, a price or
          description was published in error, or we suspect fraud — and will refund any amount
          already paid in full.
        </p>
      </LegalSection>

      <LegalSection heading="Pricing and payment">
        <p>
          Prices are in Indian Rupees and include applicable taxes unless stated otherwise.
          Shipping charges are shown at checkout before payment. Payment is processed by our
          payment gateway; we do not store card or UPI credentials. An order is confirmed only
          once the gateway confirms payment to us — a success screen in your browser alone is not
          confirmation.
        </p>
      </LegalSection>

      <LegalSection heading="Coupons and Life Coins">
        <p>
          Discount codes and Life Coins are issued at our discretion, hold no cash value, cannot
          be exchanged for cash, and may be limited in quantity, time or eligibility. We may
          withdraw a code or reverse coins obtained through abuse, bulk account creation or
          cancelled orders.
        </p>
      </LegalSection>

      <LegalSection heading="Delivery, returns and refunds">
        <p>
          Delivery timelines and charges are set out in our{" "}
          <Link href="/shipping-policy" className="text-ink underline underline-offset-4">
            Shipping &amp; Delivery policy
          </Link>
          , and returns and refunds in our{" "}
          <Link href="/returns-policy" className="text-ink underline underline-offset-4">
            Returns &amp; Refunds policy
          </Link>
          . Both form part of these terms.
        </p>
      </LegalSection>

      <LegalSection heading="Reviews and submitted content">
        <p>
          Reviews are moderated before publication. We will not publish content that is
          defamatory, false, offensive, infringes someone else&apos;s rights, or claims a product
          treats or cures a medical condition. By submitting a review you grant us a
          non-exclusive right to publish it on the site. You keep ownership of what you write.
        </p>
      </LegalSection>

      <LegalSection heading="Your account">
        <p>
          You are responsible for keeping your password confidential and for activity under your
          account. Tell us immediately if you believe it has been used without your permission.
        </p>
      </LegalSection>

      <LegalSection heading="Intellectual property">
        <p>
          The site&apos;s content, branding, formulations, photography and copy belong to{" "}
          {COMPANY.legalName} and may not be reproduced commercially without written permission.
        </p>
      </LegalSection>

      <LegalSection heading="Liability">
        <p>
          Nothing here limits liability that cannot lawfully be limited, including for death or
          personal injury caused by our negligence or for fraud. Subject to that, our total
          liability in connection with an order is limited to the amount you paid for it. We are
          not liable for indirect or consequential loss.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          We may update these terms. The version published on this page at the time you place an
          order is the version that applies to it.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the laws of India, and the courts at{" "}
          {COMPANY.jurisdiction} have exclusive jurisdiction over any dispute.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          {COMPANY.legalName}, {COMPANY.registeredAddress}. GSTIN {COMPANY.gstin}. FSSAI licence{" "}
          {COMPANY.fssaiLicense}. Email {COMPANY.supportEmail}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
