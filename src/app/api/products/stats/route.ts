import { NextResponse } from "next/server";
import { fetchAndMapDummyJsonProducts } from "@/lib/db";

export async function GET() {
  try {
    const products = await fetchAndMapDummyJsonProducts();
    
    const totalProducts = products.length;
    const totalValuation = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

    return NextResponse.json({
      totalProducts,
      totalValuation,
      outOfStock,
      lowStock,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
