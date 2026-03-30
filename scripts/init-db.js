const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
}

const pool = new Pool({
    connectionString: databaseUrl,
});

async function main() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
      CREATE TABLE IF NOT EXISTS task (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        detail TEXT,
        status TEXT NOT NULL DEFAULT 'uncomplete',
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_task_status
      ON task(status)
    `);

        await client.query("COMMIT");
        console.log("✅ DB initialized successfully");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ DB init failed:", err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
