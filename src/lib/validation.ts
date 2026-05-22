import { z } from "zod";

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Books",
  "Sports & Outdoors",
  "Beauty & Personal Care",
] as const;

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must not exceed 50 characters"),
  description: z.string()
    .min(5, "Description must be at least 5 characters long")
    .max(500, "Description must not exceed 500 characters")
    .or(z.literal("")),
  price: z.coerce.number()
    .gt(0, "Price must be greater than 0")
    .max(100000, "Price cannot exceed 100,000"),
  category: z.enum(PRODUCT_CATEGORIES, {
    message: "Please select a valid category",
  }),
  stock: z.coerce.number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(10000, "Stock cannot exceed 10,000"),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductCreateSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;

export const ProductUpdateSchema = ProductCreateSchema.partial();

export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
