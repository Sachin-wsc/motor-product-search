import { NextResponse } from "next/server";
import { db } from "@/db";
import { motorTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const allMotorTypes = await db.select().from(motorTypes).orderBy(motorTypes.name);
        return NextResponse.json(allMotorTypes);
    } catch (err) {
        console.error("GET /master/motor-types error", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
        }

        const existing = await db.select().from(motorTypes).where(eq(motorTypes.name, name));
        if (existing.length > 0) {
            return NextResponse.json(existing[0], { status: 200 });
        }

        const newId = crypto.randomUUID();
        await db.insert(motorTypes).values({
            id: newId,
            name,
            description,
        });

        const [newMotorType] = await db.select().from(motorTypes).where(eq(motorTypes.id, newId));

        return NextResponse.json(newMotorType, { status: 201 });
    } catch (err) {
        console.error("POST /master/motor-types error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
