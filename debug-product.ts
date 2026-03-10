import "dotenv/config";
import { db } from "./src/db/index";
import { products, productSpecs } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const id = "399b47a4-f688-47c5-b280-5c80731f2a2d";
    console.log(`Checking product with ID: ${id}`);

    const product = await db.select().from(products).where(eq(products.id, id));
    console.log("Product Record:", JSON.stringify(product, null, 2));

    const specs = await db.select().from(productSpecs).where(eq(productSpecs.productId, id));
    console.log("Specs Record:", JSON.stringify(specs, null, 2));

    process.exit(0);
}

main().catch(console.error);
