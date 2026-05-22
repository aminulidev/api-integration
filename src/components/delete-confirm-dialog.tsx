"use client";

import { useProductStore } from "@/store";
import { useDeleteProduct } from "@/hooks/use-products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

export function DeleteConfirmDialog() {
  const { deleteConfirmProduct, closeDeleteConfirm } = useProductStore();
  const deleteMutation = useDeleteProduct();

  const isOpen = !!deleteConfirmProduct;

  const handleConfirm = () => {
    if (!deleteConfirmProduct?.id) return;
    deleteMutation.mutate(deleteConfirmProduct.id, {
      onSuccess: () => closeDeleteConfirm(),
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !deleteMutation.isPending) closeDeleteConfirm();
      }}
    >
      <DialogContent className="sm:max-w-[420px] bg-white border border-slate-100 shadow-2xl rounded-2xl p-0 overflow-hidden">
        {/* Red accent top bar */}
        {/*<div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-rose-500 to-red-500" />*/}

        <div className="px-6 pt-5 pb-6 space-y-5">
          <DialogHeader className="space-y-3">
            {/* Icon */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 border border-red-100 shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-800 leading-tight">
                Delete Product
              </DialogTitle>
            </div>

            <DialogDescription className="text-sm text-slate-500 leading-relaxed text-center">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                &ldquo;{deleteConfirmProduct?.name}&rdquo;
              </span>
              ? This action cannot be undone and will permanently remove the
              product from the inventory.
            </DialogDescription>
          </DialogHeader>

          {/* Product preview pill */}
          {deleteConfirmProduct && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50/60 px-3.5 py-2.5">
              {deleteConfirmProduct.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={deleteConfirmProduct.imageUrl}
                  alt={deleteConfirmProduct.name}
                  className="h-9 w-9 rounded-lg object-cover border border-white shadow-sm shrink-0"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-400 shrink-0">
                  N/A
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {deleteConfirmProduct.name}
                </p>
                <p className="text-xs text-slate-400">
                  {deleteConfirmProduct.category} &middot; $
                  {deleteConfirmProduct.price.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-row gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-all"
              onClick={closeDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all"
              onClick={handleConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
