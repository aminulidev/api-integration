import { NextRequest, NextResponse } from "next/server";
import { fetchAndMapDummyJsonProducts, mapCategory } from "@/lib/db";
import { ProductUpdateSchema, Product } from "@/lib/validation";
import { DummyJsonProduct } from "@/lib/dummyjson-types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // Fetch and map all products dynamically from DummyJSON in real-time
    const mappedProducts = await fetchAndMapDummyJsonProducts();
    const product = mappedProducts.find((p) => p.id === id);

    if (!product) {
      return NextResponse.json(
        { error: "Not Found", message: `Product with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate update body using our local schema
    const validationResult = ProductUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          issues: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Retrieve the existing product statelessly to verify it exists and get base values
    const mappedProducts = await fetchAndMapDummyJsonProducts();
    const currentProduct = mappedProducts.find((p) => p.id === id);

    if (!currentProduct) {
      return NextResponse.json(
        { error: "Not Found", message: `Product with ID ${id} not found` },
        { status: 404 }
      );
    }

    const updateInput = validationResult.data;

    // Actively simulate the DummyJSON PUT request
    console.log(`Calling DummyJSON API to simulate updating product ${id} (Stateless)...`);
    let responseData: Partial<DummyJsonProduct> = {};
    try {
      // Simulate external PUT request (DummyJSON has IDs 1-100, we use ID 1 as a dummy target to avoid 404s)
      const externalResponse = await fetch("https://dummyjson.com/products/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updateInput.name,
          description: updateInput.description,
          price: updateInput.price,
          stock: updateInput.stock,
          category: updateInput.category ? updateInput.category.toLowerCase() : undefined,
          thumbnail: updateInput.imageUrl,
        }),
      });

      if (externalResponse.ok) {
        responseData = await externalResponse.json();
        console.log("DummyJSON Product Update Response received:", responseData);
      } else {
        throw new Error(`DummyJSON API returned status ${externalResponse.status}`);
      }
    } catch (apiError) {
      console.warn("DummyJSON Product Update API call failed, continuing with local mapping...", apiError);
    }

    // Merge the updated inputs into the existing product data
    const updatedProduct: Product = {
      ...currentProduct,
      name: updateInput.name ?? currentProduct.name,
      description: updateInput.description ?? currentProduct.description,
      price: updateInput.price ?? currentProduct.price,
      stock: updateInput.stock ?? currentProduct.stock,
      category: updateInput.category ?? currentProduct.category,
      imageUrl: updateInput.imageUrl ?? currentProduct.imageUrl,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Bad Request", message: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Retrieve the existing product statelessly to verify it exists
    const mappedProducts = await fetchAndMapDummyJsonProducts();
    const productExists = mappedProducts.some((p) => p.id === id);

    if (!productExists) {
      return NextResponse.json(
        { error: "Not Found", message: `Product with ID ${id} not found` },
        { status: 404 }
      );
    }

    // Actively simulate the DummyJSON DELETE request
    console.log(`Calling DummyJSON API to simulate deleting product ${id} (Stateless)...`);
    try {
      // Simulate external DELETE request using dummy product ID 1 to avoid 404s
      const externalResponse = await fetch("https://dummyjson.com/products/1", {
        method: "DELETE",
      });

      if (externalResponse.ok) {
        const responseData = await externalResponse.json();
        console.log("DummyJSON Product Delete Response received:", responseData);
      } else {
        throw new Error(`DummyJSON API returned status ${externalResponse.status}`);
      }
    } catch (apiError) {
      console.warn("DummyJSON Product Delete API call failed, continuing with success simulation...", apiError);
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
