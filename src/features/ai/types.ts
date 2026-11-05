export type BuyerAssistance = {
  summary: string;
  draft: string;
  uncertainties: string[];
};

export class AiError extends Error {}

export type SavedAssistance = BuyerAssistance & {
  model: string;
  generatedAt: number;
  generatedBy: string;
  summaryReviewedAt: number | null;
};
