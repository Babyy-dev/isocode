import type { CityPrice } from "@/features/pricing/types";
import type { SavedAssistance } from "@/features/ai/types";
import type { LeadMessage } from "@/features/messaging/types";

export type BookingInput = {
  requestId: string;
  carId: string;
  cityId: string;
  priceVersion: number;
  showroom: string;
  date: string;
  time: string;
  buyer: string;
  needs: string;
  consent: boolean;
  aiConsent?: boolean;
};

export type Booking = {
  aiConsent?: boolean;
  aiConsentAt?: number | null;
  ai?: SavedAssistance;
  id: string;
  carId: string;
  /** Display name, e.g. "Model H ZX automatic"; read from the car record, not stored. */
  carName: string;
  showroom: string;
  date: string;
  time: string;
  buyer: string;
  needs: string;
  buyerEmail: string;
  status: "Confirmed" | "Cancelled";
  consultant: string;
  createdAt: number;
  contactedAt: number | null;
  leadStatus: "New" | "Contacted" | "Won" | "Lost";
  optedOut: boolean;
  price: CityPrice;
  messages: LeadMessage[];
};

export type BookingDocument = Omit<Booking, "id" | "carName"> & {
  _id: string;
  buyerId: string;
  consentAt: number;
  consentVersion: "booking-follow-up-v1";
};

export type OccupiedSlot = Pick<
  Booking,
  "carId" | "showroom" | "date" | "time"
>;
