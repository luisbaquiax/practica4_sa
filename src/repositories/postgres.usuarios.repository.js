const { pool } = require("../db/pool");

const CODIGO_UNIQUE_VIOLATION = "23505"; // código de error de Postgres para UNIQUE constraint

async function crear({ nombre, correo, passwordHash, rol }) {
  const sql = `
    INSERT INTO usuarios (nombre, correo, password_hash, rol)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombre, correo, password_hash AS "passwordHash", rol, creado_en AS "creadoEn"
  `;
  const valores = [nombre, correo, passwordHash, rol];

  try {
    const resultado = await pool.query(sql, valores);
    return resultado.rows[0];
  } catch (err) {
    if (err.code === CODIGO_UNIQUE_VIOLATION) {
      const error = new Error("El correo ya está registrado.");
      error.codigo = "CORREO_DUPLICADO";
      throw error;
    }
    throw err;
  }
}

async function listar() {
  const texto = `
    SELECT id, nombre, correo, password_hash AS "passwordHash", rol, creado_en AS "creadoEn"
    FROM usuarios
    ORDER BY id ASC
  `;
  const resultado = await pool.query(texto);
  return resultado.rows;
}

module.exports = { crear, listar };
