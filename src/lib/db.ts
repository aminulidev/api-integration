import { Product, PRODUCT_CATEGORIES } from "./validation";
import { DummyJsonProduct, DummyJsonProductsResponse } from "./dummyjson-types";

// Helper to map DummyJSON product categories to our Zod enum values
export const mapCategory = (dummyCategory: string): typeof PRODUCT_CATEGORIES[number] => {
  const categoryLower = dummyCategory.toLowerCase();
  
  if (
    categoryLower.includes("smartphone") || 
    categoryLower.includes("laptop") || 
    categoryLower.includes("tablet") || 
    categoryLower.includes("accessory") || 
    categoryLower.includes("electronics") ||
    categoryLower.includes("lighting") ||
    categoryLower.includes("watch") ||
    categoryLower.includes("sunglasses") ||
    categoryLower.includes("device")
  ) {
    return "Electronics";
  }
  
  if (
    categoryLower.includes("shirt") || 
    categoryLower.includes("shoe") || 
    categoryLower.includes("dress") || 
    categoryLower.includes("clothing") || 
    categoryLower.includes("bag") || 
    categoryLower.includes("jewellery") || 
    categoryLower.includes("tops") || 
    categoryLower.includes("wear") ||
    categoryLower.includes("apparel")
  ) {
    return "Clothing";
  }
  
  if (
    categoryLower.includes("furniture") || 
    categoryLower.includes("home") || 
    categoryLower.includes("kitchen") || 
    categoryLower.includes("decor") ||
    categoryLower.includes("groceries") ||
    categoryLower.includes("household")
  ) {
    return "Home & Kitchen";
  }
  
  if (
    categoryLower.includes("book") || 
    categoryLower.includes("novel") || 
    categoryLower.includes("magazine") ||
    categoryLower.includes("literature")
  ) {
    return "Books";
  }
  
  if (
    categoryLower.includes("sport") || 
    categoryLower.includes("outdoors") || 
    categoryLower.includes("motorcycle") || 
    categoryLower.includes("vehicle") || 
    categoryLower.includes("car") ||
    categoryLower.includes("automotive") ||
    categoryLower.includes("bicycle")
  ) {
    return "Sports & Outdoors";
  }
  
  if (
    categoryLower.includes("beauty") || 
    categoryLower.includes("fragrance") || 
    categoryLower.includes("care") || 
    categoryLower.includes("skin") || 
    categoryLower.includes("soap") ||
    categoryLower.includes("perfume") ||
    categoryLower.includes("cosmetic")
  ) {
    return "Beauty & Personal Care";
  }
  
  return "Electronics"; // Default fallback
};

// Pure stateless loader that queries the DummyJSON Products API dynamically in real-time
export const fetchAndMapDummyJsonProducts = async (): Promise<Product[]> => {
  try {
    console.log("Dynamically fetching products from DummyJSON Products API (Stateless)...");
    const response = await fetch("https://dummyjson.com/products?limit=100", {
      next: { revalidate: 30 } // Server cache revalidation for 30s for performance
    });
    
    if (!response.ok) {
      throw new Error(`DummyJSON fetch failed: status ${response.status}`);
    }
    
    const data = (await response.json()) as DummyJsonProductsResponse;
    
    if (data && Array.isArray(data.products)) {
      return data.products.map((item: DummyJsonProduct) => {
        // Generate a stable UUID string based on the numeric ID so GET by UUID is stable
        // UUID format: d3b07384-d113-4956-a5cc-e0e64f7bXXXX (where XXXX is padded ID)
        const idString = String(item.id).padStart(4, "0");
        const stableUuid = `d3b07384-d113-4956-a5cc-e0e64f7b${idString}`;

        return {
          id: stableUuid, // Stable UUID string for Zod validation schema and client safety
          name: item.title,
          description: item.description,
          price: item.price,
          category: mapCategory(item.category),
          stock: item.stock,
          imageUrl: item.thumbnail || (item.images && item.images[0]) || "",
          createdAt: item.meta?.createdAt || new Date("2026-01-10T08:30:00Z").toISOString(),
          updatedAt: item.meta?.updatedAt || new Date("2026-01-10T08:30:00Z").toISOString(),
        };
      });
    } else {
      throw new Error("Invalid response format from DummyJSON");
    }
  } catch (error) {
    console.error("Error fetching dynamically from DummyJSON:", error);
    return [];
  }
};
