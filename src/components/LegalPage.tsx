import { POLICY_LAST_UPDATED } from "@/lib/company";

/**
 * Shared shell for the policy pages.
 *
 * Prose is capped at ~68 characters per line (`max-w-2xl` at this body size),
 * which is the readable measure the design system asks for — legal text is the
 * longest reading on the site and the easiest to get wrong by running it the
 * full width of the container.
 */
export function LegalPage({
  title,
  intro,
  lastUpdated = POLICY_LAST_UPDATED,
  children,
}: {
  title: string;
  intro?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-display text-4xl font-medium md:text-5xl">{title}</h1>
        <p className="mt-4 text-xs uppercase tracking-widest text-ink-faint">
          Last updated {lastUpdated}
        </p>
        {intro && <p className="mt-6 text-lg leading-relaxed text-ink-soft">{intro}</p>}

        <div className="mt-10 space-y-10">{children}</div>
      </div>
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-heading text-xl font-medium tracking-tight">{heading}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}
