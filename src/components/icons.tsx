export const wellnessIcons = {
  leaf: <path d="M5 20c9 0 14-5 14-14V4h-2C8 4 5 9 5 18v2Z" />,
  droplet: <path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z" />,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />,
  molecule: (
    <>
      <circle cx="6" cy="7" r="2.2" />
      <circle cx="18" cy="7" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <path d="M7.8 8.4 10.3 16M16.2 8.4 13.7 16M8.2 7h7.6" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />,
  heart: (
    <path d="M12 20s-7-4.4-9.5-8.8C.8 8 2.3 4.5 5.8 4a4.9 4.9 0 0 1 6.2 2.3A4.9 4.9 0 0 1 18.2 4c3.5.5 5 4 3.3 7.2C19 15.6 12 20 12 20Z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  capsule: <path d="M4.9 14.1 14.1 4.9a4.2 4.2 0 1 1 5.9 5.9L10.9 20a4.2 4.2 0 0 1-6-5.9Z M9 10l5 5" />,
} as const;

export type WellnessIconName = keyof typeof wellnessIcons;

export function WellnessIcon({
  name,
  size = 24,
  className = "",
}: {
  name: WellnessIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {wellnessIcons[name]}
    </svg>
  );
}
