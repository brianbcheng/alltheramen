export default function RamenBowlIcon({
  filled = "full",
  size = 18,
}: {
  filled?: "full" | "half" | "empty";
  size?: number;
}) {
  const colorBowl = "#E63946";
  const colorNoodle = "#F4A261";
  const colorChopstick = "#8B4513";
  const greyBowl = "#D6D3D1";
  const greyNoodle = "#D6D3D1";
  const greyChopstick = "#D6D3D1";

  const clipId = `half-clip-${Math.random().toString(36).slice(2, 8)}`;

  if (filled === "half") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="32" height="64" />
          </clipPath>
        </defs>
        <g>
          <ellipse cx="32" cy="38" rx="26" ry="16" fill={greyBowl} />
          <path d="M6 38c0 10 11.6 20 26 20s26-10 26-20" fill={greyBowl} />
          <ellipse cx="32" cy="30" rx="20" ry="8" fill={greyNoodle} />
          <path d="M18 24c4 6 10 8 14 6" stroke={greyNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M24 22c2 7 8 10 12 8" stroke={greyNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M30 21c0 7 4 10 8 9" stroke={greyNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <line x1="38" y1="8" x2="48" y2="28" stroke={greyChopstick} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="6" x2="52" y2="26" stroke={greyChopstick} strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <g clipPath={`url(#${clipId})`}>
          <ellipse cx="32" cy="38" rx="26" ry="16" fill={colorBowl} />
          <path d="M6 38c0 10 11.6 20 26 20s26-10 26-20" fill={colorBowl} />
          <ellipse cx="32" cy="30" rx="20" ry="8" fill={colorNoodle} />
          <path d="M18 24c4 6 10 8 14 6" stroke={colorNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M24 22c2 7 8 10 12 8" stroke={colorNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M30 21c0 7 4 10 8 9" stroke={colorNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <line x1="38" y1="8" x2="48" y2="28" stroke={colorChopstick} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="6" x2="52" y2="26" stroke={colorChopstick} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  const bowl = filled === "full" ? colorBowl : greyBowl;
  const noodle = filled === "full" ? colorNoodle : greyNoodle;
  const chopstick = filled === "full" ? colorChopstick : greyChopstick;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="38" rx="26" ry="16" fill={bowl} />
      <path d="M6 38c0 10 11.6 20 26 20s26-10 26-20" fill={bowl} />
      <ellipse cx="32" cy="30" rx="20" ry="8" fill={noodle} />
      <path d="M18 24c4 6 10 8 14 6" stroke={noodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M24 22c2 7 8 10 12 8" stroke={noodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M30 21c0 7 4 10 8 9" stroke={noodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <line x1="38" y1="8" x2="48" y2="28" stroke={chopstick} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="6" x2="52" y2="26" stroke={chopstick} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
