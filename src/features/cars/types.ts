export type CarContent = {
  slug?: string;
  description?: string;
  colours?: string[];
  specifications?: { label: string; value: string }[];
  owners?: number | null;
  registrationMasked?: string;
  inspectionReport?: string;
  photoUrls?: string[];
  archived?: boolean;
  contentVersion?: number;
};

type CarDetails = CarContent & {
  stockId: string;
  model: string;
  variant: string;
  fuel: "Petrol" | "Diesel";
  year: number;
  kilometres: number;
  priceInRupees: number;
  status: "Available" | "Booked";
};

export type Car = CarDetails &
  (
    | { type: "New"; priceLabel: "Ex-showroom price" }
    | { type: "Used"; priceLabel: "Listed price" }
  );
