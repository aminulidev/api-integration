/**
 * TypeScript definitions representing the DummyJSON Product API schema.
 * This acts as self-documenting type declarations for API integration.
 */

export interface DummyJsonProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface DummyJsonProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface DummyJsonProductMeta {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

export interface DummyJsonProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: DummyJsonProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: DummyJsonProductReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: DummyJsonProductMeta;
  images: string[];
  thumbnail: string;
}

export interface DummyJsonProductsResponse {
  products: DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
}
