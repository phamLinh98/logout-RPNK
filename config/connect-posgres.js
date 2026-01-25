import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.POSTGRES_STRING,
});

pool
  .query("SELECT 1")
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => {
    console.error("PostgreSQL connection error", err);
    process.exit(1);
  });
