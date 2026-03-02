import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productSpecs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const [product] = await db.select().from(products).where(eq(products.id, id));
        if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const [specs] = await db.select().from(productSpecs).where(eq(productSpecs.productId, id));

        return NextResponse.json({ ...product, specs: specs || null });
    } catch (err: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Build product update payload
        let productUpdate: any = { updatedAt: new Date() };
        if (body.name !== undefined) productUpdate.name = body.name;
        if (body.sku !== undefined) productUpdate.sku = body.sku;
        if (body.summary !== undefined) productUpdate.summary = body.summary;
        if (body.motorType !== undefined) productUpdate.motorType = body.motorType;
        if (body.isActive !== undefined) productUpdate.isActive = body.isActive;

        const [updatedProduct] = await db.update(products)
            .set(productUpdate)
            .where(eq(products.id, id))
            .returning();

        if (!updatedProduct) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Update specs if specs object is provided
        let updatedSpecs = null;
        if (body.specs) {
            const specUpdate = { ...body.specs };
            delete specUpdate.id;
            delete specUpdate.productId;

            // Try to update existing specs
            const res = await db.update(productSpecs)
                .set(specUpdate)
                .where(eq(productSpecs.productId, id))
                .returning();

            if (res.length > 0) {
                updatedSpecs = res[0];
            } else {
                // Insert specs if they didn't exist before
                const [newSpecs] = await db.insert(productSpecs)
                    .values({ ...specUpdate, productId: id })
                    .returning();
                updatedSpecs = newSpecs;
            }
        }

        return NextResponse.json({ ...updatedProduct, specs: updatedSpecs });
    } catch (err: any) {
        console.error("PUT /products/[id] error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(products).where(eq(products.id, id));
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
