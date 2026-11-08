import modelH from "../../../public/model-h.jpg";
import modelC from "../../../public/model-c.jpg";
import modelS from "../../../public/model-s.jpg";

/** Illustrative photos for the supplied sample stock (credits in docs/credits.md). */
export const sampleCarImages = {
  "NEW-H-02": modelH,
  "UC-1182": modelC,
  "UC-1190": modelS,
} as const;

export function sampleImageFor(stockId: string) {
  return sampleCarImages[stockId as keyof typeof sampleCarImages] ?? null;
}
