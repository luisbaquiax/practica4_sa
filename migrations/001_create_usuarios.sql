CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(120) NOT NULL,
  correo        VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol           VARCHAR(20) NOT NULL CHECK (rol IN ('comprador', 'vendedor', 'administrador')),
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios (rol);
