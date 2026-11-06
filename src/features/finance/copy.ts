import type { Language } from "@/lib/i18n/language";

export const financeCopy = {
  en: {
    toggle: "Estimate your EMI",
    downPayment: "Down payment",
    rate: "Interest rate (per year)",
    tenure: "Loan tenure",
    years: (n: number) => `${n} ${n === 1 ? "year" : "years"}`,
    monthly: "Estimated EMI",
    perMonth: "/month",
    loan: "Loan amount",
    interest: "Total interest",
    note: "Estimate on this on-road price. The actual rate and EMI depend on the lender's approval.",
  },
  hi: {
    toggle: "अपनी EMI का अनुमान लगाएँ",
    downPayment: "डाउन पेमेंट",
    rate: "ब्याज दर (प्रति वर्ष)",
    tenure: "लोन अवधि",
    years: (n: number) => `${n} वर्ष`,
    monthly: "अनुमानित EMI",
    perMonth: "/माह",
    loan: "लोन राशि",
    interest: "कुल ब्याज",
    note: "इस ऑन-रोड कीमत पर अनुमान। वास्तविक दर और EMI ऋणदाता की स्वीकृति पर निर्भर है।",
  },
} satisfies Record<Language, unknown>;
