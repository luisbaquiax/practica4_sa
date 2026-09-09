/**
 * Punto único de acceso a la persistencia de usuarios.
 *
 */
const driver = process.env.DATABASE_URL
  ? require("./postgres.usuarios.repository")
  : require("./memoria.usuarios.repository");

if (!process.env.DATABASE_URL) {
  console.warn(
    "[usuarios.repository] DATABASE_URL no definida: usando almacenamiento en memoria (los datos se pierden al reiniciar)."
  );
}

module.exports = driver;
