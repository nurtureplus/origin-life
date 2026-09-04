import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "OriginLife products are nutritional supplements, not medicines, and are not intended to diagnose, treat, cure or prevent any disease.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      intro="Please read this before using any product bought from this site."
    >
      <LegalSection heading="These are supplements, not medicines">
        <p>
          Every product sold on this site is a nutritional or dietary supplement. None is a
          medicine, and none is intended to diagnose, treat, cure or prevent any disease or
          medical condition. Nothing on this site — product pages, articles, reviews or
          marketing — should be read as a medical claim.
        </p>
      </LegalSection>

      <LegalSection heading="Not medical advice">
        <p>
          Content on this site is general information, not medical advice, and is no substitute
          for consulting a registered medical practitioner. Never disregard or delay professional
          medical advice because of something you read here.
        </p>
      </LegalSection>

      <LegalSection heading="Speak to a doctor first if">
        <ul className="list-disc space-y-2 pl-5">
          <li>you are pregnant, planning to be, or breastfeeding;</li>
          <li>you take prescription medication — supplements can interact with it;</li>
          <li>you are managing a diagnosed condition;</li>
          <li>you are due to have surgery;</li>
          <li>you are buying for someone under 18 or over 65.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Individual results vary">
        <p>
          Responses to supplements differ from person to person and depend on diet, sleep,
          activity, genetics and health status. Reviews on this site are individual experiences,
          not typical or expected results, and are not evidence of efficacy.
        </p>
      </LegalSection>

      <LegalSection heading="Use as directed">
        <p>
          Follow the directions and dosage on the label. Do not exceed the recommended intake.
          Supplements are not a substitute for a varied, balanced diet and a healthy lifestyle.
          Keep out of reach of children. Stop use and seek medical advice if you experience an
          adverse reaction, and report it to us at {COMPANY.supportEmail} so we can log it.
        </p>
      </LegalSection>

      <LegalSection heading="Allergens">
        <p>
          Read the allergen information on each product page and on the label before use. If you
          have a known allergy or intolerance and the information you need is not listed, contact
          us before ordering rather than assuming.
        </p>
      </LegalSection>

      <LegalSection heading="Regulatory statement">
        <p>
          These statements have not been evaluated by any food or drug regulatory authority.
          Products are manufactured and sold in compliance with applicable Indian food
          regulations under FSSAI licence {COMPANY.fssaiLicense}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
