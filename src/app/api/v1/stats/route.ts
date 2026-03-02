import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, equationConfigs, inquiries } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function GET() {
    try {
        const [totalProducts] = await db.select({ value: count() }).from(products);

        const [activeEquations] = await db
            .select({ value: count() })
            .from(equationConfigs)
            .where(eq(equationConfigs.isActive, true));

        const [totalInquiries] = await db.select({ value: count() }).from(inquiries);

        return NextResponse.json({
            totalProducts: totalProducts.value,
            activeEquations: activeEquations.value,
            totalInquiries: totalInquiries.value,
        });
    } catch (err: any) {
        console.error("GET /stats error", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
