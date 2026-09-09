const { Pool } = require("pg");

const ssl = process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de Postgres:", err.message);
});

async function verificarConexion() {
  const res = await pool.query("SELECT 1 AS ok");
  return res.rows[0].ok === 1;
}

module.exports = { pool, verificarConexion };
