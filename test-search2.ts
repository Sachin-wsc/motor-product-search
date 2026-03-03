import { db } from "./src/db";
import { products, productSpecs, equationConfigs } from "./src/db/schema";
import { eq, sql } from "drizzle-orm";

async function run() {
    console.log("FETCHING EQUATIONS")
    const configs = await db
        .select()
        .from(equationConfigs)
        .where(eq(equationConfigs.isActive, true));
        
    console.log("ACTIVE EQUATIONS:", configs);
    process.exit(0);
}
run();
