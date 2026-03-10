import { NextResponse } from "next/server";
import { db } from "@/db";
import { equationConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        let updateData: any = { updatedAt: new Date() };

        if (body.isActive !== undefined) {
            updateData.isActive = body.isActive;
            if (body.isActive) {
                // Deactivate all existing equations before activating this one
                await db.update(equationConfigs).set({ isActive: false });
            }
        }

        if (body.keyName !== undefined) updateData.keyName = body.keyName;
        if (body.formulaString !== undefined) updateData.formulaString = body.formulaString;
        if (body.constantValue !== undefined) updateData.constantValue = body.constantValue;
        if (body.description !== undefined) updateData.description = body.description;

        // Update the specific equation
        await db.update(equationConfigs)
            .set(updateData)
            .where(eq(equationConfigs.id, id));

        const [updatedConfig] = await db.select().from(equationConfigs).where(eq(equationConfigs.id, id));

        if (!updatedConfig) {
            return NextResponse.json({ error: "Equation not found" }, { status: 404 });
        }

        return NextResponse.json(updatedConfig);
    } catch (err: any) {
        console.error("PATCH /equations/[id] error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
