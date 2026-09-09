require("dotenv").config();
const crearApp = require("./app");

const PORT = process.env.PORT || 3000;
const app = crearApp();

app.listen(PORT, () => {
  console.log(`UniMarket CUNOC PoC escuchando en http://localhost:${PORT}`);
  console.log(`  GET  /health`);
  console.log(`  POST /usuarios`);
  console.log(`  GET  /usuarios`);
});
