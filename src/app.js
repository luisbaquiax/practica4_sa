const express = require("express");
const usuariosRoutes = require("./routes/usuarios.routes");
const { verificarConexion } = require("./db/pool");

function crearApp() {
  const app = express();

  app.use(express.json());

  // Endpoint de salud
  app.get("/health", async (_req, res) => {
    const salud = {
      status: "ok",
      servicio: "unimarket-cunoc-poc",
      timestamp: new Date().toISOString(),
      uptimeSegundos: process.uptime(),
      baseDeDatos: "no-configurada",
    };

    if (process.env.DATABASE_URL) {
      try {
        await verificarConexion();
        salud.baseDeDatos = "conectada";
      } catch (err) {
        salud.status = "degradado";
        salud.baseDeDatos = "error";
        salud.errorBaseDeDatos = err.message;
        return res.status(503).json(salud);
      }
    }

    return res.status(200).json(salud);
  });

  app.use("/usuarios", usuariosRoutes);

  // 404 para rutas no definidas
  app.use((_req, res) => {
    res.status(404).json({ error: "Recurso no encontrado." });
  });

  return app;
}

module.exports = crearApp;

