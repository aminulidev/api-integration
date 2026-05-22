"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductStore } from "@/store";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { ProductCreateSchema, ProductCreateInput, PRODUCT_CATEGORIES } from "@/lib/validation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";

// Mock unsplash image suggestions based on category
const CATEGORY_IMAGES: Record<string, string[]> = {
  Electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60",
  ],
  Clothing: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60",
  ],
  "Home & Kitchen": [
    "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&auto=format&fit=crop&q=60",
  ],
  Books: [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&auto=format&fit=crop&q=60",
  ],
  "Sports & Outdoors": [
    "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=60",
  ],
  "Beauty & Personal Care": [
    "https://images.unsplash.com/photo-1608248597481-496100c8c836?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=60",
  ],
};

export function ProductDialog() {
  const { isDialogOpen, activeProduct, closeDialog } = useProductStore();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isEdit = !!activeProduct;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(ProductCreateSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "Electronics",
      stock: 0,
      imageUrl: "",
    },
  });

  const selectedCategory = watch("category");

  // Sync form values with activeProduct when it changes or dialog opens
  useEffect(() => {
    if (activeProduct) {
      reset({
        name: activeProduct.name,
        description: activeProduct.description || "",
        price: activeProduct.price,
        category: activeProduct.category,
        stock: activeProduct.stock,
        imageUrl: activeProduct.imageUrl || "",
      });
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        category: "Electronics",
        stock: 0,
        imageUrl: "",
      });
    }
  }, [activeProduct, reset, isDialogOpen]);

  const randomizeImage = () => {
    const list = CATEGORY_IMAGES[selectedCategory] || CATEGORY_IMAGES["Electronics"];
    const randomUrl = list[Math.floor(Math.random() * list.length)];
    setValue("imageUrl", randomUrl);
  };

  const onSubmit = (data: ProductCreateInput) => {
    if (isEdit && activeProduct?.id) {
      updateMutation.mutate(
        { id: activeProduct.id, data },
        {
          onSuccess: () => {
            closeDialog();
            reset();
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          closeDialog();
          reset();
        },
      });
    }
  };

  return (
    <Sheet open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
      <SheetContent className="w-full sm:max-w-md bg-white/98 border-l border-slate-100/80 flex flex-col h-full overflow-hidden p-0 shadow-2xl">
        {/* Fixed Header with nice padding and border-b */}
        <SheetHeader className="px-6 py-5 border-b border-slate-100 bg-white">
          <SheetTitle className="text-xl font-bold text-slate-800">
            {isEdit ? "Edit Product Details" : "Register New Product"}
          </SheetTitle>
          <SheetDescription className="text-slate-500 text-xs leading-relaxed mt-1">
            {isEdit
              ? "Update selected product properties in the database inventory record."
              : "Fill out the information below to add a new product item into the global inventory store."}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Form Body with custom scrollbar and generous padding */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar sheet-scroll-body bg-slate-50/20">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider inline-block">Product Name</label>
              <Input
                placeholder="Quantum Headphones"
                className={`bg-white border-slate-200 h-11 px-3.5 text-sm rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  errors.name ? "border-red-400 focus:border-red-400" : ""
                }`}
                disabled={isPending}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider inline-block">Product Category</label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      className={`bg-white border-slate-200 h-11 w-full px-3.5 text-sm rounded-xl focus:ring-indigo-500/20 transition-all ${
                        errors.category ? "border-red-400 focus:border-red-400" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-xs font-medium text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider inline-block">Price (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="29.99"
                  className={`bg-white border-slate-200 h-11 px-3.5 text-sm rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                    errors.price ? "border-red-400 focus:border-red-400" : ""
                  }`}
                  disabled={isPending}
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-xs font-medium text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider inline-block">Stock Count</label>
                <Input
                  type="number"
                  placeholder="10"
                  className={`bg-white border-slate-200 h-11 px-3.5 text-sm rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                    errors.stock ? "border-red-400 focus:border-red-400" : ""
                  }`}
                  disabled={isPending}
                  {...register("stock")}
                />
                {errors.stock && (
                  <p className="text-xs font-medium text-red-500">{errors.stock.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider inline-block">Product Description</label>
              <textarea
                rows={4}
                placeholder="Product specs, features, warranty guidelines..."
                className={`flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm shadow-sm transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-indigo-500/10 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.description
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
                disabled={isPending}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs font-medium text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider inline-block">Image URL</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={randomizeImage}
                  className="h-6 text-[10px] px-2.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 flex gap-1 items-center rounded-lg border-0 transition-all"
                  disabled={isPending}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  Suggest Image
                </Button>
              </div>
              <Input
                placeholder="https://images.unsplash.com/..."
                className={`bg-white border-slate-200 h-11 px-3.5 text-sm rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  errors.imageUrl ? "border-red-400 focus:border-red-400" : ""
                }`}
                disabled={isPending}
                {...register("imageUrl")}
              />
              {errors.imageUrl && (
                <p className="text-xs font-medium text-red-500">{errors.imageUrl.message}</p>
              )}
            </div>
          </form>
        </div>

        {/* Fixed Footer with premium, tall, side-by-side action buttons */}
        <SheetFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex flex-row gap-3 mt-0">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-slate-200 text-slate-500 hover:bg-slate-100 font-semibold h-12 text-sm rounded-xl transition-all"
            onClick={closeDialog}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-px transition-all h-12 text-sm rounded-xl"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Update Product"
            ) : (
              "Save Product"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
