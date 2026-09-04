import Link from "next/link";

const SIZES = {
  sm: { icon: "h-8", text: "text-base", tagline: "text-[9px]", gap: "gap-2" },
  md: { icon: "h-10", text: "text-lg", tagline: "text-[10px]", gap: "gap-2.5" },
  lg: { icon: "h-16", text: "text-3xl", tagline: "text-xs", gap: "gap-3.5" },
} as const;

export function Logo({
  variant = "light",
  size = "md",
  showTagline = true,
  href = "/",
  className = "",
}: {
  variant?: "light" | "dark";
  size?: keyof typeof SIZES;
  showTagline?: boolean;
  href?: string | null;
  className?: string;
}) {
  const s = SIZES[size];
  const wordmarkColor = variant === "dark" ? "text-dark-text" : "text-ink";
  const originColor = variant === "dark" ? "text-dark-text" : "text-accent";
  const taglineColor = variant === "dark" ? "text-dark-text-soft" : "text-ink-faint";

  const content = (
    <span className={`flex items-center ${s.gap} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/icon-color.png" alt="" className={`${s.icon} w-auto shrink-0`} />
      <span className="flex flex-col leading-none">
        <span className={`font-heading ${s.text} tracking-tight`}>
          <span className={originColor}>Origin</span>
          <span className={wordmarkColor}>Life</span>
        </span>
        {showTagline && (
          <span className={`mt-1 ${s.tagline} uppercase tracking-widest ${taglineColor}`}>
            Nurturing Body, Mind &amp; Soul
          </span>
        )}
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="OriginLife home">
      {content}
    </Link>
  );
}
