const ROLES_VALIDOS = ["comprador", "vendedor", "administrador"];

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarRegistro(body) {
  const errores = [];
  const { nombre, correo, password, rol } = body || {};

  if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2) {
    errores.push("nombre es obligatorio y debe tener al menos 2 caracteres.");
  }

  if (!correo || typeof correo !== "string" || !REGEX_CORREO.test(correo)) {
    errores.push("correo es obligatorio y debe tener un formato válido.");
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    errores.push("password es obligatorio y debe tener al menos 6 caracteres.");
  }

  if (!rol || !ROLES_VALIDOS.includes(rol)) {
    errores.push(`rol es obligatorio y debe ser uno de: ${ROLES_VALIDOS.join(", ")}.`);
  }

  return errores;
}

module.exports = { validarRegistro, ROLES_VALIDOS };
