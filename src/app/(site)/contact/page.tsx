import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "How to reach OriginLife about an order, a product question, or a grievance.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    label: "Orders & support",
    value: COMPANY.supportEmail,
    href: `mailto:${COMPANY.supportEmail}`,
    note: "Order number in the subject line gets the fastest answer.",
  },
  {
    label: "Phone",
    value: COMPANY.supportPhone,
    href: `tel:${COMPANY.supportPhone.replace(/[^\d+]/g, "")}`,
    note: COMPANY.supportHours,
  },
  {
    label: "Grievance officer",
    value: COMPANY.grievanceEmail,
    href: `mailto:${COMPANY.grievanceEmail}`,
    note: `${COMPANY.grievanceOfficer} — responses within 30 days.`,
  },
];

export default function ContactPage() {
  return (
    <div className="container-page py-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <div className="mx-auto max-w-3xl">
        <h1 className="text-display text-4xl font-medium md:text-5xl">Contact us</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          A real person reads every message. We answer within one working day.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((channel) => (
            <div key={channel.label} className="rounded-2xl border border-line bg-paper-soft p-6">
              <p className="text-xs uppercase tracking-widest text-ink-faint">{channel.label}</p>
              <a
                href={channel.href}
                className="mt-2 block break-words font-medium text-ink underline underline-offset-4"
              >
                {channel.value}
              </a>
              <p className="mt-2 text-sm text-ink-soft">{channel.note}</p>
            </div>
          ))}

          <div className="rounded-2xl border border-line bg-paper-soft p-6">
            <p className="text-xs uppercase tracking-widest text-ink-faint">Registered address</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {COMPANY.legalName}
              <br />
              {COMPANY.registeredAddress}
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <h2 className="font-heading text-lg font-medium tracking-tight">
            Before you write to us
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li>
              Order status and tracking are in{" "}
              <Link href="/account" className="text-ink underline underline-offset-4">
                your account
              </Link>
              .
            </li>
            <li>
              Delivery times and charges are in the{" "}
              <Link href="/shipping-policy" className="text-ink underline underline-offset-4">
                shipping policy
              </Link>
              .
            </li>
            <li>
              Returns and refunds are covered in the{" "}
              <Link href="/returns-policy" className="text-ink underline underline-offset-4">
                returns policy
              </Link>
              .
            </li>
            <li>
              Most product questions are answered in the{" "}
              <Link href="/faq" className="text-ink underline underline-offset-4">
                FAQ
              </Link>
              .
            </li>
          </ul>
        </div>

        <div className="mt-12 rounded-2xl border border-line bg-paper-soft p-6">
          <h2 className="font-heading text-base font-medium tracking-tight">
            Reporting an adverse reaction
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Stop taking the product and seek medical advice. Then email{" "}
            {COMPANY.supportEmail} with the product name, batch number and expiry from the pack,
            and what you experienced. We log every report and investigate the batch.
          </p>
        </div>

        <div className="mt-12 border-t border-line pt-8 text-sm text-ink-soft">
          <p>
            {COMPANY.legalName} · GSTIN {COMPANY.gstin} · CIN {COMPANY.cin} · FSSAI licence{" "}
            {COMPANY.fssaiLicense}
          </p>
        </div>
      </div>
    </div>
  );
}
