import { NextRequest, NextResponse } from "next/server";
import { fetchAndMapDummyJsonProducts, mapCategory } from "@/lib/db";
import { ProductCreateSchema, Product } from "@/lib/validation";
import { DummyJsonProduct } from "@/lib/dummyjson-types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    // Fetch and map all products dynamically from DummyJSON in real-time
    const mappedProducts = await fetchAndMapDummyJsonProducts();
    
    // 1. Filtering
    let filtered = mappedProducts.filter((product) => {
      // Search term match
      const matchesSearch =
        q === "" ||
        product.name.toLowerCase().includes(q.toLowerCase()) ||
        product.description.toLowerCase().includes(q.toLowerCase());

      // Category match
      const matchesCategory = category === "" || product.category === category;

      return matchesSearch && matchesCategory;
    });

    // 2. Sorting
    filtered.sort((a, b) => {
      let fieldA: any = a[sortBy as keyof Product] ?? "";
      let fieldB: any = b[sortBy as keyof Product] ?? "";

      // Handle string comparison (case insensitive)
      if (typeof fieldA === "string") {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }

      if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // 3. Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      products: paginatedProducts,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body using our local schema
    const validationResult = ProductCreateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          issues: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const inputData = validationResult.data;

    // Actively send request to DummyJSON simulated API
    console.log("Calling DummyJSON API to simulate adding product (Stateless)...");
    let responseData: Partial<DummyJsonProduct> = {};
    
    const externalResponse = await fetch("https://dummyjson.com/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: inputData.name,
        description: inputData.description,
        price: inputData.price,
        stock: inputData.stock,
        category: inputData.category.toLowerCase(),
        thumbnail: inputData.imageUrl || "",
      }),
    });

    if (externalResponse.ok) {
      responseData = await externalResponse.json();
      console.log("DummyJSON Product Add Response received:", responseData);
    } else {
      throw new Error(`DummyJSON API returned status ${externalResponse.status}`);
    }

    // Map response back to our internal Product structure (ensuring custom generated UUID)
    const newProduct: Product = {
      id: crypto.randomUUID(), // Guarantee a valid UUID for React routes
      name: responseData.title || inputData.name,
      description: responseData.description || inputData.description,
      price: responseData.price || inputData.price,
      category: responseData.category ? mapCategory(responseData.category) : inputData.category,
      stock: responseData.stock || inputData.stock,
      imageUrl: responseData.thumbnail || inputData.imageUrl || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Pure Stateless: We do NOT merge or save to a local database array. We just return it!
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Bad Request", message: error.message },
      { status: 400 }
    );
  }
}
