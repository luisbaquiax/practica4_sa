const { Router } = require("express");
const controller = require("../controllers/usuarios.controller");

const router = Router();

// POST /usuarios  -> Registro de usuario
router.post("/", controller.registrar);

// GET /usuarios   -> Listado de usuarios
router.get("/", controller.listar);

module.exports = router;
