import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productSpecs, equationConfigs, companies, motorTypes } from "@/db/schema";
import { eq, sql, and, or } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { desiredTorque, desiredSpeed, motorTypeId, applicationId, voltageId, frequencyId } = body;

        if (desiredTorque === undefined || desiredSpeed === undefined) {
            return NextResponse.json({ error: "Missing required mechanical parameters" }, { status: 400 });
        }

        const configs = await db.select().from(equationConfigs).where(eq(equationConfigs.isActive, true));

        const safetyConfig = configs.find(c => c.keyName === 'safety_margin_multiplier' || c.keyName === 'Required Power') || configs[0];
        const safetyMultiplier = safetyConfig?.constantValue ? Number(safetyConfig.constantValue) : 1;

        // Naive Power Calculation: P (kW) = Torque (Nm) * Speed (RPM) / 9550 * Safety
        const requiredPower = (Number(desiredTorque) * Number(desiredSpeed) / 9550) * safetyMultiplier;

        let baseQuery = db
            .select({
                product: products,
                specs: productSpecs,
                companyName: companies.name,
                motorTypeName: motorTypes.name,
            })
            .from(productSpecs)
            .innerJoin(products, eq(productSpecs.productId, products.id))
            .leftJoin(companies, eq(products.companyId, companies.id))
            .leftJoin(motorTypes, eq(products.motorTypeId, motorTypes.id))
            .where(sql`CAST(COALESCE(${productSpecs.acKw}, ${productSpecs.dcKw}) AS NUMERIC) >= ${requiredPower}`);

        const formattedResults = (await baseQuery).filter(row => {
            if (motorTypeId && row.product.motorTypeId !== motorTypeId) return false;
            if (applicationId && (row.specs.acApplicationId !== applicationId && row.specs.dcApplicationId !== applicationId)) return false;
            if (voltageId && row.specs.voltageId !== voltageId) return false;
            if (frequencyId && row.specs.frequencyId !== frequencyId) return false;
            return true;
        }).map(row => ({
            ...row.product,
            companyName: row.companyName,
            motorTypeName: row.motorTypeName,
            specs: row.specs
        }));

        return NextResponse.json({
            inputs: { desiredTorque, desiredSpeed, motorTypeId, applicationId, voltageId, frequencyId },
            calculatedRequiredPower: requiredPower,
            results: formattedResults
        });
    } catch (err: any) {
        console.error("Smart Search POST Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const desiredTorque = searchParams.get("torque");
        const desiredSpeed = searchParams.get("speed");
        const motorTypeId = searchParams.get("motorTypeId");
        const applicationId = searchParams.get("applicationId");
        const voltageId = searchParams.get("voltageId");
        const frequencyId = searchParams.get("frequencyId");

        if (!desiredTorque || !desiredSpeed) {
            return NextResponse.json({ error: "Missing required mechanical parameters" }, { status: 400 });
        }

        const configs = await db.select().from(equationConfigs).where(eq(equationConfigs.isActive, true));

        const safetyConfig = configs.find(c => c.keyName === 'safety_margin_multiplier' || c.keyName === 'Required Power') || configs[0];
        const safetyMultiplier = safetyConfig?.constantValue ? Number(safetyConfig.constantValue) : 1;

        // P (kW) = Torque (Nm) * Speed (RPM) / 9550 * Safety
        const requiredPower = (Number(desiredTorque) * Number(desiredSpeed) / 9550) * safetyMultiplier;

        let baseQuery = db
            .select({
                product: products,
                specs: productSpecs,
                companyName: companies.name,
                motorTypeName: motorTypes.name,
            })
            .from(productSpecs)
            .innerJoin(products, eq(productSpecs.productId, products.id))
            .leftJoin(companies, eq(products.companyId, companies.id))
            .leftJoin(motorTypes, eq(products.motorTypeId, motorTypes.id))
            .where(sql`CAST(COALESCE(${productSpecs.acKw}, ${productSpecs.dcKw}) AS NUMERIC) >= ${requiredPower}`);

        const matchingSpecs = await baseQuery;

        const formattedResults = matchingSpecs.filter(row => {
            if (motorTypeId && row.product.motorTypeId !== motorTypeId) return false;
            if (applicationId && (row.specs.acApplicationId !== applicationId && row.specs.dcApplicationId !== applicationId)) return false;
            if (voltageId && row.specs.voltageId !== voltageId) return false;
            if (frequencyId && row.specs.frequencyId !== frequencyId) return false;
            return true;
        }).map(row => ({
            ...row.product,
            companyName: row.companyName,
            motorTypeName: row.motorTypeName,
            specs: row.specs
        }));

        return NextResponse.json({
            inputs: { desiredTorque, desiredSpeed, motorTypeId, applicationId, voltageId, frequencyId },
            calculatedRequiredPower: requiredPower,
            results: formattedResults
        });
    } catch (err: any) {
        console.error("Smart Search GET Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
