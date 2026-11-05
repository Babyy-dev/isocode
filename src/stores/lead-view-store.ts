"use client";

import { create } from "zustand";

// UI preferences only. Buyer records and authorization always come from the server.
export const useLeadViewStore = create<{
  selected: string;
  search: string;
  select: (id: string) => void;
  searchFor: (text: string) => void;
}>((set) => ({
  selected: "",
  search: "",
  select: (selected) => set({ selected }),
  searchFor: (search) => set({ search }),
}));
