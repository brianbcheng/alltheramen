function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getCountryColor(country: string) {
  const hue = hashString(country) % 360;
  return {
    bg: `hsl(${hue}, 60%, 85%)`,
    text: `hsl(${hue}, 70%, 35%)`,
    hue,
  };
}

export function getStyleEmoji(style: string): string {
  switch (style.toLowerCase()) {
    case "pack":
      return "\uD83C\uDF5C";
    case "cup":
      return "\uD83E\uDD64";
    case "bowl":
      return "\uD83E\uDD63";
    case "tray":
    case "box":
      return "\uD83D\uDCE6";
    default:
      return "\uD83C\uDF5C";
  }
}
