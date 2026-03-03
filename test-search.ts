import { db } from "./src/db";
import { products, productSpecs, equationConfigs } from "./src/db/schema";
import { eq, sql } from "drizzle-orm";

async function run() {
    const requiredPower = 19800;
    
    console.log("TESTING DRIZZLE QUERY FOR POWER >=", requiredPower);
    const matchingSpecs = await db
        .select({
            id: products.id,
            name: products.name,
            ratedPower: productSpecs.ratedPower
        })
        .from(productSpecs)
        .innerJoin(products, eq(productSpecs.productId, products.id))
        .where(sql`CAST(${productSpecs.ratedPower} AS NUMERIC) >= ${requiredPower}`);
        
    console.log("MATCHING PRODUCTS:", matchingSpecs);

    const all = await db
        .select({ id: products.id, name: products.name, ratedPower: productSpecs.ratedPower })
        .from(productSpecs)
        .innerJoin(products, eq(productSpecs.productId, products.id));
    console.log("ALL PRODUCTS:", all);

    console.log("\nTESTING WITH STRING COMPARISON (old way)");
    const oldWay = await db
        .select({ id: products.id, name: products.name, ratedPower: productSpecs.ratedPower })
        .from(productSpecs)
        .innerJoin(products, eq(productSpecs.productId, products.id))
        .where(sql`${productSpecs.ratedPower} >= ${requiredPower.toString()}`);
    console.log("OLD WAY MATCHES:", oldWay);
    
    process.exit(0);
}
run();
