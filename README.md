# UniMarket CUNOC — PoC de API de Usuarios

Prueba de concepto en Node.js + Express para la práctica de comparación de proveedores de nube. Expone una API REST mínima que será desplegada en AWS, GCP, Azure y un cuarto proveedor a elección, para comparar el proceso de despliegue entre plataformas.

## Stack

- **Node.js** + **Express 5** — API REST.
- **bcryptjs** — hash de contraseñas (implementación 100% JavaScript, sin bindings nativos, lo que evita problemas de compilación al desplegar en distintos runtimes serverless de cada proveedor).
- **dotenv** — configuración por variables de entorno.
- Persistencia en memoria por ahora, aislada en `src/repositories/usuarios.repository.js` para poder sustituirla por Postgres (RDS / Cloud SQL / Azure Database / equivalente) sin tocar controllers ni rutas.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Verifica que el servicio esté vivo. |
| POST | `/usuarios` | Registra un usuario (`nombre`, `correo`, `password`, `rol`). |
| GET | `/usuarios` | Lista los usuarios registrados (sin exponer el password). |

### Roles válidos
`comprador`, `vendedor`, `administrador`

## Cómo correrlo localmente

```bash
npm install
cp .env.example .env
npm start
```

El servidor queda disponible en `http://localhost:3000` (o el puerto que definas en `.env`).

Para desarrollo con recarga automática:

```bash
npm run dev
```

## Ejemplos de uso (curl)

**Registrar un usuario:**

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Luis Baquiax","correo":"luis@cunoc.edu.gt","password":"secreta123","rol":"vendedor"}'
```

**Listar usuarios:**

```bash
curl http://localhost:3000/usuarios
```

**Verificar salud del servicio:**

```bash
curl http://localhost:3000/health
```

## Notas de diseño (para el informe)

- El password nunca se devuelve en las respuestas de la API; se hashea con bcrypt (10 salt rounds) antes de guardarse.
- La validación de entrada es manual (sin `express-validator` ni librerías pesadas) a propósito: menos dependencias significa un paquete más liviano, lo cual es relevante al comparar *cold starts* de funciones serverless entre proveedores.
- La capa de persistencia (`repositories/usuarios.repository.js`) está aislada deliberadamente: al desplegar en cada nube, solo esa pieza cambia según el servicio de base de datos gestionado que se use (RDS, Cloud SQL, Azure Database for PostgreSQL, u otro).

## Persistencia: memoria vs. Postgres real

La app detecta automáticamente qué usar según la variable de entorno `DATABASE_URL`:

- **Sin `DATABASE_URL`** → almacenamiento en memoria (útil para desarrollo rápido; los datos se pierden al reiniciar el proceso).
- **Con `DATABASE_URL`** → Postgres real, compatible con RDS, Cloud SQL, Azure Database for PostgreSQL, o DigitalOcean Managed Database, sin cambiar una sola línea de código de la aplicación.

### Correr la migración

Antes del primer arranque contra una base de datos nueva:

```bash
DATABASE_URL="postgres://usuario:password@host:5432/basededatos" npm run migrate
```

Si la base de datos gestionada no usa TLS (poco común en producción, pero sí en Postgres local), agrega `DB_SSL=false`.

### Probar con Postgres local (Docker Compose)

El `docker-compose.yml` ya incluye un servicio `db` con Postgres 16, listo para desarrollo:

```bash
docker compose up --build
```

Compose ejecuta la migración automáticamente después de que PostgreSQL esté listo y antes de iniciar la API.

### `/health` con verificación de base de datos

Cuando `DATABASE_URL` está configurada, `/health` ejecuta un `SELECT 1` real contra la base de datos y lo reporta:

```json
{
  "status": "ok",
  "baseDeDatos": "conectada",
  "...": "..."
}
```

Si la base de datos no responde, `/health` devuelve `503` con `"status":"degradado"` — útil como evidencia de funcionamiento (o de fallo) al documentar cada despliegue en el informe.

## Cómo correrlo con Docker

Construir la imagen:

```bash
docker build -t unimarket-cunoc-poc .
```

Correr el contenedor:

```bash
docker run -p 3000:3000 --name unimarket-poc unimarket-cunoc-poc
```

O con Docker Compose (más cómodo para desarrollo local):

```bash
docker compose up --build
```

Verificar que el contenedor está sano:

```bash
docker ps                # la columna STATUS debe decir "healthy" tras ~10-15s
curl http://localhost:3000/health
```

### Notas sobre la imagen

- **Multi-stage build**: la etapa `deps` instala dependencias de producción (`npm ci --omit=dev`) y la etapa `runtime` solo copia lo estrictamente necesario — la imagen final no incluye `devDependencies`, ni el código fuente de instalación de npm, lo que la mantiene liviana (relevante para comparar tiempos de *cold start* entre proveedores serverless/contenedores).
- **Base `node:20-alpine`**: imagen base pequeña, reduce superficie de ataque y tiempo de descarga/build en cada proveedor.
- **Usuario no-root**: el contenedor corre como el usuario `node` (no root), buena práctica de seguridad a mencionar en la sección correspondiente del informe.
- **HEALTHCHECK nativo**: usa `healthcheck.js` (con el módulo `http` de Node) en vez de `curl`/`wget`, evitando instalar paquetes adicionales en la imagen solo para el healthcheck.

## Despliegue en los 4 proveedores de nube

Este mismo Dockerfile, sin modificaciones, es compatible con los servicios de contenedor administrado de los cuatro proveedores de la práctica:

| Proveedor | Servicio | Notas |
|---|---|---|
| AWS | App Runner | Conecta directo al repo de GitHub; detecta el Dockerfile automáticamente. |
| Google Cloud | Cloud Run | Puede construir desde el repo o desde una imagen en Artifact Registry. |
| Azure | Container Apps | Soporta CI/CD nativo con GitHub Actions. |
| DigitalOcean | App Platform | Detecta el Dockerfile del repo y lo despliega sin configuración adicional. |

Todos escuchan en el puerto expuesto por el contenedor (`3000` en este caso) y usan `/health` como endpoint de verificación de que el despliegue está vivo.


## Próximos pasos (siguientes fases de la práctica)

1. ~~Sustituir el repositorio en memoria por uno con Postgres real.~~ ✅ Listo — ver sección de persistencia arriba.
2. Repetir el despliegue en los 4 proveedores, cada uno con su propia base de datos gestionada (RDS, Cloud SQL, Azure Database, o el cuarto proveedor), y documentar tiempo, dificultades y costo real de cada uno.
3. Adaptar el punto de entrada a formato serverless (handler) para AWS Lambda / Cloud Functions / Azure Functions si se decide probar esa variante en vez de contenedores.
