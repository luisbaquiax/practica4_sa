/**
 * Repositorio de usuarios, implementación en memoria.
 */

let usuarios = [];
let siguienteId = 1;

async function crear({ nombre, correo, passwordHash, rol }) {
  const existente = usuarios.find((u) => u.correo === correo);
  if (existente) {
    const error = new Error("El correo ya está registrado.");
    error.codigo = "CORREO_DUPLICADO";
    throw error;
  }

  const usuario = {
    id: siguienteId++,
    nombre,
    correo,
    passwordHash,
    rol,
    creadoEn: new Date().toISOString(),
  };

  usuarios.push(usuario);
  return usuario;
}

async function listar() {
  return usuarios;
}

// Utilidad solo para pruebas/reinicio manual en el PoC.
function _reset() {
  usuarios = [];
  siguienteId = 1;
}

module.exports = { crear, listar, _reset };
