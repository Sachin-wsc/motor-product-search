import { NextResponse } from "next/server";
import { db } from "@/db";
import { equationConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const configs = await db
            .select()
            .from(equationConfigs)
            .orderBy(desc(equationConfigs.createdAt));

        return NextResponse.json(configs);
    } catch (err: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { keyName, formulaString, constantValue, description } = body;

        // Deactivate all existing equations
        await db.update(equationConfigs).set({ isActive: false });

        const [newConfig] = await db.insert(equationConfigs).values({
            keyName,
            formulaString,
            constantValue,
            description,
            isActive: true
        }).returning();

        return NextResponse.json(newConfig, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
