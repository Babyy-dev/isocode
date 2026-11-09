import type { Language } from "@/lib/i18n/language";

/** Text for the app chrome shared by every page: navigation, banners, 404. */
export const layoutCopy = {
  en: {
    switchTo: "हिन्दी",
    switchLabel: "हिन्दी में देखें",
    switching: "Switching…",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    theme: { label: "Switch light or dark theme", dark: "Dark mode", light: "Light mode" },
    nav: {
      label: "Main navigation",
      account: "Account",
      testDrive: "Test drive",
      bookings: "My bookings",
      leads: "Lead inbox",
      admin: "Admin",
    },
    demoBanner:
      "Synthetic assessment data · Sign-in required · Bookings, leads and prices are saved · Messages are simulated",
    notFound: {
      eyebrow: "COMPANY A · 404",
      title: "This page isn’t in the collection.",
      text: "Check the address or explore our cars.",
      action: "Back to collection",
    },
  },
  hi: {
    switchTo: "English",
    switchLabel: "View in English",
    switching: "बदल रहा है…",
    openMenu: "मेनू खोलें",
    closeMenu: "मेनू बंद करें",
    theme: { label: "लाइट या डार्क थीम बदलें", dark: "डार्क मोड", light: "लाइट मोड" },
    nav: {
      label: "मुख्य नेविगेशन",
      account: "खाता",
      testDrive: "टेस्ट ड्राइव",
      bookings: "मेरी बुकिंग",
      leads: "लीड इनबॉक्स",
      admin: "एडमिन",
    },
    demoBanner:
      "आकलन हेतु काल्पनिक डेटा · साइन-इन आवश्यक · बुकिंग, लीड और कीमतें सहेजी जाती हैं · संदेश सिम्युलेटेड हैं",
    notFound: {
      eyebrow: "COMPANY A · 404",
      title: "यह पेज संग्रह में नहीं है।",
      text: "पता जाँचें या हमारी कारें देखें।",
      action: "संग्रह पर वापस जाएँ",
    },
  },
} satisfies Record<Language, unknown>;
