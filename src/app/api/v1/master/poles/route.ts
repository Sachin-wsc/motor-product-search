import { NextResponse } from "next/server";
import { db } from "@/db";
import { masterPoles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const allPoles = await db.select().from(masterPoles).orderBy(masterPoles.poleNumber);
        return NextResponse.json(allPoles);
    } catch (err) {
        console.error("GET /master/poles error", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { poleNumber } = body;

        if (!poleNumber) {
            return NextResponse.json({ error: "Missing required field: poleNumber" }, { status: 400 });
        }

        const existing = await db.select().from(masterPoles).where(eq(masterPoles.poleNumber, poleNumber));
        if (existing.length > 0) {
            return NextResponse.json(existing[0], { status: 200 });
        }

        const [newPole] = await db.insert(masterPoles).values({
            poleNumber,
        }).returning();

        return NextResponse.json(newPole, { status: 201 });
    } catch (err) {
        console.error("POST /master/poles error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
