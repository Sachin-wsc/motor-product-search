import { NextResponse } from "next/server";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }

        await db.update(inquiries)
            .set({ status })
            .where(eq(inquiries.id, id));

        const [updatedInquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));

        if (!updatedInquiry) {
            return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
        }

        return NextResponse.json(updatedInquiry);
    } catch (err: any) {
        console.error("PATCH /inquiries/[id] error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
