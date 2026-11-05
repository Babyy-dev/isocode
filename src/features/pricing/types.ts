export type PriceBreakdown = {
  basePricePaise: number;
  roadTaxPaise: number;
  insurancePaise: number;
  accessoriesPaise: number;
};

/** Serializable admin/public view. Money remains integer paise. */
export type CityPrice = PriceBreakdown & {
  carId: string;
  cityId: string;
  version: number;
  validThrough: string;
};

export type PriceInput = CityPrice;

export type PriceVersion = PriceBreakdown & {
  id: string;
  version: number;
  validFrom: Date;
  validUntil: Date;
};

export type PriceQuote =
  | { status: "unavailable" | "upcoming" | "expired" }
  | {
      status: "available";
      price: PriceVersion;
      totalPaise: number;
    };
