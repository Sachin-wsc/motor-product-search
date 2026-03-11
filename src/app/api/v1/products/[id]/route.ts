import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productSpecs, companies, motorTypes, masterPoles, masterVoltages, masterFrequencies, masterApplications } from "@/db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { mysqlTable, varchar, text, boolean, timestamp, decimal, json, alias } from "drizzle-orm/mysql-core";
import crypto from "crypto";
import { getExtension } from "@/lib/utils";

const acApplications = alias(masterApplications, "acApplications");
const dcApplications = alias(masterApplications, "dcApplications");

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        let query = db
            .select({
                product: products,
                specs: productSpecs,
                companyName: companies.name,
                motorTypeName: motorTypes.name,
                poleNumber: masterPoles.poleNumber,
                voltageValue: masterVoltages.voltageValue,
                voltageUnit: masterVoltages.unit,
                frequencyValue: masterFrequencies.frequencyValue,
                frequencyUnit: masterFrequencies.unit,
                acApplicationName: acApplications.name,
                dcApplicationName: dcApplications.name,
            })
            .from(products)
            .leftJoin(productSpecs, eq(products.id, productSpecs.productId))
            .leftJoin(companies, eq(products.companyId, companies.id))
            .leftJoin(motorTypes, eq(products.motorTypeId, motorTypes.id))
            .leftJoin(masterPoles, eq(productSpecs.poleId, masterPoles.id))
            .leftJoin(masterVoltages, eq(productSpecs.voltageId, masterVoltages.id))
            .leftJoin(masterFrequencies, eq(productSpecs.frequencyId, masterFrequencies.id))
            .leftJoin(acApplications, eq(productSpecs.acApplicationId, acApplications.id))
            .leftJoin(dcApplications, eq(productSpecs.dcApplicationId, dcApplications.id))
            .where(eq(products.id, id));

        const result = await query;

        if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const row = result[0];

        return NextResponse.json({
            ...row.product,
            companyName: row.companyName,
            motorTypeName: row.motorTypeName,
            specs: row.specs && row.specs.id ? {
                ...row.specs,
                poleNumber: row.poleNumber,
                voltageValue: row.voltageValue,
                voltageUnit: row.voltageUnit,
                frequencyValue: row.frequencyValue,
                frequencyUnit: row.frequencyUnit,
                acApplicationName: row.acApplicationName,
                dcApplicationName: row.dcApplicationName,
            } : null
        });
    } catch (err: any) {
        console.error("GET /products/[id] error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    let productUpdate: any = { updatedAt: new Date() };

    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const summary = formData.get("summary") as string;
    const companyId = formData.get("companyId") as string;
    const motorTypeId = formData.get("motorTypeId") as string;
    const isActiveStr = formData.get("isActive") as string;

    const formImages = formData.getAll("image") as File[];
    const existingImagesStr = formData.get("existingImages") as string;
    const documentFile = formData.get("document") as File | null;

    let finalImages: string[] = [];
    let hasImagesField = false;

    if (existingImagesStr !== null) {
      hasImagesField = true;
      try {
        finalImages = JSON.parse(existingImagesStr);
      } catch (e) {
        console.error("Failed to parse existingImages", e);
      }
    }

    if (name !== null) productUpdate.name = name;
    if (sku !== null) productUpdate.sku = sku;
    if (summary !== null) productUpdate.summary = summary;
    if (companyId !== null) productUpdate.companyId = companyId;
    if (motorTypeId !== null) productUpdate.motorTypeId = motorTypeId;
    if (isActiveStr !== null) productUpdate.isActive = isActiveStr === "true";

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Upload new images
    if (formImages && formImages.length > 0) {
      let uploadedImages: string[] = [];

      for (const image of formImages) {
        if (image && image.size > 0) {
          const bytes = await image.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const ext = getExtension(image.type);

          const filename =
            Date.now() + "-" + crypto.randomUUID() + "." + ext;

          const filepath = path.join(uploadDir, filename);

          await writeFile(filepath, buffer);

          uploadedImages.push(`/uploads/${filename}`);
        }
      }

      if (uploadedImages.length > 0) {
        hasImagesField = true;
        finalImages = [...finalImages, ...uploadedImages];
      }
    }

    if (hasImagesField) {
      productUpdate.images = finalImages;
    }

    // Upload document
    if (documentFile && documentFile.size > 0) {
      const bytes = await documentFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeName = documentFile.name.replace(/[^a-zA-Z0-9.]/g, "");

      const filename =
        Date.now() + "-doc-" + crypto.randomUUID() + "-" + safeName;

      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);

      productUpdate.documentUrl = `/uploads/${filename}`;
    }

    // Update product
    await db.update(products)
      .set(productUpdate)
      .where(eq(products.id, id));

    const [updatedProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Update specs
    const specsStr = formData.get("specs") as string;
    let updatedSpecs = null;

    if (specsStr) {
      const specsObj = JSON.parse(specsStr);
      const isAC = specsObj.isAC;

      let specUpdate: any = { isAC };

      if (isAC) {
        specUpdate.acKw = specsObj.acKw;
        specUpdate.poleId = specsObj.poleId;
        specUpdate.voltageId = specsObj.voltageId;
        specUpdate.frequencyId = specsObj.frequencyId;
        specUpdate.acApplicationId = specsObj.acApplicationId;
        specUpdate.totalMotors = specsObj.totalMotors;
        specUpdate.motorsPerGroup = specsObj.motorsPerGroup;

        specUpdate.dcArmatureVoltage = null;
        specUpdate.dcKw = null;
        specUpdate.dcFieldVoltage = null;
        specUpdate.dcFieldCurrent = null;
        specUpdate.dcApplicationId = null;

      } else {
        specUpdate.dcArmatureVoltage = specsObj.dcArmatureVoltage;
        specUpdate.dcKw = specsObj.dcKw;
        specUpdate.dcFieldVoltage = specsObj.dcFieldVoltage;
        specUpdate.dcFieldCurrent = specsObj.dcFieldCurrent;
        specUpdate.dcApplicationId = specsObj.dcApplicationId;

        specUpdate.acKw = null;
        specUpdate.poleId = null;
        specUpdate.voltageId = null;
        specUpdate.frequencyId = null;
        specUpdate.acApplicationId = null;
        specUpdate.totalMotors = null;
        specUpdate.motorsPerGroup = null;
      }

      await db.update(productSpecs)
        .set(specUpdate)
        .where(eq(productSpecs.productId, id));

      const specsRes = await db
        .select()
        .from(productSpecs)
        .where(eq(productSpecs.productId, id));

      if (specsRes.length > 0) {
        updatedSpecs = specsRes[0];
      } else {
        const newSpecId = crypto.randomUUID();

        await db.insert(productSpecs).values({
          ...specUpdate,
          productId: id,
          id: newSpecId,
          isAC,
        });

        const [newSpecs] = await db
          .select()
          .from(productSpecs)
          .where(eq(productSpecs.id, newSpecId));

        updatedSpecs = newSpecs;
      }
    }

    return NextResponse.json({
      ...updatedProduct,
      specs: updatedSpecs,
    });

  } catch (err: any) {
    console.error("PUT /products/[id] error:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
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
