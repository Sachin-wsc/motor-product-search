import { NextResponse } from "next/server";
import { db } from "@/db";
import { masterFrequencies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const allFrequencies = await db.select().from(masterFrequencies).orderBy(masterFrequencies.frequencyValue);
        return NextResponse.json(allFrequencies);
    } catch (err) {
        console.error("GET /master/frequencies error", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { frequencyValue, unit } = body;

        if (frequencyValue === undefined) {
            return NextResponse.json({ error: "Missing required field: frequencyValue" }, { status: 400 });
        }

        const numericValue = typeof frequencyValue === 'string' ? parseFloat(frequencyValue) : frequencyValue;

        const existing = await db.select().from(masterFrequencies).where(eq(masterFrequencies.frequencyValue, numericValue.toString()));
        if (existing.length > 0) {
            return NextResponse.json(existing[0], { status: 200 });
        }

        const [newFrequency] = await db.insert(masterFrequencies).values({
            frequencyValue: numericValue.toString(),
            unit: unit || "Hz",
        }).returning();

        return NextResponse.json(newFrequency, { status: 201 });
    } catch (err) {
        console.error("POST /master/frequencies error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
