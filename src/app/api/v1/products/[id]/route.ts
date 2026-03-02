import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productSpecs } from "@/db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

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
        const formData = await request.formData();

        // Build product update payload
        let productUpdate: any = { updatedAt: new Date() };

        const name = formData.get("name") as string;
        const sku = formData.get("sku") as string;
        const summary = formData.get("summary") as string;
        const motorType = formData.get("motorType") as string;
        const isActiveStr = formData.get("isActive") as string;
        const image = formData.get("image") as File;

        if (name !== null) productUpdate.name = name;
        if (sku !== null) productUpdate.sku = sku;
        if (summary !== null) productUpdate.summary = summary;
        if (motorType !== null) productUpdate.motorType = motorType;
        if (isActiveStr !== null) productUpdate.isActive = isActiveStr === "true";

        if (image && image.size > 0) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads");
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);
            productUpdate.imageUrl = `/uploads/${filename}`;
        }

        const [updatedProduct] = await db.update(products)
            .set(productUpdate)
            .where(eq(products.id, id))
            .returning();

        if (!updatedProduct) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Update specs if specs object is provided
        const specsStr = formData.get("specs") as string;
        let updatedSpecs = null;
        if (specsStr) {
            const specsObj = JSON.parse(specsStr);
            const specUpdate = { ...specsObj };
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
