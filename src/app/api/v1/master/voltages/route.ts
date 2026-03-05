import { NextResponse } from "next/server";
import { db } from "@/db";
import { masterVoltages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const allVoltages = await db.select().from(masterVoltages).orderBy(masterVoltages.voltageValue);
        return NextResponse.json(allVoltages);
    } catch (err) {
        console.error("GET /master/voltages error", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { voltageValue, unit } = body;

        if (voltageValue === undefined) {
            return NextResponse.json({ error: "Missing required field: voltageValue" }, { status: 400 });
        }

        const numericValue = typeof voltageValue === 'string' ? parseFloat(voltageValue) : voltageValue;

        // This checks for exact match, in a real app we might want to check within a tolerance for decimals
        const existing = await db.select().from(masterVoltages).where(eq(masterVoltages.voltageValue, numericValue.toString()));
        if (existing.length > 0) {
            return NextResponse.json(existing[0], { status: 200 });
        }

        const [newVoltage] = await db.insert(masterVoltages).values({
            voltageValue: numericValue.toString(),
            unit: unit || "V",
        }).returning();

        return NextResponse.json(newVoltage, { status: 201 });
    } catch (err) {
        console.error("POST /master/voltages error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
