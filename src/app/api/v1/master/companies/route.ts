import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const allCompanies = await db.select().from(companies).orderBy(companies.name);
        return NextResponse.json(allCompanies);
    } catch (err) {
        console.error("GET /master/companies error", err);
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

        // Check if it already exists
        const existing = await db.select().from(companies).where(eq(companies.name, name));
        if (existing.length > 0) {
            return NextResponse.json(existing[0], { status: 200 });
        }

        const newId = crypto.randomUUID();
        await db.insert(companies).values({
            id: newId,
            name,
            description,
        });

        const [newCompany] = await db.select().from(companies).where(eq(companies.id, newId));

        return NextResponse.json(newCompany, { status: 201 });
    } catch (err) {
        console.error("POST /master/companies error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
