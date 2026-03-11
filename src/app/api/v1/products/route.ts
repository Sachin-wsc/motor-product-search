import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productSpecs, companies, motorTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { getExtension } from "@/lib/utils";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const motorTypeId = searchParams.get('motorTypeId');
        const companyId = searchParams.get('companyId');

        let query = db
            .select({
                id: products.id,
                name: products.name,
                sku: products.sku,
                summary: products.summary,
                images: products.images,
                isActive: products.isActive,
                createdAt: products.createdAt,
                updatedAt: products.updatedAt,
                companyId: products.companyId,
                motorTypeId: products.motorTypeId,
                companyName: companies.name,
                motorTypeName: motorTypes.name,
                specs: productSpecs,
            })
            .from(products)
            .leftJoin(companies, eq(products.companyId, companies.id))
            .leftJoin(motorTypes, eq(products.motorTypeId, motorTypes.id))
            .leftJoin(productSpecs, eq(products.id, productSpecs.productId));


        let queryParams = [];

        if (motorTypeId) {
            queryParams.push(eq(products.motorTypeId, motorTypeId));
        }

        if (companyId) {
            queryParams.push(eq(products.companyId, companyId));
        }

        // Apply conditions using AND if there are any
        let finalQuery: any = query;
        if (queryParams.length > 0) {
            const { and } = require("drizzle-orm");
            finalQuery = query.where(and(...queryParams));
        }

        const allProducts = await finalQuery;
        return NextResponse.json(allProducts);
    } catch (err: any) {
        console.error("GET /products error", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// export async function POST(request: Request) {
//     try {
//         const formData = await request.formData();
//         const name = formData.get("name") as string;
//         const sku = formData.get("sku") as string;
//         const summary = formData.get("summary") as string;
//         const companyId = formData.get("companyId") as string;
//         const motorTypeId = formData.get("motorTypeId") as string;
//         const specsStr = formData.get("specs") as string;
//         const specs = specsStr ? JSON.parse(specsStr) : null;
//         const formImages = formData.getAll("image") as File[]; // Could be multiple
//         const documentFile = formData.get("document") as File | null;

//         if (!name || !sku || !motorTypeId || !companyId || !specs) {
//             return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//         }

//         // Check for duplicate SKU before proceeding
//         const existingProduct = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
//         if (existingProduct.length > 0) {
//             return NextResponse.json({ error: "A product with this SKU already exists." }, { status: 400 });
//         }

//         let images: string[] = [];
//         if (formImages && formImages.length > 0) {
//             const uploadDir = path.join(process.cwd(), "public", "uploads");
//             await mkdir(uploadDir, { recursive: true });

//             for (const image of formImages) {
//                 if (image.size > 0) {
//                     const bytes = await image.arrayBuffer();
//                     const buffer = Buffer.from(bytes);
//                     const filename = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
//                     await writeFile(path.join(uploadDir, filename), buffer);
//                     images.push(`/uploads/${filename}`);
//                 }
//             }
//         }

//         let documentUrl: string | null = null;

//         if (documentFile && documentFile.size > 0) {
//             const uploadDir = path.join(process.cwd(), "public", "uploads");
//             await mkdir(uploadDir, { recursive: true });
//             const bytes = await documentFile.arrayBuffer();
//             const buffer = Buffer.from(bytes);
//             const filename = `${Date.now()}-doc-${documentFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
//             await writeFile(path.join(uploadDir, filename), buffer);
//             documentUrl = `/uploads/${filename}`;
//         }

//         // Insert Product
//         const newProductId = crypto.randomUUID();
//         await db.insert(products).values({
//             id: newProductId,
//             name,
//             sku,
//             summary,
//             companyId,
//             motorTypeId,
//             images,
//             documentUrl,
//         });

//         const [newProduct] = await db.select().from(products).where(eq(products.id, newProductId));

//         // Extract raw specs
//         const {
//             isAC,
//             // AC
//             acKw, poleId, voltageId, frequencyId, acApplicationId, totalMotors, motorsPerGroup,
//             // DC
//             dcArmatureVoltage, dcKw, dcFieldVoltage, dcFieldCurrent, dcApplicationId
//         } = specs;

//         // Insert Specs, zeroing/nulling out opposite motor type fields
//         const newSpecId = crypto.randomUUID();
//         await db.insert(productSpecs).values({
//             id: newSpecId,
//             productId: newProduct.id,
//             isAC: isAC,
//             acKw: isAC ? acKw : null,
//             poleId: isAC ? poleId : null,
//             voltageId: isAC ? voltageId : null,
//             frequencyId: isAC ? frequencyId : null,
//             acApplicationId: isAC ? acApplicationId : null,
//             totalMotors: isAC ? totalMotors : null,
//             motorsPerGroup: isAC ? motorsPerGroup : null,

//             dcArmatureVoltage: !isAC ? dcArmatureVoltage : null,
//             dcKw: !isAC ? dcKw : null,
//             dcFieldVoltage: !isAC ? dcFieldVoltage : null,
//             dcFieldCurrent: !isAC ? dcFieldCurrent : null,
//             dcApplicationId: !isAC ? dcApplicationId : null,
//         });

//         return NextResponse.json(newProduct, { status: 201 });
//     } catch (err: any) {
//         console.error("POST /products error:", err);
//         return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//     }
// }


export async function POST(request: Request) {
    try {

        const formData = await request.formData();

        const name = formData.get("name") as string;
        const sku = formData.get("sku") as string;
        const summary = formData.get("summary") as string;
        const companyId = formData.get("companyId") as string;
        const motorTypeId = formData.get("motorTypeId") as string;
        const specsStr = formData.get("specs") as string;

        const specs = specsStr ? JSON.parse(specsStr) : null;

        const formImages = formData.getAll("image") as File[];
        const documentFile = formData.get("document") as File | null;

        if (!name || !sku || !motorTypeId || !companyId || !specs) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check duplicate SKU
        const existingProduct = await db
            .select()
            .from(products)
            .where(eq(products.sku, sku))
            .limit(1);

        if (existingProduct.length > 0) {
            return NextResponse.json(
                { error: "A product with this SKU already exists." },
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads");

        await mkdir(uploadDir, { recursive: true });

        let images: string[] = [];

        // Upload Images
        if (formImages && formImages.length > 0) {

            for (const image of formImages) {

                if (image.size === 0) continue;

                const bytes = await image.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const ext = getExtension(image.type);

                const filename =
                    Date.now() + "-" + crypto.randomUUID() + "." + ext;

                const filepath = path.join(uploadDir, filename);

                await writeFile(filepath, buffer);

                images.push(`/uploads/${filename}`);
            }
        }

        // Upload Document
        let documentUrl: string | null = null;

        if (documentFile && documentFile.size > 0) {

            const bytes = await documentFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const safeName = documentFile.name.replace(/[^a-zA-Z0-9.]/g, "");

            const filename =
                Date.now() + "-doc-" + crypto.randomUUID() + "-" + safeName;

            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);

            documentUrl = `/uploads/${filename}`;
        }

        // Insert Product
        const newProductId = crypto.randomUUID();

        await db.insert(products).values({
            id: newProductId,
            name,
            sku,
            summary,
            companyId,
            motorTypeId,
            images,
            documentUrl,
        });

        const [newProduct] = await db
            .select()
            .from(products)
            .where(eq(products.id, newProductId));

        const {
            isAC,

            // AC
            acKw,
            poleId,
            voltageId,
            frequencyId,
            acApplicationId,
            totalMotors,
            motorsPerGroup,

            // DC
            dcArmatureVoltage,
            dcKw,
            dcFieldVoltage,
            dcFieldCurrent,
            dcApplicationId,

        } = specs;

        const newSpecId = crypto.randomUUID();

        await db.insert(productSpecs).values({
            id: newSpecId,
            productId: newProduct.id,

            isAC,

            acKw: isAC ? acKw : null,
            poleId: isAC ? poleId : null,
            voltageId: isAC ? voltageId : null,
            frequencyId: isAC ? frequencyId : null,
            acApplicationId: isAC ? acApplicationId : null,
            totalMotors: isAC ? totalMotors : null,
            motorsPerGroup: isAC ? motorsPerGroup : null,

            dcArmatureVoltage: !isAC ? dcArmatureVoltage : null,
            dcKw: !isAC ? dcKw : null,
            dcFieldVoltage: !isAC ? dcFieldVoltage : null,
            dcFieldCurrent: !isAC ? dcFieldCurrent : null,
            dcApplicationId: !isAC ? dcApplicationId : null,
        });

        return NextResponse.json(newProduct, { status: 201 });

    } catch (err: any) {

        console.error("POST /products error:", err);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}