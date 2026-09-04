import { WellnessIcon, type WellnessIconName } from "@/components/icons";

type Chip = {
  icon: WellnessIconName;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  drift: number;
};

const chips: Chip[] = [
  { icon: "leaf", top: "14%", left: "9%", size: 72, duration: 6.5, delay: 0, drift: -14 },
  { icon: "droplet", top: "10%", left: "88%", size: 60, duration: 5.5, delay: 0.4, drift: -10 },
  { icon: "sparkle", top: "42%", left: "4%", size: 56, duration: 7, delay: 1, drift: -12 },
  { icon: "molecule", top: "38%", left: "94%", size: 76, duration: 6, delay: 0.6, drift: -16 },
  { icon: "moon", top: "74%", left: "10%", size: 64, duration: 6.8, delay: 1.4, drift: -12 },
  { icon: "heart", top: "78%", left: "90%", size: 58, duration: 5.8, delay: 0.8, drift: -10 },
  { icon: "sun", top: "6%", left: "30%", size: 52, duration: 6.2, delay: 1.8, drift: -10 },
  { icon: "capsule", top: "8%", left: "70%", size: 58, duration: 7.4, delay: 0.2, drift: -14 },
];

export function FloatingIcons({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 hidden md:block ${className}`}
      aria-hidden="true"
    >
      {chips.map((chip, i) => (
        <div
          key={i}
          className="animate-float-chip absolute flex items-center justify-center rounded-full border border-chip-border bg-chip-bg text-ink-soft backdrop-blur-sm"
          style={
            {
              top: chip.top,
              left: chip.left,
              width: chip.size,
              height: chip.size,
              transform: "translate(-50%, -50%)",
              "--chip-duration": `${chip.duration}s`,
              "--chip-delay": `${chip.delay}s`,
              "--chip-drift": `${chip.drift}px`,
            } as React.CSSProperties
          }
        >
          <WellnessIcon name={chip.icon} size={chip.size * 0.4} />
        </div>
      ))}
    </div>
  );
}
