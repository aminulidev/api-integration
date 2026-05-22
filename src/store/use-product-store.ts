import { create } from "zustand";
import { Product } from "@/lib/validation";

interface ProductState {
  // Edit / Create dialog
  isDialogOpen: boolean;
  activeProduct: Product | null;
  openCreateDialog: () => void;
  openEditDialog: (product: Product) => void;
  closeDialog: () => void;

  // Delete confirmation dialog
  deleteConfirmProduct: Product | null;
  openDeleteConfirm: (product: Product) => void;
  closeDeleteConfirm: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  // Edit / Create dialog
  isDialogOpen: false,
  activeProduct: null,
  openCreateDialog: () => set({ isDialogOpen: true, activeProduct: null }),
  openEditDialog: (product) => set({ isDialogOpen: true, activeProduct: product }),
  closeDialog: () => set({ isDialogOpen: false, activeProduct: null }),

  // Delete confirmation dialog
  deleteConfirmProduct: null,
  openDeleteConfirm: (product) => set({ deleteConfirmProduct: product }),
  closeDeleteConfirm: () => set({ deleteConfirmProduct: null }),
}));
