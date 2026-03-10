import { NextResponse } from "next/server";
import { db } from "@/db";
import { masterApplications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const allApps = await db.select().from(masterApplications).orderBy(masterApplications.name);
        return NextResponse.json(allApps);
    } catch (err) {
        console.error("GET /master/applications error", err);
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

        const existing = await db.select().from(masterApplications).where(eq(masterApplications.name, name));
        if (existing.length > 0) {
            return NextResponse.json(existing[0], { status: 200 });
        }

        const newId = crypto.randomUUID();
        await db.insert(masterApplications).values({
            id: newId,
            name,
            description,
        });

        const [newApp] = await db.select().from(masterApplications).where(eq(masterApplications.id, newId));

        return NextResponse.json(newApp, { status: 201 });
    } catch (err) {
        console.error("POST /master/applications error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
