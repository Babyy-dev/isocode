import type { Language } from "@/features/cars/presentation";
import type { InspectionArea } from "./types";

export const inspectionAreaLabels: Record<Language, Record<InspectionArea, string>> = {
  en: {
    engine: "Engine & transmission",
    brakes: "Brakes & suspension",
    tyres: "Tyres & wheels",
    body: "Body & paint",
    interior: "Interior & electricals",
    documents: "Documents & service history",
  },
  hi: {
    engine: "इंजन और ट्रांसमिशन",
    brakes: "ब्रेक और सस्पेंशन",
    tyres: "टायर और पहिए",
    body: "बॉडी और पेंट",
    interior: "इंटीरियर और इलेक्ट्रिकल",
    documents: "दस्तावेज़ और सर्विस इतिहास",
  },
};

export const inspectionCopy = {
  en: {
    eyebrow: "CERTIFIED INSPECTION",
    title: "A closer look, before you decide.",
    inspectedOn: "Inspected on",
    passed: (passed: number, total: number) => `${passed} of ${total} areas passed`,
    pass: "Passed",
    attention: "Noted",
    missing:
      "The inspection report for this car is being completed. Ask your consultant for the latest status.",
    disclaimer:
      "Synthetic assessment report, not a real inspection. Every item noted is disclosed before sale.",
  },
  hi: {
    eyebrow: "प्रमाणित निरीक्षण",
    title: "फ़ैसले से पहले पूरी जानकारी।",
    inspectedOn: "निरीक्षण तिथि",
    passed: (passed: number, total: number) => `${total} में से ${passed} जाँच सफल`,
    pass: "ठीक",
    attention: "ध्यान दें",
    missing:
      "इस कार की निरीक्षण रिपोर्ट तैयार की जा रही है। नवीनतम स्थिति के लिए अपने सलाहकार से पूछें।",
    disclaimer:
      "यह आकलन हेतु काल्पनिक रिपोर्ट है, वास्तविक निरीक्षण नहीं। बिक्री से पहले हर नोट की गई बात बताई जाती है।",
  },
} as const;
