import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What personal data OriginLife collects, why we collect it, who we share it with, and the rights you have over it.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`How ${COMPANY.name} collects, uses and protects your personal data.`}
    >
      <LegalSection heading="Who we are">
        <p>
          {COMPANY.legalName}, trading as {COMPANY.name}, registered at{" "}
          {COMPANY.registeredAddress}, is the data fiduciary responsible for the personal data
          described here.
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="text-ink">Account details</span> — name, email address, phone
            number, and a securely hashed password. We never store your password in readable
            form.
          </li>
          <li>
            <span className="text-ink">Order details</span> — delivery address, items ordered,
            order value, and order history.
          </li>
          <li>
            <span className="text-ink">Payment details</span> — handled entirely by our payment
            gateway. We receive a transaction reference and a success or failure result. Card
            numbers, UPI PINs and net-banking credentials never reach our servers.
          </li>
          <li>
            <span className="text-ink">Reviews you submit</span> — your rating, review text and
            the display name on your account.
          </li>
          <li>
            <span className="text-ink">Technical data</span> — pages visited and basic device
            information, used to keep the site working and to understand which products people
            look for.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Why we use it">
        <p>
          To take payment for and deliver your order, to give you access to your order history,
          to answer support requests, to publish reviews you choose to submit, to send
          transactional messages about orders, and to meet our tax and record-keeping
          obligations.
        </p>
        <p>
          We send marketing email only if you have opted in, and every marketing message
          includes a one-click unsubscribe. Unsubscribing does not stop order-related messages.
        </p>
      </LegalSection>

      <LegalSection heading="Who we share it with">
        <p>
          Only with the parties needed to fulfil your order and run the business: our payment
          gateway, our courier partners, our email provider, and our accountants and auditors.
          Each receives the minimum needed to do its job. We do not sell personal data, and we
          do not share it for anyone else&apos;s advertising.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Order and invoice records are retained for as long as tax law requires. Account data
          is retained while your account is open. When you close your account we delete or
          anonymise what we are not legally required to keep — published reviews stay up under a
          generic display name unless you ask us to remove them.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You can ask us for a copy of the personal data we hold about you, ask us to correct
          it, ask us to delete it, or withdraw consent for marketing at any time. Write to{" "}
          {COMPANY.grievanceEmail} and we will respond within 30 days.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          The site is served over HTTPS. Passwords are hashed. Session cookies are signed,
          HTTP-only and expire. Administrative access is restricted to named accounts. No system
          is perfectly secure, but if a breach affects your data we will tell you and the
          relevant authority.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          We use cookies that are necessary for the site to function — keeping you signed in and
          remembering your cart. Blocking these in your browser will break sign-in and checkout.
          Any analytics cookies are set only with your consent.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          The site is not intended for anyone under 18, and we do not knowingly collect data
          from children. Supplements should not be given to children except on the advice of a
          registered medical practitioner.
        </p>
      </LegalSection>

      <LegalSection heading="Grievance officer">
        <p>
          {COMPANY.grievanceOfficer}
          <br />
          {COMPANY.grievanceEmail}
          <br />
          {COMPANY.registeredAddress}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
