import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { COMPANY, SHIPPING } from "@/lib/company";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description:
    "How OriginLife orders are packed, dispatched and delivered across India, including timelines and shipping charges.",
  alternates: { canonical: "/shipping-policy" },
};

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping & Delivery"
      intro="Where we ship, what it costs, and how long it takes."
    >
      <LegalSection heading="Where we ship">
        <p>
          We ship across India. We do not currently ship internationally. Orders are delivered
          by third-party courier partners; the partner assigned to your order depends on your
          PIN code.
        </p>
      </LegalSection>

      <LegalSection heading="Dispatch time">
        <p>
          Orders are packed and handed to the courier within {SHIPPING.dispatchWindow} of
          payment confirmation. Orders placed on a Sunday or a public holiday are processed on
          the next working day.
        </p>
      </LegalSection>

      <LegalSection heading="Delivery time">
        <ul className="list-disc space-y-2 pl-5">
          <li>Metro cities: {SHIPPING.metroDelivery} from dispatch.</li>
          <li>Rest of India: {SHIPPING.restOfIndiaDelivery} from dispatch.</li>
        </ul>
        <p>
          These are estimates from our courier partners, not guarantees. Weather, strikes and
          regional restrictions can extend them.
        </p>
      </LegalSection>

      <LegalSection heading="Shipping charges">
        <p>
          Shipping is free on orders over{" "}
          {formatPrice(SHIPPING.freeShippingThresholdPaise)}. Below that, a flat charge of{" "}
          {formatPrice(SHIPPING.flatRatePaise)} applies and is shown at checkout before you pay.
        </p>
      </LegalSection>

      <LegalSection heading="Tracking your order">
        <p>
          You will receive tracking details by email once your order is dispatched. You can also
          see the current status of every order in your account under{" "}
          <span className="text-ink">My orders</span>.
        </p>
      </LegalSection>

      <LegalSection heading="Failed and undelivered orders">
        <p>
          Couriers attempt delivery up to three times. If all attempts fail, or the address is
          incomplete or unreachable, the parcel returns to us. We will contact you to arrange a
          re-dispatch; a second shipping charge may apply. Prepaid orders that cannot be
          re-delivered are refunded to the original payment method minus the shipping already
          incurred.
        </p>
      </LegalSection>

      <LegalSection heading="Damaged or missing items">
        <p>
          Check the parcel at the time of delivery. If the outer packaging is tampered with or
          damaged, refuse the delivery. If you notice damage or a missing item after opening,
          email {COMPANY.supportEmail} within 48 hours of delivery with your order number and
          photographs of the parcel and its contents, and we will replace or refund it.
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
