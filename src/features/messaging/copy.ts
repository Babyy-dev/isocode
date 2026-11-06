import type { Language } from "@/lib/i18n/language";

export const messagingCopy = {
  en: {
    empty: "No messages yet.",
    simulated: "Delivery is simulated in this demo: messages are recorded, not sent.",
    automatic: "Automatic acknowledgement",
    replyBy: (name: string) => `Reply by ${name}`,
    template: "Template",
  },
  hi: {
    empty: "अभी कोई संदेश नहीं है।",
    simulated: "इस डेमो में संदेश सिम्युलेटेड हैं: वे दर्ज होते हैं, भेजे नहीं जाते।",
    automatic: "स्वचालित पुष्टि",
    replyBy: (name: string) => `${name} का जवाब`,
    template: "टेम्पलेट",
  },
} satisfies Record<Language, unknown>;
