import { NextResponse } from "next/server";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        // Admin only in real app, secured by JWT middleware
        const allInquiries = await db.select().from(inquiries);
        return NextResponse.json(allInquiries);
    } catch (err: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, customerName, customerEmail, companyName, message, userSearchInputs } = body;

        if (!customerName || !customerEmail) {
            return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
        }

        const [newInquiry] = await db.insert(inquiries).values({
            productId,
            customerName,
            customerEmail,
            companyName,
            message,
            userSearchInputs,
        }).returning();

        return NextResponse.json(newInquiry, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
