import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Product, ProductCreateInput, ProductUpdateInput } from "@/lib/validation";
import { toast } from "sonner";

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface QueryParams {
  q?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export function useGetProducts(params: QueryParams) {
  // Clean empty params so ky doesn't send empty strings/undefined
  const searchParams: Record<string, string> = {};
  if (params.q) searchParams.q = params.q;
  if (params.category) searchParams.category = params.category;
  if (params.sortBy) searchParams.sortBy = params.sortBy;
  if (params.sortOrder) searchParams.sortOrder = params.sortOrder;
  if (params.page) searchParams.page = String(params.page);
  if (params.limit) searchParams.limit = String(params.limit);

  return useQuery<ProductsResponse>({
    queryKey: ["products", params],
    queryFn: async () => {
      return apiClient
        .get("products", { searchParams })
        .json<ProductsResponse>();
    },
    // No placeholderData — isFetching alone drives the skeleton, giving a clean
    // loading indicator on every pagination / filter change without data flicker.
    staleTime: 30_000, // 30 s before a background refetch is triggered
  });
}

export function useGetProduct(id: string) {
  return useQuery<Product>({
    queryKey: ["products", id],
    queryFn: async () => {
      return apiClient.get(`products/${id}`).json<Product>();
    },
    enabled: !!id,
  });
}

export function useGetProductsStats() {
  return useQuery<{
    totalProducts: number;
    totalValuation: number;
    outOfStock: number;
    lowStock: number;
  }>({
    queryKey: ["products", "stats"],
    queryFn: async () => {
      return apiClient.get("products/stats").json<any>();
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, ProductCreateInput>({
    mutationFn: async (newProduct) => {
      return apiClient
        .post("products", { json: newProduct })
        .json<Product>();
    },
    onSuccess: (data) => {
      // Merge the new product into every cached product-list query.
      // We prepend it to page 1 results and bump the total counter so the UI
      // stays consistent without a full network refetch.
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"], exact: false },
        (old) => {
          if (!old || !Array.isArray(old.products)) return old;
          // Only prepend on page 1 so later pages aren't polluted
          const isPageOne = old.page === 1 || old.page === undefined;
          return {
            ...old,
            products: isPageOne ? [data, ...old.products] : old.products,
            total: old.total + 1,
            totalPages: Math.ceil((old.total + 1) / old.limit),
          };
        }
      );
      // Stats need a real refetch since they aggregate server-side
      queryClient.invalidateQueries({ queryKey: ["products", "stats"] });
      toast.success(`Product "${data.name}" created successfully!`);
    },
    onError: (error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: string; data: ProductUpdateInput }>({
    mutationFn: async ({ id, data }) => {
      return apiClient
        .put(`products/${id}`, { json: data })
        .json<Product>();
    },
    onSuccess: (updatedProduct) => {
      // Patch every cached product-list query in place with the returned product.
      // This works even when the external API doesn't persist the change.
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"], exact: false },
        (old) => {
          if (!old || !Array.isArray(old.products)) return old;
          return {
            ...old,
            products: old.products.map((p) =>
              p.id === updatedProduct.id ? updatedProduct : p
            ),
          };
        }
      );
      // Also update individual product cache if it exists
      queryClient.setQueryData(["products", updatedProduct.id], updatedProduct);
      toast.success(`"${updatedProduct.name}" updated successfully!`);
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: async (id) => {
      return apiClient
        .delete(`products/${id}`)
        .json<{ success: boolean; message: string }>();
    },
    onSuccess: (data, deletedId) => {
      // Remove the deleted product from every cached product-list query
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"], exact: false },
        (old) => {
          if (!old || !Array.isArray(old.products)) return old;
          return {
            ...old,
            products: old.products.filter((p) => p.id !== deletedId),
            total: Math.max(0, old.total - 1),
          };
        }
      );
      // Stats need a real refetch since they aggregate server-side
      queryClient.invalidateQueries({ queryKey: ["products", "stats"] });
      toast.success(data.message || "Product deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });
}
