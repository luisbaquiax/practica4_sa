const bcrypt = require("bcryptjs");
const repositorio = require("../repositories/usuarios.repository");
const { validarRegistro } = require("../utils/validacion");

const SALT_ROUNDS = 10;

async function registrar(req, res) {
  const errores = validarRegistro(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ error: "Datos inválidos", detalles: errores });
  }

  const { nombre, correo, password, rol } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuario = await repositorio.crear({ nombre, correo, passwordHash, rol });

    // Nunca se devuelve passwordHash en la respuesta.
    const { passwordHash: _omitido, ...usuarioSeguro } = usuario;
    return res.status(201).json(usuarioSeguro);
  } catch (err) {
    if (err.codigo === "CORREO_DUPLICADO") {
      return res.status(409).json({ error: err.message });
    }
    console.error("Error al registrar usuario:", err);
    return res.status(500).json({ error: "Error interno al registrar el usuario." });
  }
}

async function listar(_req, res) {
  try {
    const usuarios = await repositorio.listar();
    const usuariosSeguros = usuarios.map(({ passwordHash, ...resto }) => resto);
    return res.status(200).json(usuariosSeguros);
  } catch (err) {
    console.error("Error al listar usuarios:", err);
    return res.status(500).json({ error: "Error interno al listar usuarios." });
  }
}

module.exports = { registrar, listar };
