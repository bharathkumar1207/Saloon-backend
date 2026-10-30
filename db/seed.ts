import "dotenv/config";
import { pool } from "./db.config";
import { hashPassword } from "../src/core/users";

async function main() {
  const email = process.env.SEED_MANAGER_EMAIL;
  const password = process.env.SEED_MANAGER_PASSWORD;
  const name = process.env.SEED_MANAGER_NAME ?? "Manager";

  if (!email || !password) {
    throw new Error(
      "Set SEED_MANAGER_EMAIL and SEED_MANAGER_PASSWORD in .env before seeding.",
    );
  }

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    console.log(`Manager account for ${email} already exists, skipping.`);
    await pool.end();
    return;
  }

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'manager')`,
    [name, email, hashPassword(password)],
  );

  console.log(`Created manager account: ${email}`);
  await pool.end();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
