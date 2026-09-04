import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { COMPANY, SHIPPING } from "@/lib/company";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "When an OriginLife order can be returned, how refunds are processed, and what is not eligible.",
  alternates: { canonical: "/returns-policy" },
};

export default function ReturnsPolicyPage() {
  return (
    <LegalPage
      title="Returns & Refunds"
      intro="What can be returned, how to start a return, and when the money reaches you."
    >
      <LegalSection heading="What can be returned">
        <p>
          Supplements are consumable products, so a return is only possible when the item is
          unopened, unused, and in its original sealed packaging, and the request is raised
          within {SHIPPING.returnWindowDays} days of delivery.
        </p>
        <p>We will always replace or refund, regardless of seal, if:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>the wrong product was sent;</li>
          <li>the product arrived damaged or leaking;</li>
          <li>the product is past, or close to, its expiry date on arrival.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="What cannot be returned">
        <ul className="list-disc space-y-2 pl-5">
          <li>Opened or part-used containers, unless the product was faulty.</li>
          <li>Products without their original batch and expiry labelling.</li>
          <li>Items marked as final sale at the time of purchase.</li>
          <li>Requests raised more than {SHIPPING.returnWindowDays} days after delivery.</li>
        </ul>
        <p>
          We cannot accept a return because a supplement did not produce a particular result.
          Nutritional supplements are not medicines and outcomes vary between people.
        </p>
      </LegalSection>

      <LegalSection heading="How to start a return">
        <p>
          Email {COMPANY.supportEmail} with your order number, the item concerned, and
          photographs if the product arrived damaged. We will confirm whether the return is
          eligible and arrange a pickup where our courier partners operate. Where pickup is not
          available, we will share a return address and reimburse reasonable courier charges
          against a receipt.
        </p>
      </LegalSection>

      <LegalSection heading="Refunds">
        <p>
          Once the returned item reaches us and passes inspection, the refund is initiated
          within {SHIPPING.refundWindowDays} business days to the original payment method. Your
          bank or card issuer may take a further 5–7 business days to post it to your account.
        </p>
        <p>
          Shipping charges already paid are refunded only when the return is our error — a wrong,
          damaged or expired item.
        </p>
      </LegalSection>

      <LegalSection heading="Cancellations">
        <p>
          An order can be cancelled at no cost any time before it is dispatched. Email{" "}
          {COMPANY.supportEmail} with your order number. Once the parcel has left our warehouse,
          the returns process above applies instead.
        </p>
      </LegalSection>

      <LegalSection heading="Life Coins on a refunded order">
        <p>
          Life Coins earned on a refunded order are reversed. Coins that were redeemed against a
          refunded order are credited back to your account and keep their original expiry.
        </p>
      </LegalSection>

      <LegalSection heading="Questions">
        <p>
          Write to {COMPANY.supportEmail} or call {COMPANY.supportPhone} ({COMPANY.supportHours}).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
