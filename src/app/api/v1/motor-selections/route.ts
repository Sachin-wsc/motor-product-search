import { NextResponse } from "next/server";
import { db } from "@/db";
import { motorSelections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const allSelections = await db.select().from(motorSelections);
        return NextResponse.json(allSelections);
    } catch (err: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            inquiryId,
            motorTypeId,
            kw,
            applicationId,
            totalMotors,
            motorsPerGroup,
            poleId,
            voltageId,
            frequencyId,
            armVoltage,
            fieldVoltage,
            fieldCurrent
        } = body;

        if (!motorTypeId || !kw) {
            return NextResponse.json({ error: "Motor type and kW are required" }, { status: 400 });
        }

        const newId = crypto.randomUUID();
        await db.insert(motorSelections).values({
            id: newId,
            inquiryId: inquiryId || null,
            motorTypeId,
            kw,
            applicationId: applicationId || null,
            totalMotors: totalMotors || null,
            motorsPerGroup: motorsPerGroup || null,
            poleId: poleId || null,
            voltageId: voltageId || null,
            frequencyId: frequencyId || null,
            armVoltage: armVoltage || null,
            fieldVoltage: fieldVoltage || null,
            fieldCurrent: fieldCurrent || null,
        });

        const [newSelection] = await db.select().from(motorSelections).where(eq(motorSelections.id, newId));

        return NextResponse.json(newSelection, { status: 201 });
    } catch (err: any) {
        console.error("Motor Selections API error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
