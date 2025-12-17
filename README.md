# Challenge Backend - Agencia de Reserva de Autos

Challenge completado: API backend para gestionar reservas de autos con NestJS, TypeScript y PostgreSQL.

> Los requerimientos originales del challenge se encuentran en [CHALLENGE.md](./CHALLENGE.md).

## Tecnologias Utilizadas

- **Framework**: NestJS + TypeScript
- **Base de datos**: PostgreSQL
- **ORM**: Prisma 7
- **Autenticacion**: JWT (passport-jwt)
- **Validacion**: class-validator
- **Documentacion**: Swagger/OpenAPI
- **Contenedores**: Docker + Docker Compose

## Inicio Rapido con Docker

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd challenge-agencia-autos

# Copiar archivo de configuracion
cp .env.example .env

# Generar JWT_SECRET seguro (reemplazar en .env)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Iniciar con Docker Compose (incluye PostgreSQL)
docker-compose up -d --build

# La API estara disponible en http://localhost:3000
# Documentacion Swagger en http://localhost:3000/api/docs
```

## Configuracion Local (sin Docker)

### Prerequisitos

- Node.js 18+
- PostgreSQL 15+
- npm

### Instalacion

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuracion
cp .env.example .env

# Generar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Actualizar DATABASE_URL y JWT_SECRET en .env
```

### Base de Datos y Migraciones

#### Prisma ORM

Este proyecto utiliza Prisma como ORM. El esquema de la base de datos se define en `prisma/schema.prisma` y las migraciones se generan automaticamente a partir de los cambios en este archivo.

#### Comandos de Migracion

```bash
# 1. Generar el cliente Prisma (necesario antes de ejecutar la aplicacion)
npm run prisma:generate

# 2. Ejecutar migraciones en desarrollo (crea/actualiza tablas)
npm run prisma:migrate

# 3. Ejecutar migraciones en produccion (solo aplica migraciones existentes)
npm run prisma:migrate:deploy
```

**Diferencia entre migrate y migrate:deploy:**
- `prisma:migrate` - Modo desarrollo. Detecta cambios en el schema, genera nuevas migraciones y las aplica. Puede solicitar nombre para la migracion.
- `prisma:migrate:deploy` - Modo produccion. Solo aplica migraciones pendientes sin generar nuevas. Seguro para entornos productivos.

#### Seed (Datos de Prueba)

El archivo `prisma/seed.ts` contiene datos iniciales para probar la aplicacion:

```bash
# Cargar datos de prueba en la base de datos
npm run prisma:seed
```

El seed crea:
- 1 empleado (admin)
- 3 clientes de prueba
- 3 sucursales
- 6 modelos de autos
- Inventario por sucursal
- Descuentos para algunos clientes
- Reservas de ejemplo

> **Nota:** El seed elimina todos los datos existentes antes de insertar los nuevos. No ejecutar en produccion con datos reales.

#### Prisma Studio

Para explorar y editar datos visualmente:

```bash
# Si usas Docker (recomendado)
npm run docker:studio
# Abre interfaz web en http://localhost:5555

# Si tienes PostgreSQL local
npm run prisma:studio
```

### Ejecutar la Aplicacion

```bash
# Modo desarrollo (con hot reload)
npm run start:dev

# Modo produccion
npm run build
npm run start:prod
```

## Variables de Entorno

| Variable | Descripcion | Default |
|----------|-------------|---------|
| `NODE_ENV` | Entorno (development/production) | `development` |
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | Conexion a PostgreSQL | - |
| `JWT_SECRET` | Clave secreta para JWT | - |
| `JWT_EXPIRATION` | Tiempo de expiracion del token | `1d` |

Ejemplo `.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agencia_autos?schema=public
JWT_SECRET=tu-clave-secreta-generada
JWT_EXPIRATION=1d
```

## Documentacion de la API

Swagger UI disponible en `/api/docs` en modo desarrollo.

> Nota: Swagger esta deshabilitado en produccion por seguridad.

## Credenciales de Prueba

Despues de ejecutar los seeds:

**Empleado:**
- Email: `admin@agencia.com`
- Password: `admin123`

**Clientes:**
- Email: `juan.perez@email.com` / Password: `customer123`
- Email: `maria.garcia@email.com` / Password: `customer123`
- Email: `carlos.lopez@email.com` / Password: `customer123`

## Tests

```bash
# Tests unitarios
npm run test

# Modo watch
npm run test:watch

# Reporte de cobertura
npm run test:cov

# Tests E2E
npm run test:e2e
```

## Docker

### Entrypoint

El archivo `docker-entrypoint.sh` se ejecuta automaticamente al iniciar el contenedor y realiza:

1. **Genera el cliente Prisma** - `prisma generate`
2. **Ejecuta migraciones** - `prisma migrate deploy` (modo seguro para produccion)
3. **Inicia la aplicacion** - `npm run start:dev`

Esto garantiza que la base de datos siempre este sincronizada con el schema antes de iniciar la API.

### Comandos Docker

```bash
# Iniciar servicios
docker-compose up -d

# Reconstruir despues de cambios
docker-compose up -d --build

# Ver logs
docker-compose logs -f app

# Detener servicios
docker-compose down

# Reiniciar base de datos (elimina volumenes)
docker-compose down -v
```

## Scripts Disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run start:dev` | Desarrollo con hot reload |
| `npm run start:prod` | Modo produccion |
| `npm run build` | Compilar para produccion |
| `npm run test` | Ejecutar tests unitarios |
| `npm run test:e2e` | Ejecutar tests E2E |
| `npm run lint` | Lint y corregir codigo |
| `npm run format` | Formatear con Prettier |
| `npm run prisma:generate` | Generar cliente Prisma |
| `npm run prisma:migrate` | Ejecutar migraciones (dev) |
| `npm run prisma:migrate:deploy` | Desplegar migraciones (prod) |
| `npm run prisma:seed` | Cargar datos de prueba |
| `npm run prisma:studio` | Abrir Prisma Studio (local) |
| `npm run docker:studio` | Abrir Prisma Studio (Docker) |
