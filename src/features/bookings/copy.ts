import type { Language } from "@/lib/i18n/language";

/** Every message a booking can fail with. Server code throws the key; the UI shows the text. */
export type BookingErrorCode =
  | "invalid"
  | "aiConsentChoice"
  | "consentRequired"
  | "reload"
  | "carAndCity"
  | "priceRequired"
  | "showroomSlot"
  | "validDate"
  | "futureSlot"
  | "nameNeeds"
  | "differentRequest"
  | "slotTaken"
  | "carUnavailable"
  | "priceUnavailable"
  | "priceChanged"
  | "noConsultant"
  | "tooManyAttempts"
  | "unexpected"
  | "invalidRequest"
  | "notFound"
  | "updateFailed";

const errorsEn: Record<BookingErrorCode, string> = {
  invalid: "Invalid booking. Reload the page and try again.",
  aiConsentChoice: "Choose whether to allow AI assistance.",
  consentRequired: "Consent is required to book and arrange follow-up.",
  reload: "Reload the form and try again.",
  carAndCity: "Choose a car and city.",
  priceRequired: "An available price is required.",
  showroomSlot: "Choose a showroom and a listed slot.",
  validDate: "Choose a valid date.",
  futureSlot: "Choose a future slot.",
  nameNeeds: "Check your name and preferences (up to 1,000 characters).",
  differentRequest:
    "A previous request already reserved a different booking. Check My bookings before trying again.",
  slotTaken: "This slot was just reserved. Choose another.",
  carUnavailable: "This car is no longer available.",
  priceUnavailable: "The city price is unavailable or expired. Ask for an updated price.",
  priceChanged: "The price changed. Review the new price before booking.",
  noConsultant: "No consultant is configured for this showroom.",
  tooManyAttempts: "Too many booking attempts. Try again in {seconds} seconds.",
  unexpected: "Unable to reserve this slot. Please try again.",
  invalidRequest: "Invalid request.",
  notFound: "Booking not found in your account.",
  updateFailed: "Unable to update your booking. Please try again.",
};

const errorsHi: Record<BookingErrorCode, string> = {
  invalid: "बुकिंग मान्य नहीं है। पेज दोबारा लोड करके फिर कोशिश करें।",
  aiConsentChoice: "चुनें कि AI सहायता की अनुमति देनी है या नहीं।",
  consentRequired: "बुकिंग और फ़ॉलो-अप के लिए सहमति आवश्यक है।",
  reload: "फ़ॉर्म दोबारा लोड करके फिर कोशिश करें।",
  carAndCity: "कार और शहर चुनें।",
  priceRequired: "उपलब्ध कीमत आवश्यक है।",
  showroomSlot: "शोरूम और सूची में दिया गया स्लॉट चुनें।",
  validDate: "मान्य तारीख चुनें।",
  futureSlot: "आगे का कोई स्लॉट चुनें।",
  nameNeeds: "अपना नाम और ज़रूरतें जाँचें (अधिकतम 1,000 अक्षर)।",
  differentRequest:
    "पिछले अनुरोध से दूसरी बुकिंग पहले ही हो चुकी है। दोबारा कोशिश से पहले मेरी बुकिंग देखें।",
  slotTaken: "यह स्लॉट अभी-अभी बुक हो गया। कोई दूसरा चुनें।",
  carUnavailable: "यह कार अब उपलब्ध नहीं है।",
  priceUnavailable: "इस शहर की कीमत उपलब्ध नहीं है या समाप्त हो गई है। नई कीमत के लिए पूछें।",
  priceChanged: "कीमत बदल गई है। बुक करने से पहले नई कीमत देखें।",
  noConsultant: "इस शोरूम के लिए कोई सलाहकार तय नहीं है।",
  tooManyAttempts: "बहुत अधिक बुकिंग प्रयास। {seconds} सेकंड बाद फिर कोशिश करें।",
  unexpected: "यह स्लॉट बुक नहीं हो सका। कृपया फिर से कोशिश करें।",
  invalidRequest: "अनुरोध मान्य नहीं है।",
  notFound: "यह बुकिंग आपके खाते में नहीं मिली।",
  updateFailed: "आपकी बुकिंग अपडेट नहीं हो सकी। कृपया फिर से कोशिश करें।",
};

