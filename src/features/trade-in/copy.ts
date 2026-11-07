import type { Language } from "@/lib/i18n/language";
import type { TradeIn } from "./types";

export const tradeInCopy = {
  en: {
    toggle: "I have a car to trade in",
    hint: "Our used-car team values it before your visit. No price is promised online.",
    model: "Your car's make and model",
    modelPlaceholder: "For example: Model A hatchback",
    year: "Year",
    kilometres: "Kilometres",
    owners: "Owners",
    title: "Trade-in",
    summary: (car: TradeIn) =>
      `${car.model} · ${car.year} · ${car.kilometres.toLocaleString("en-IN")} km · ${car.owners} ${car.owners === 1 ? "owner" : "owners"}`,
  },
  hi: {
    toggle: "मेरे पास बदलने (ट्रेड-इन) के लिए कार है",
    hint: "आपके आने से पहले हमारी यूज़्ड-कार टीम इसका मूल्यांकन करती है। ऑनलाइन कोई कीमत का वादा नहीं किया जाता।",
    model: "आपकी कार का ब्रांड और मॉडल",
    modelPlaceholder: "उदाहरण: Model A हैचबैक",
    year: "वर्ष",
    kilometres: "किलोमीटर",
    owners: "मालिक",
    title: "ट्रेड-इन",
    summary: (car: TradeIn) =>
      `${car.model} · ${car.year} · ${car.kilometres.toLocaleString("en-IN")} किमी · ${car.owners} मालिक`,
  },
} satisfies Record<Language, unknown>;
