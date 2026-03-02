import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productSpecs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const motorType = searchParams.get('motor_type');

        let query = db.select().from(products);

        // In a real app we'd add where clauses for motorType if it exists
        const allProducts = await query;
        return NextResponse.json(allProducts);
    } catch (err: any) {
        console.error("GET /products error", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, sku, summary, motorType, specs } = body;

        if (!name || !sku || !motorType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Insert Product
        const [newProduct] = await db.insert(products).values({
            name,
            sku,
            summary,
            motorType,
        }).returning();

        // Insert Specs
        if (specs) {
            await db.insert(productSpecs).values({
                productId: newProduct.id,
                ...specs
            });
        }

        return NextResponse.json(newProduct, { status: 201 });
    } catch (err: any) {
        console.error("POST /products error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
