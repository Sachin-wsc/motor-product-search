import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productSpecs } from "@/db/schema";
import { eq } from "drizzle-orm";

import path from "path";
import { writeFile, mkdir } from "fs/promises";

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
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const sku = formData.get("sku") as string;
        const summary = formData.get("summary") as string;
        const motorType = formData.get("motorType") as string;
        const specsStr = formData.get("specs") as string;
        const specs = specsStr ? JSON.parse(specsStr) : null;
        const image = formData.get("image") as File;

        if (!name || !sku || !motorType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let imageUrl = null;
        if (image && image.size > 0) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads");
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);
            imageUrl = `/uploads/${filename}`;
        }

        // Insert Product
        const [newProduct] = await db.insert(products).values({
            name,
            sku,
            summary,
            motorType,
            imageUrl,
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
