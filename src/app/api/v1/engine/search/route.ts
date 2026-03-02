import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productSpecs, equationConfigs } from "@/db/schema";
import { eq, gte, and } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { desiredTorque, desiredSpeed } = body;

        if (desiredTorque === undefined || desiredSpeed === undefined) {
            return NextResponse.json({ error: "Missing required mechanical parameters" }, { status: 400 });
        }

        // Example naive logic: Power = Torque * Speed * Constant
        // Normally, you'd fetch formulas from equationConfigs and safely evaluate them.
        const configs = await db.select().from(equationConfigs).where(eq(equationConfigs.isActive, true));

        // Find the safety multiplier if it exists, otherwise default to 1
        const safetyConfig = configs.find(c => c.keyName === 'safety_margin_multiplier');
        const safetyMultiplier = safetyConfig?.constantValue ? Number(safetyConfig.constantValue) : 1;

        // Fake calculate required power 
        const requiredPower = (Number(desiredTorque) * Number(desiredSpeed)) * safetyMultiplier;

        // Query DB for matching products where ratedPower >= requiredPower
        // We join products and product_specs
        // For Drizzle ORM Relational Queries:
        const matchingSpecs = await db
            .select({
                product: products,
                specs: productSpecs
            })
            .from(productSpecs)
            .innerJoin(products, eq(productSpecs.productId, products.id))
            .where(gte(productSpecs.ratedPower, requiredPower.toString()));

        const formattedResults = matchingSpecs.map(row => ({
            ...row.product,
            specs: row.specs
        }));

        return NextResponse.json({
            inputs: { desiredTorque, desiredSpeed },
            calculatedRequiredPower: requiredPower,
            results: formattedResults
        });
    } catch (err: any) {
        console.error("Smart Search Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
