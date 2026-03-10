import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
        }

        await db.update(companies)
            .set({ name, description, updatedAt: new Date() })
            .where(eq(companies.id, id));

        const [updatedCompany] = await db.select().from(companies).where(eq(companies.id, id));

        if (!updatedCompany) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        return NextResponse.json(updatedCompany, { status: 200 });
    } catch (err) {
        console.error(`PATCH /master/companies/ error:`, err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        // Ensure no products are linked using this company before deleting.
        const linkedProducts = await db.select().from(products).where(eq(products.companyId, id));
        if (linkedProducts.length > 0) {
            ``
            return NextResponse.json({ error: "Cannot delete company with associated products." }, { status: 400 });
        }

        // Fetch before delete to return info
        const [deletedCompany] = await db.select().from(companies).where(eq(companies.id, id));

        if (!deletedCompany) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        await db.delete(companies)
            .where(eq(companies.id, id));

        if (!deletedCompany) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        return NextResponse.json(deletedCompany, { status: 200 });
    } catch (err) {
        console.error(`DELETE /master/companies/ error:`, err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
