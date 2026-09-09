const http = require("http");

const PORT = process.env.PORT || 3000;

const req = http.get(`http://127.0.0.1:${PORT}/health`, (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});

req.on("error", () => process.exit(1));
req.setTimeout(2000, () => {
  req.destroy();
  process.exit(1);
});
