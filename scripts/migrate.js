/**
 * Ejecuta migrations/001_create_usuarios.sql contra la base de datos
 * indicada en DATABASE_URL. Se corre una sola vez por entorno
 * (local, o cada proveedor de nube) antes de levantar la API.
 *
 * Uso:
 *   DATABASE_URL=postgres://user:pass@host:5432/db node scripts/migrate.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("ERROR: falta la variable de entorno DATABASE_URL.");
    process.exit(1);
  }

  const ssl = process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false };
  const client = new Client({ connectionString, ssl });

  const sqlPath = path.join(__dirname, "..", "migrations", "001_create_usuarios.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  try {
    await client.connect();
    console.log("Conectado. Ejecutando migración 001_create_usuarios.sql ...");
    await client.query(sql);
    console.log("Migración aplicada correctamente.");
  } catch (err) {
    console.error("Error al ejecutar la migración:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
