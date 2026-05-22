import { create } from "zustand";

interface ViewState {
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;
}

export const useViewStore = create<ViewState>((set) => ({
  viewMode: "table",
  setViewMode: (viewMode) => set({ viewMode }),
}));
