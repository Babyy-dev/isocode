// Synthetic reviewer data. Names and `.test` emails are fictional; no real people.

export const DEMO_PASSWORD = "DemoShowroom@2026";
export const DEMO_CITY_ID = "lucknow";

export type DemoAccount = {
  email: string;
  name: string;
  role: "buyer" | "consultant" | "admin";
  /** Consultant profile the account is linked to (see features/demo/data). */
  profile?: string;
};

export const demoAccounts: DemoAccount[] = [
  { email: "buyer@demo.companya.test", name: "Aarav Mehrotra", role: "buyer" },
  {
    email: "consultant1@demo.companya.test",
    name: "Demo Consultant One",
    role: "consultant",
    profile: "Consultant 1A",
  },
  {
    email: "consultant2@demo.companya.test",
    name: "Demo Consultant Two",
    role: "consultant",
    profile: "Consultant 2A",
  },
  {
    email: "consultant3@demo.companya.test",
    name: "Demo Consultant Three",
    role: "consultant",
    profile: "Consultant 1B",
  },
  {
    email: "consultant4@demo.companya.test",
    name: "Demo Consultant Four",
    role: "consultant",
    profile: "Consultant 2B",
  },
  { email: "admin@demo.companya.test", name: "Demo Admin", role: "admin" },
];

export const DEMO_BUYER_EMAIL = "buyer@demo.companya.test";

export type DemoLead = {
  id: string;
  carId: string;
  showroom: string;
  consultant: string;
  buyer: string;
  needs: string;
  /** Minutes before seeding that the enquiry arrived. */
  ageMinutes: number;
  /** Minutes after arrival that the first call happened; null = not yet. */
  contactedAfterMinutes: number | null;
  leadStatus: "New" | "Contacted" | "Won" | "Lost";
  /** Days from today for the test drive, and the slot time. */
  inDays: number;
  time: string;
  optedOut?: boolean;
  tradeIn?: { model: string; year: number; kilometres: number; owners: number };
  /** True for the one booking the reviewer's buyer login owns; others belong to synthetic buyers who cannot sign in. */
  ownedByDemoBuyer?: boolean;
};

export const demoLeads: DemoLead[] = [
  {
    id: "demo-lead-01",
    carId: "NEW-H-02",
    showroom: "Demo Showroom 1",
    consultant: "Consultant 1A",
    buyer: "Aarav Mehrotra",
    needs:
      "First car for a family of four. Wants an automatic for city traffic, weekend test drive, and asked whether on-road price includes insurance.",
    ageMinutes: 2,
    contactedAfterMinutes: null,
    leadStatus: "New",
    inDays: 2,
    time: "11:00",
    ownedByDemoBuyer: true,
  },
  {
    id: "demo-lead-02",
    carId: "UC-1182",
    showroom: "Demo Showroom 1",
    consultant: "Consultant 1A",
    buyer: "Neha Srivastava",
    needs:
      "Looking at certified diesel cars for highway trips to Kanpur. Wants service history and whether a loan is possible on a used car.",
    ageMinutes: 47,
    contactedAfterMinutes: null,
    leadStatus: "New",
    inDays: 3,
    time: "14:30",
  },
  {
    id: "demo-lead-03",
    carId: "NEW-H-02",
    showroom: "Demo Showroom 1",
    consultant: "Consultant 1A",
    buyer: "Imran Qureshi",
    needs:
      "Upgrading from a hatchback. Interested in ZX automatic in a dark colour; wants to compare with the current car's trade-in value.",
    ageMinutes: 190,
    contactedAfterMinutes: 4,
    leadStatus: "Contacted",
    inDays: 4,
    time: "10:30",
    tradeIn: { model: "Model A hatchback", year: 2018, kilometres: 64_000, owners: 1 },
  },
  {
    id: "demo-lead-04",
    carId: "NEW-H-02",
    showroom: "Demo Showroom 1",
    consultant: "Consultant 1A",
    buyer: "Pooja Tiwari",
    needs: "Needs delivery before a family wedding next month.",
    ageMinutes: 2 * 24 * 60,
    contactedAfterMinutes: 3,
    leadStatus: "Won",
    inDays: 5,
    time: "15:00",
  },
  {
    id: "demo-lead-05",
    carId: "NEW-H-02",
    showroom: "Demo Showroom 2",
    consultant: "Consultant 2A",
    buyer: "Rohit Verma",
    needs:
      "Daily office commute of about 40 km. Petrol automatic preferred; asked about mileage and test drive near Gomti Nagar.",
    ageMinutes: 8,
    contactedAfterMinutes: null,
    leadStatus: "New",
    inDays: 2,
    time: "10:00",
  },
  {
    id: "demo-lead-06",
    carId: "UC-1182",
    showroom: "Demo Showroom 2",
    consultant: "Consultant 2A",
    buyer: "Sana Fatima",
    needs: "Wants a used diesel under 9 lakh. Asked not to be contacted again after the first call.",
    ageMinutes: 26 * 60,
    contactedAfterMinutes: 5,
    leadStatus: "Contacted",
    inDays: 3,
    time: "11:30",
    optedOut: true,
  },
  {
    id: "demo-lead-07",
    carId: "NEW-H-02",
    showroom: "Demo Showroom 2",
    consultant: "Consultant 2A",
    buyer: "Vikas Yadav",
    needs: "Comparing prices with another brand; decided to wait for a later model year.",
    ageMinutes: 4 * 24 * 60,
    contactedAfterMinutes: 12,
    leadStatus: "Lost",
    inDays: 6,
    time: "14:00",
  },
  {
    id: "demo-lead-08",
    carId: "NEW-H-02",
    showroom: "Demo Showroom 3",
    consultant: "Consultant 3A",
    buyer: "Kavya Agarwal",
    needs:
      "Senior parents will drive occasionally; wants easy-to-use automatic and a showroom with parking.",
    ageMinutes: 15,
    contactedAfterMinutes: null,
    leadStatus: "New",
    inDays: 3,
    time: "15:30",
  },
];
