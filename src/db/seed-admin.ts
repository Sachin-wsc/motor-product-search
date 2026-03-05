import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Seeding super user...");

    const email = "admin@drivermatch.com";
    const password = "admin";

    // Check if user exists
    const existingAdmins = await db.select().from(users).where(eq(users.email, email));

    if (existingAdmins.length > 0) {
        console.log(`User ${email} already exists. Updating password...`);
        const passwordHash = await bcrypt.hash(password, 10);
        await db.update(users).set({ password: passwordHash, role: "admin" }).where(eq(users.email, email));
        console.log("Password updated successfully.");
    } else {
        const passwordHash = await bcrypt.hash(password, 10);
        await db.insert(users).values({
            email,
            password: passwordHash,
            role: "admin",
        });
        console.log(`Super user ${email} created successfully.`);
    }

    process.exit(0);
}

main().catch((err) => {
    console.error("Error seeding admin:", err);
    process.exit(1);
});
