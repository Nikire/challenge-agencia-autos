# Challenge Backend – Agencia de Reserva de Autos

Construí una API backend que permita gestionar reservas de autos para una agencia X (Podés inventarle un nombre a tu agencia). El challenge está centrado 100% en backend (no se requiere frontend), pero debe contemplar dos áreas funcionales: pública (clientes) y backoffice (empleados).

## Objetivo

Diseñá y desarrollá un CRUD/servicio de reservas que permita:

- **Público**: registro de clientes, búsqueda/elección de auto, selección de sucursal de retiro y creación de reservas.
- **Backoffice**: gestión de stock por sucursal, consulta de disponibilidad, aplicación de descuentos especiales a clientes y consulta de reservas.

## Alcance y consideraciones

- **_Solo backend_**. Sugerimos realizar el proyecto en **Nest.js + TypeScript**.
- **Base de datos recomendada: Postgres.** Podés elegir otra (relacional o no relacional) si la justificás.
- Entregá documentación de la API **(OpenAPI/Swagger)**.
- Incluí **migraciones** o scripts de inicialización del esquema.
- Implementá autenticación/autorización con **JWT** o **equivalente**. Roles: `customer` y `employee`.
- **Manejá errores** de forma consistente y validá las entradas.

## Reglas de negocio mínimas

1. **Registro y login de clientes y empleados** con contraseña hasheada (Podés elegir el sistema de hash que te sientas más cómodo).
2. Una reserva es válida solo si existe **disponibilidad del vehículo**.
3. **Descuentos especiales:** si un cliente tiene uno o más descuentos vigentes, aplica el mejor (mayor beneficio) automáticamente al crear la reserva.
4. **Cancelación:** Proponé una regla de cancelación para la reserva.
5. **Seguridad/roles:** endpoints públicos requieren autenticación de cliente cuando corresponda (p.ej. ver/cancelar mis reservas). Endpoints de backoffice requieren autenticación de empleado.

## Endpoints mínimos

Podés ajustar rutas/nombres, pero debe existir **funcionalidad equivalente**.

### Público (Cliente)

- **POST /auth/register**
  - Creá cliente.
- **POST /auth/login**
  - Autenticá cliente.
- **GET /cars**
  - Listá vehículos disponibles.
- **GET /cars/{id-uuid-etc-etc-etc}**
  - Detalle del vehículo.
- **POST /reservations**
  - Creá reserva para el cliente autenticado.
  - Aplicá descuento vigente automáticamente.
- **GET /reservations/me**
  - Listá reservas del cliente autenticado con filtros básicos.
- **DELETE /reservations/{id-uuid-etc-etc-etc}**
  - Cancelá una reserva del cliente si cumple las condiciones que propusiste.

### Backoffice (Empleado)

- **POST /admin/auth/login**
  - Autenticá empleado.
- **POST /admin/cars**
  - Creá modelo de auto.
- **PUT /admin/cars/{id-uuid-etc-etc-etc}**
  - Actualizá datos del modelo.
- **POST /admin/inventory**
  - Creá/actualizá stock.
- **GET /admin/availability**
  - Consultá disponibilidad.
- **POST /admin/discounts**
  - Creá descuento para cliente.
- **GET /admin/reservations**
  - Listá reservas.

## Requisitos técnicos

- **Validá la entrada**.
- **Manejá errores** con respuestas claras (códigos 4xx/5xx y payload de error consistente).
- **Usá JWT y autorización por rol** (guards/middlewares).
- **Incluí migraciones** de base de datos.
- **Incluí seeds** opcionales para datos iniciales (sucursales, modelos, inventario, usuario empleado demo).
- **Documentá la API** (OpenAPI/Swagger).
- **Incluí un Dockerfile**

## Qué entregar

- **Código fuente** en un repositorio público.
- **README del proyecto** con:
  - **Cómo levantar el entorno local** (ideal: Docker Compose con DB).
  - **Variables de entorno** y ejemplos (.env.example).
  - **Migraciones y seeds**: cómo correrlas.
  - **Ejecución** en modo dev y prod.
  - **Documentación de la API** (Swagger/colección).
  - **Documentación adicional** que consideres necesaria para el despliegue y uso de tu proyecto

## Criterios de evaluación

- **Correctitud funcional y reglas de negocio** (disponibilidad real, descuentos, precio, cancelación).
- **Diseño de modelo de datos y consistencia** (normalización, claves, constraints, índices básicos).
- **Calidad del código**: claridad, nombres, separación de capas, tests.
- **Seguridad**: hashing de contraseñas, validación, autorización por rol, hardening básico.
- **Observabilidad**: logs útiles; métricas opcionales.

## Plazos y envío

- **Tiempo estimado**: Entrega sugerida: 5-7 días.

¡Éxitos!