export const bookingCopy = {
  en: {
    errors: errorsEn,
    form: {
      eyebrow: "30 MINUTES. YOUR NEXT CAR.",
      title: "Book a test drive",
      car: "Car",
      city: "Price city",
      showroom: "Showroom",
      date: "Date",
      slots: "Available slots · India time",
      name: "Your name",
      namePlaceholder: "Use a fictional name for this demo",
      needs: "What matters to you?",
      needsPlaceholder: "For example: automatic, family use, weekend availability",
      consent:
        "I consent to Company A using these details for this booking and follow-up. I can opt out any time from My bookings.",
      aiConsent:
        "Optional: allow AI to help staff summarise my needs and draft a reply. Staff review everything; I can withdraw this in My bookings.",
      submit: "Confirm test drive",
      submitting: "Reserving…",
      consentMissing: "Consent is required for booking and follow-up.",
      noPrice: "No current price is available for this car and city.",
      network: "Unable to book. Check your connection and try again.",
    },
    snapshot: {
      eyebrow: "YOUR PRICE SNAPSHOT",
      unavailable: "Price unavailable",
      text: (city: string, validThrough: string) =>
        `On-road price for ${city}, valid through ${validThrough}. Prices may change; your booking keeps a copy of this price.`,
      note: "Availability is checked again when you confirm. Messages are simulated; no SMS or WhatsApp is sent.",
    },
    confirmed: {
      eyebrow: "TEST DRIVE CONFIRMED",
      title: "Your drive is on the calendar.",
      text: (reference: string) =>
        `Reference ${reference}. A named consultant has been assigned and will call you. We have sent you a WhatsApp confirmation (simulated in this demo).`,
      view: "View my bookings",
    },
    list: {
      eyebrow: "YOUR ACCOUNT",
      title: "Your test drives",
      intro: "Bookings saved to your account. Cancelling releases your slot.",
      empty: "No bookings yet.",
      choose: "Choose a test drive",
      status: { Confirmed: "Confirmed", Cancelled: "Cancelled" },
      consultant: "Your consultant",
      snapshot: "Price snapshot",
      cancel: "Cancel booking",
      optOut: "Opt out of follow-up",
      optIn: "Resume follow-up",
      aiWithdraw: "Withdraw AI permission",
      aiAllow: "Allow AI assistance",
      aiNote: "AI assistance is optional: your stated needs may be sent to an AI provider for staff-reviewed summaries and drafts.",
      optedOut: "Follow-up messages are switched off.",
      followUp: "Follow-up allowed. Delivery is simulated in this demo.",
      updated: "Booking updated.",
      network: "Unable to update. Please try again.",
      messages: "Messages to you",
    },
  },
  hi: {
    errors: errorsHi,
    form: {
      eyebrow: "30 मिनट। आपकी अगली कार।",
      title: "टेस्ट ड्राइव बुक करें",
      car: "कार",
      city: "कीमत का शहर",
      showroom: "शोरूम",
      date: "तारीख",
      slots: "उपलब्ध स्लॉट · भारतीय समय",
      name: "आपका नाम",
      namePlaceholder: "इस डेमो के लिए काल्पनिक नाम लिखें",
      needs: "आपके लिए क्या ज़रूरी है?",
      needsPlaceholder: "उदाहरण: ऑटोमैटिक, परिवार के लिए, सप्ताहांत में उपलब्धता",
      consent:
        "मैं सहमति देता/देती हूँ कि Company A इस बुकिंग और फ़ॉलो-अप के लिए मेरी जानकारी का उपयोग करे। मैं मेरी बुकिंग से कभी भी ऑप्ट-आउट कर सकता/सकती हूँ।",
      aiConsent:
        "वैकल्पिक: स्टाफ़ को मेरी ज़रूरतों का सार और जवाब का ड्राफ़्ट बनाने में AI की मदद की अनुमति दें। स्टाफ़ सब कुछ जाँचता है; मैं इसे मेरी बुकिंग से वापस ले सकता/सकती हूँ।",
      submit: "टेस्ट ड्राइव पक्की करें",
      submitting: "बुक हो रहा है…",
      consentMissing: "बुकिंग और फ़ॉलो-अप के लिए सहमति आवश्यक है।",
      noPrice: "इस कार और शहर के लिए अभी कोई कीमत उपलब्ध नहीं है।",
      network: "बुकिंग नहीं हो सकी। इंटरनेट कनेक्शन जाँचकर फिर कोशिश करें।",
    },
    snapshot: {
      eyebrow: "आपकी कीमत",
      unavailable: "कीमत उपलब्ध नहीं",
      text: (city: string, validThrough: string) =>
        `${city} की ऑन-रोड कीमत, ${validThrough} तक मान्य। कीमतें बदल सकती हैं; आपकी बुकिंग में यह कीमत सहेजी जाती है।`,
      note: "पक्की करते समय उपलब्धता दोबारा जाँची जाती है। संदेश सिम्युलेटेड हैं; कोई SMS या WhatsApp नहीं भेजा जाता।",
    },
    confirmed: {
      eyebrow: "टेस्ट ड्राइव पक्की",
      title: "आपकी ड्राइव कैलेंडर में दर्ज है।",
      text: (reference: string) =>
        `संदर्भ ${reference}। आपके लिए एक सलाहकार तय कर दिया गया है जो आपको कॉल करेंगे। हमने आपको WhatsApp पुष्टि भेजी है (इस डेमो में सिम्युलेटेड)।`,
      view: "मेरी बुकिंग देखें",
    },
    list: {
      eyebrow: "आपका खाता",
      title: "आपकी टेस्ट ड्राइव",
      intro: "बुकिंग आपके खाते में सहेजी गई हैं। रद्द करने पर आपका स्लॉट खाली हो जाता है।",
      empty: "अभी कोई बुकिंग नहीं है।",
      choose: "टेस्ट ड्राइव चुनें",
      status: { Confirmed: "पक्की", Cancelled: "रद्द" },
      consultant: "आपके सलाहकार",
      snapshot: "सहेजी गई कीमत",
      cancel: "बुकिंग रद्द करें",
      optOut: "फ़ॉलो-अप बंद करें",
      optIn: "फ़ॉलो-अप फिर शुरू करें",
      aiWithdraw: "AI अनुमति वापस लें",
      aiAllow: "AI सहायता की अनुमति दें",
      aiNote: "AI सहायता वैकल्पिक है: स्टाफ़ द्वारा जाँचे जाने वाले सार और ड्राफ़्ट के लिए आपकी बताई ज़रूरतें AI प्रदाता को भेजी जा सकती हैं।",
      optedOut: "फ़ॉलो-अप संदेश बंद हैं।",
      followUp: "फ़ॉलो-अप की अनुमति है। इस डेमो में संदेश सिम्युलेटेड हैं।",
      updated: "बुकिंग अपडेट हो गई।",
      network: "अपडेट नहीं हो सका। कृपया फिर से कोशिश करें।",
      messages: "आपको भेजे गए संदेश",
    },
  },
} satisfies Record<Language, unknown>;

export function bookingErrorText(
  code: BookingErrorCode,
  language: Language,
  params: Record<string, string | number> = {},
) {
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    bookingCopy[language].errors[code],
  );
}
