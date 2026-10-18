export type StroopColor = "red" | "blue" | "green" | "yellow";

export interface StroopPuzzle {
  id: string;
  wordText: string;           // The text displayed ("RED", "BLUE", etc.)
  fontColor: StroopColor;     // The actual color the text is painted in
  fontColorHex: string;       // Exact hex for high-contrast rendering
}

export const STROOP_COLORS: { name: StroopColor; label: string; hex: string; bgClass: string }[] = [
  { name: "red", label: "RED", hex: "#E53935", bgClass: "bg-[#E53935] text-white" },
  { name: "blue", label: "BLUE", hex: "#1E88E5", bgClass: "bg-[#1E88E5] text-white" },
  { name: "green", label: "GREEN", hex: "#2E7D32", bgClass: "bg-[#2E7D32] text-white" },
  { name: "yellow", label: "YELLOW", hex: "#D49E00", bgClass: "bg-[#D49E00] text-ink" },
];

export function generateStroopPuzzle(seed: string, index = 0): StroopPuzzle {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const wordIdx = Math.abs((hash * 41 + index * 17)) % STROOP_COLORS.length;
  // 70% chance incongruent (different color), 30% congruent
  const isCongruent = Math.abs((hash * 13 + index * 29)) % 10 < 3;
  let colorIdx = wordIdx;

  if (!isCongruent) {
    colorIdx = (wordIdx + 1 + (Math.abs((hash * 19 + index * 31)) % (STROOP_COLORS.length - 1))) % STROOP_COLORS.length;
  }

  const wordItem = STROOP_COLORS[wordIdx];
  const colorItem = STROOP_COLORS[colorIdx];

  return {
    id: `stroop-${seed}-${index}`,
    wordText: wordItem.label,
    fontColor: colorItem.name,
    fontColorHex: colorItem.hex,
  };
}
